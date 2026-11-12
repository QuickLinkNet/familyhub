<?php
declare(strict_types=1);

namespace FamilyCompass\Controllers;

use FamilyCompass\Core\AppException;
use FamilyCompass\Core\PublicUrl;
use FamilyCompass\Core\Response;
use FamilyCompass\Services\GoogleCalendarService;
use FamilyCompass\Services\GoogleOAuthService;

final class GoogleCalendarController
{
    public function __construct(
        private GoogleOAuthService $oauth,
        private GoogleCalendarService $calendars,
        private PublicUrl $urls
    ) {}

    public function status(): void
    {
        Response::success($this->oauth->status($this->callbackUrl()) + ['calendars' => $this->calendars->sources()]);
    }

    public function configure(): void
    {
        $this->oauth->configure($this->input());
        $this->calendars->clear();
        Response::success($this->oauth->status($this->callbackUrl()) + ['calendars' => []]);
    }

    public function authorize(): void { Response::success($this->oauth->beginAuthorization($this->callbackUrl())); }

    public function callback(): void
    {
        try {
            $accessToken = $this->oauth->completeAuthorization($_GET, $this->callbackUrl());
            $this->calendars->importCalendars($accessToken);
            $this->redirect('connected');
        } catch (AppException $exception) {
            $this->redirect('error', $exception->errorCode());
        }
    }

    public function updateSource(string $uuid): void
    {
        $input = $this->input();
        $active = filter_var($input['isActive'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($active === null) { throw new AppException('VALIDATION_ERROR', 'Die Kalenderauswahl ist ungültig.', 422); }
        Response::success($this->calendars->setSourceActive($uuid, $active));
    }

    public function synchronize(string $uuid): void { Response::success($this->calendars->synchronize($uuid)); }

    public function verify(): void { Response::success($this->calendars->verifyConnection()); }

    public function disconnect(): void
    {
        $this->oauth->disconnect();
        $this->calendars->clear();
        Response::noContent();
    }

    /** @return array<string, mixed> */
    private function input(): array
    {
        $raw = file_get_contents('php://input');
        try { $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein gültiger JSON-Request erwartet.', 400); }
        if (!is_array($input) || $input === [] || \FamilyCompass\Core\ArrayShape::isList($input)) { throw new AppException('VALIDATION_ERROR', 'Es wurde ein JSON-Objekt erwartet.', 400); }
        return $input;
    }

    private function callbackUrl(): string { return $this->urls->api('google-calendar/oauth/callback'); }

    private function redirect(string $result, ?string $code = null): never
    {
        $query = ['google' => $result];
        if ($code !== null) { $query['code'] = $code; }
        header('Cache-Control: no-store');
        header('Location: ' . $this->urls->app('admin') . '?' . http_build_query($query));
        exit;
    }
}
