export type BackupFile = {
  id: string;
  createdAt: string;
  size: number;
  reason: string;
  checksumSha256: string;
};

export type BackupOverview = {
  backups: BackupFile[];
  pendingRestore: boolean;
};

export type RestoreResult = {
  pendingRestore: boolean;
  backup?: BackupFile;
  name?: string;
};

export type ArchiveRestoreResult = {
  pendingRestore: boolean;
  name: string;
  formatVersion: number;
  exportedAt: string;
  photoCount: number;
  includesSecrets: boolean;
};
