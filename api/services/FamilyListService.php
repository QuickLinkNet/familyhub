<?php
declare(strict_types=1);

namespace FamilyHub\Services;

use FamilyHub\Core\AppException;
use FamilyHub\Repositories\FamilyListRepository;
use FamilyHub\Repositories\FamilyMemberRepository;

final class FamilyListService
{
    private const ICONS = ['📋', '🧳', '🏠', '🎉', '💡', '🎁', '🛠️', '🌱'];
    private const COLORS = ['#345B48', '#D6855F', '#6C8AB8', '#8A7060', '#6A7E3A', '#9A6C8D', '#D09A38', '#4C8C91'];
    private const VISIBILITIES = ['FAMILY', 'ADULTS', 'PRIVATE'];

    public function __construct(private FamilyListRepository $lists, private FamilyMemberRepository $members) {}

    /** @param array{id: string, role: string} $actor @return list<array<string, mixed>> */
    public function all(array $actor): array { return $this->lists->visible($actor); }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function createList(array $input, array $actor): array
    {
        $data = $this->listData($input, $actor);
        $now = gmdate('c');
        $this->lists->createList($data + [
            'uuid' => $this->uuid(), 'created_by_member_uuid' => $actor['id'], 'created_at' => $now, 'updated_at' => $now,
        ]);
        return $this->all($actor);
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function updateList(string $uuid, array $input, array $actor): array
    {
        $list = $this->requireManageableList($uuid, $actor);
        $data = $this->listData($input, $actor, $list);
        if ($data['visibility'] === 'PRIVATE' && $list['created_by_member_uuid'] !== $actor['id']) {
            throw new AppException('FORBIDDEN', 'Nur der Ersteller kann diese Liste privat schalten.', 403);
        }
        if (!$this->lists->updateList($uuid, $data + ['updated_at' => gmdate('c')])) {
            throw new AppException('NOT_FOUND', 'Die Liste wurde nicht gefunden.', 404);
        }
        return $this->all($actor);
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function createItem(string $listUuid, array $input, array $actor): array
    {
        $this->requireVisibleList($listUuid, $actor);
        $data = $this->itemData($input);
        $now = gmdate('c');
        $this->lists->createItem($data + [
            'uuid' => $this->uuid(), 'list_uuid' => $listUuid, 'created_by_member_uuid' => $actor['id'],
            'created_at' => $now, 'updated_at' => $now,
        ]);
        return $this->all($actor);
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor */
    public function updateItem(string $uuid, array $input, array $actor): array
    {
        $item = $this->requireVisibleItem($uuid, $actor);
        if ((bool) $item['is_completed']) { throw new AppException('CONFLICT', 'Erledigte Punkte können nicht bearbeitet werden.', 409); }
        if (!$this->lists->updateItem($uuid, $this->itemData($input) + ['updated_at' => gmdate('c')])) {
            throw new AppException('NOT_FOUND', 'Der Listenpunkt wurde nicht gefunden.', 404);
        }
        return $this->all($actor);
    }

    /** @param array{id: string, role: string} $actor */
    public function toggleItem(string $uuid, array $actor): array
    {
        $this->requireVisibleItem($uuid, $actor);
        if (!$this->lists->toggleItem($uuid, $actor['id'])) { throw new AppException('NOT_FOUND', 'Der Listenpunkt wurde nicht gefunden.', 404); }
        return $this->all($actor);
    }

    /** @param array{id: string, role: string} $actor */
    public function deleteItem(string $uuid, array $actor): void
    {
        $this->requireVisibleItem($uuid, $actor);
        if (!$this->lists->deleteItem($uuid)) { throw new AppException('NOT_FOUND', 'Der Listenpunkt wurde nicht gefunden.', 404); }
    }

    /** @param array{id: string, role: string} $actor */
    public function clearCompleted(string $uuid, array $actor): array
    {
        $this->requireVisibleList($uuid, $actor);
        $this->lists->clearCompleted($uuid);
        return $this->all($actor);
    }

    /** @param array{id: string, role: string} $actor */
    public function deleteList(string $uuid, array $actor): void
    {
        $this->requireManageableList($uuid, $actor);
        if (!$this->lists->deleteList($uuid)) { throw new AppException('NOT_FOUND', 'Die Liste wurde nicht gefunden.', 404); }
    }

    /** @param array<string, mixed> $input @param array{id: string, role: string} $actor @param array<string, mixed>|null $existing */
    private function listData(array $input, array $actor, ?array $existing = null): array
    {
        $name = trim((string) ($input['name'] ?? $existing['name'] ?? ''));
        $description = trim((string) ($input['description'] ?? $existing['description'] ?? ''));
        $icon = (string) ($input['icon'] ?? $existing['icon'] ?? '📋');
        $color = strtoupper((string) ($input['color'] ?? $existing['color'] ?? '#345B48'));
        $visibility = strtoupper((string) ($input['visibility'] ?? $existing['visibility'] ?? 'FAMILY'));
        if (mb_strlen($name) < 2 || mb_strlen($name) > 70 || mb_strlen($description) > 240
            || !in_array($icon, self::ICONS, true) || !in_array($color, self::COLORS, true)
            || !in_array($visibility, self::VISIBILITIES, true)) {
            throw new AppException('VALIDATION_ERROR', 'Name, Beschreibung oder Darstellung der Liste ist ungültig.', 422);
        }
        if ($visibility === 'ADULTS' && !in_array($actor['role'], ['ADMIN', 'PARENT'], true)) {
            throw new AppException('FORBIDDEN', 'Nur Erwachsene können eine Erwachsenenliste anlegen.', 403);
        }
        return ['name' => $name, 'description' => $description === '' ? null : $description, 'icon' => $icon, 'color' => $color, 'visibility' => $visibility];
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    private function itemData(array $input): array
    {
        $title = trim((string) ($input['title'] ?? ''));
        $note = trim((string) ($input['note'] ?? ''));
        $assignee = trim((string) ($input['assignedToMemberId'] ?? ''));
        if (mb_strlen($title) < 1 || mb_strlen($title) > 120 || mb_strlen($note) > 300) {
            throw new AppException('VALIDATION_ERROR', 'Listenpunkt oder Notiz ist ungültig.', 422);
        }
        if ($assignee !== '') {
            $member = $this->members->find($assignee);
            if ($member === null || !$member->isActive) { throw new AppException('VALIDATION_ERROR', 'Die ausgewählte Person ist nicht verfügbar.', 422); }
        }
        return ['title' => $title, 'note' => $note === '' ? null : $note, 'assigned_to_member_uuid' => $assignee === '' ? null : $assignee];
    }

    /** @param array{id: string, role: string} $actor @return array<string, mixed> */
    private function requireVisibleList(string $uuid, array $actor): array
    {
        $list = $this->lists->findList($uuid) ?? throw new AppException('NOT_FOUND', 'Die Liste wurde nicht gefunden.', 404);
        $visible = $list['created_by_member_uuid'] === $actor['id'] || $list['visibility'] === 'FAMILY'
            || ($list['visibility'] === 'ADULTS' && in_array($actor['role'], ['ADMIN', 'PARENT'], true));
        if (!$visible) { throw new AppException('FORBIDDEN', 'Diese Liste ist privat.', 403); }
        return $list;
    }

    /** @param array{id: string, role: string} $actor @return array<string, mixed> */
    private function requireManageableList(string $uuid, array $actor): array
    {
        $list = $this->requireVisibleList($uuid, $actor);
        $allowed = $list['created_by_member_uuid'] === $actor['id']
            || ($list['visibility'] !== 'PRIVATE' && in_array($actor['role'], ['ADMIN', 'PARENT'], true));
        if (!$allowed) { throw new AppException('FORBIDDEN', 'Nur der Ersteller kann diese Liste verwalten.', 403); }
        return $list;
    }

    /** @param array{id: string, role: string} $actor @return array<string, mixed> */
    private function requireVisibleItem(string $uuid, array $actor): array
    {
        $item = $this->lists->findItem($uuid) ?? throw new AppException('NOT_FOUND', 'Der Listenpunkt wurde nicht gefunden.', 404);
        $this->requireVisibleList((string) $item['list_uuid'], $actor);
        return $item;
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); $hex = bin2hex($bytes);
        return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
    }
}
