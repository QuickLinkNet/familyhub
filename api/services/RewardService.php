<?php
declare(strict_types=1);

namespace FamilyCompass\Services;

use FamilyCompass\Core\AppException;
use FamilyCompass\Repositories\FamilyMemberRepository;
use FamilyCompass\Repositories\RewardRepository;

final class RewardService
{
    private const ICONS = ['🎁', '🍦', '🎬', '🎮', '🍕', '🎡', '📚', '⭐', '🏆', '🎨', '⚽', '🧸'];

    public function __construct(private RewardRepository $rewards, private FamilyMemberRepository $members) {}

    /** @return array<string, mixed> */
    public function dashboard(): array { return $this->rewards->dashboard(); }

    /** @param array<string, mixed> $input @param array{id: string, name: string, color: string, role: string} $actor */
    public function create(array $input, array $actor): array
    {
        $title = trim((string) ($input['title'] ?? ''));
        $description = trim((string) ($input['description'] ?? ''));
        $cost = filter_var($input['costPoints'] ?? null, FILTER_VALIDATE_INT);
        $icon = (string) ($input['icon'] ?? '🎁');
        $color = (string) ($input['color'] ?? '#D6855F');
        if (mb_strlen($title) < 2 || mb_strlen($title) > 80) {
            throw new AppException('VALIDATION_ERROR', 'Der Name muss zwischen 2 und 80 Zeichen lang sein.', 422);
        }
        if (mb_strlen($description) > 500 || $cost === false || $cost < 1 || $cost > 10000) {
            throw new AppException('VALIDATION_ERROR', 'Beschreibung oder Punktewert ist ungültig.', 422);
        }
        if (!in_array($icon, self::ICONS, true) || preg_match('/^#[0-9A-Fa-f]{6}$/', $color) !== 1) {
            throw new AppException('VALIDATION_ERROR', 'Symbol oder Farbe ist ungültig.', 422);
        }
        $now = gmdate('c');
        $this->rewards->create([
            'uuid' => $this->uuid(), 'title' => $title, 'description' => $description === '' ? null : $description,
            'cost_points' => $cost, 'icon' => $icon, 'color' => strtoupper($color),
            'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now,
        ]);
        return $this->dashboard();
    }

    public function delete(string $uuid): void
    {
        if (!$this->rewards->softDelete($uuid)) {
            throw new AppException('NOT_FOUND', 'Die Belohnung wurde nicht gefunden.', 404);
        }
    }

    /** @param array<string, mixed> $input @param array{id: string, name: string, color: string, role: string} $actor */
    public function redeem(string $rewardUuid, array $input, array $actor): array
    {
        $reward = $this->rewards->find($rewardUuid) ?? throw new AppException('NOT_FOUND', 'Die Belohnung wurde nicht gefunden.', 404);
        $memberUuid = $actor['role'] === 'CHILD' ? $actor['id'] : (string) ($input['memberId'] ?? '');
        $member = $this->members->find($memberUuid);
        if ($member === null || !$member->isActive) {
            throw new AppException('VALIDATION_ERROR', 'Bitte wähle ein aktives Familienmitglied.', 422);
        }
        $cost = (int) $reward['cost_points'];
        $success = $this->rewards->redeem([
            'uuid' => $this->uuid(), 'member_uuid' => $memberUuid, 'reward_uuid' => $rewardUuid,
            'entry_type' => 'REDEEMED', 'points_delta' => -$cost, 'reason' => 'Eingelöst: ' . $reward['title'],
            'created_by_member_uuid' => $actor['id'], 'created_at' => gmdate('c'),
        ], $cost);
        if (!$success) {
            throw new AppException('INSUFFICIENT_POINTS', 'Für diese Belohnung fehlen noch Punkte.', 409);
        }
        return $this->dashboard();
    }

    /** @param array<string, mixed> $input @param array{id: string, name: string, color: string, role: string} $actor */
    public function bonus(array $input, array $actor): array
    {
        $memberUuid = (string) ($input['memberId'] ?? '');
        $points = filter_var($input['points'] ?? null, FILTER_VALIDATE_INT);
        $reason = trim((string) ($input['reason'] ?? ''));
        $member = $this->members->find($memberUuid);
        if ($member === null || !$member->isActive || $points === false || $points < 1 || $points > 500 || mb_strlen($reason) < 2 || mb_strlen($reason) > 160) {
            throw new AppException('VALIDATION_ERROR', 'Mitglied, Punkte oder Begründung ist ungültig.', 422);
        }
        $this->rewards->addEntry([
            'uuid' => $this->uuid(), 'member_uuid' => $memberUuid, 'reward_uuid' => null,
            'entry_type' => 'BONUS', 'points_delta' => $points, 'reason' => $reason,
            'created_by_member_uuid' => $actor['id'], 'created_at' => gmdate('c'),
        ]);
        return $this->dashboard();
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
