<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Models\FamilyMember;
use FamilyCompass\Repositories\FamilyMemberRepository;

final class FamilyMemberService
{
    private const ROLES = ['ADMIN', 'PARENT', 'CHILD'];

    public function __construct(private FamilyMemberRepository $repository) {}

    /** @return list<array<string, mixed>> */
    public function list(): array
    {
        return array_map(static fn (FamilyMember $member): array => $member->toArray(), $this->repository->all());
    }

    /** @param array<string, mixed> $input */
    public function create(array $input): array
    {
        $data = $this->validatedData($input, true);
        $now = gmdate('c');
        $member = $this->repository->create($data + [
            'uuid' => $this->uuid(),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        return $member->toArray();
    }

    /** @param array<string, mixed> $input */
    public function update(string $uuid, array $input): array
    {
        $existing = $this->repository->find($uuid);
        if ($existing === null) {
            throw new AppException('NOT_FOUND', 'Das Familienmitglied wurde nicht gefunden.', 404);
        }
        $data = $this->validatedData($input, false, $existing);
        return $this->repository->update($uuid, $data + ['updated_at' => gmdate('c')])->toArray();
    }

    public function delete(string $uuid): void
    {
        if (!$this->repository->softDelete($uuid)) {
            throw new AppException('NOT_FOUND', 'Das Familienmitglied wurde nicht gefunden.', 404);
        }
    }

    /** @param array<string, mixed> $input */
    private function validatedData(array $input, bool $creating, ?FamilyMember $existing = null): array
    {
        $name = array_key_exists('name', $input) ? trim((string) $input['name']) : ($existing?->name ?? '');
        if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
            throw new AppException('VALIDATION_ERROR', 'Der Name muss zwischen 2 und 80 Zeichen lang sein.', 422);
        }

        $color = array_key_exists('color', $input) ? strtoupper((string) $input['color']) : ($existing?->color ?? '#345B48');
        if (preg_match('/^#[0-9A-F]{6}$/', $color) !== 1) {
            throw new AppException('VALIDATION_ERROR', 'Die Farbe muss ein sechsstelliger Hex-Farbwert sein.', 422);
        }

        $role = array_key_exists('role', $input) ? strtoupper((string) $input['role']) : ($existing?->role ?? 'CHILD');
        if (!in_array($role, self::ROLES, true)) {
            throw new AppException('VALIDATION_ERROR', 'Die Rolle ist ungültig.', 422);
        }

        $isActive = array_key_exists('isActive', $input)
            ? filter_var($input['isActive'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : ($existing?->isActive ?? true);
        if ($isActive === null) {
            throw new AppException('VALIDATION_ERROR', 'Der Aktiv-Status ist ungültig.', 422);
        }

        $avatarUrl = array_key_exists('avatarUrl', $input) ? trim((string) $input['avatarUrl']) : ($existing?->avatarUrl ?? null);
        if ($avatarUrl === '') {
            $avatarUrl = null;
        }
        if ($avatarUrl !== null && (mb_strlen($avatarUrl) > 500 || filter_var($avatarUrl, FILTER_VALIDATE_URL) === false)) {
            throw new AppException('VALIDATION_ERROR', 'Die Avatar-URL ist ungültig.', 422);
        }

        $pinHash = null;
        $passwordHash = null;
        $clearPinHash = 0;
        $clearPasswordHash = 0;

        if ($role === 'CHILD') {
            $clearPasswordHash = 1;
            if (array_key_exists('pin', $input)) {
                $pin = (string) $input['pin'];
                if ($pin === '') {
                    $clearPinHash = 1;
                } elseif (preg_match('/^\d{4,8}$/', $pin) !== 1) {
                    throw new AppException('VALIDATION_ERROR', 'Die PIN muss aus 4 bis 8 Ziffern bestehen.', 422);
                } else {
                    $pinHash = password_hash($pin, PASSWORD_DEFAULT);
                }
            }
        } else {
            $clearPinHash = 1;
            $password = array_key_exists('password', $input) ? (string) $input['password'] : '';
            $passwordRequired = $creating || $existing?->role === 'CHILD';
            if ($passwordRequired && strlen($password) < 8) {
                throw new AppException('VALIDATION_ERROR', 'Passwörter für Erwachsene müssen mindestens 8 Zeichen lang sein.', 422);
            }
            if ($password !== '') {
                if (strlen($password) < 8 || strlen($password) > 128) {
                    throw new AppException('VALIDATION_ERROR', 'Passwörter für Erwachsene müssen zwischen 8 und 128 Zeichen lang sein.', 422);
                }
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            }
        }

        $data = [
            'name' => $name,
            'color' => $color,
            'role' => $role,
            'pin_hash' => $pinHash,
            'password_hash' => $passwordHash,
            'avatar_url' => $avatarUrl,
            'is_active' => $isActive ? 1 : 0,
        ];
        if (!$creating) {
            $data['clear_pin_hash'] = $clearPinHash;
            $data['clear_password_hash'] = $clearPasswordHash;
        }
        return $data;
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
