<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

use FamilyCompass\Config\Config;
use PDO;

final class MigrationRunner
{
    public function __construct(private Config $config, private BackupService $backups, private Logger $logger) {}

    public function run(PDO $pdo): void
    {
        $pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, version TEXT NOT NULL UNIQUE, migration TEXT NOT NULL, executed_at TEXT NOT NULL)');
        $files = glob($this->config->migrationsPath() . DIRECTORY_SEPARATOR . '*.sql') ?: [];
        sort($files, SORT_NATURAL);
        $executed = $pdo->query('SELECT version FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
        $missing = array_values(array_filter($files, static fn (string $file): bool => !in_array(pathinfo($file, PATHINFO_FILENAME), $executed, true)));
        if ($missing !== []) {
            $this->backups->create('before-migration', $pdo);
        }
        foreach ($missing as $file) {
            $version = pathinfo($file, PATHINFO_FILENAME);
            $sql = file_get_contents($file);
            if ($sql === false) {
                throw new AppException('MIGRATION_READ_FAILED', 'Eine Datenbankmigration konnte nicht gelesen werden.');
            }
            $pdo->beginTransaction();
            try {
                $pdo->exec($sql);
                $statement = $pdo->prepare('INSERT INTO schema_migrations (version, migration, executed_at) VALUES (:version, :migration, :executed_at)');
                $statement->execute(['version' => $version, 'migration' => basename($file), 'executed_at' => gmdate('c')]);
                $pdo->commit();
                $this->logger->info('Migration applied', ['migration' => basename($file)]);
            } catch (\Throwable $exception) {
                if ($pdo->inTransaction()) { $pdo->rollBack(); }
                throw new AppException('MIGRATION_FAILED', 'Eine Datenbankmigration konnte nicht abgeschlossen werden.');
            }
        }
    }
}
