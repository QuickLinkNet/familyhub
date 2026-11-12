import { apiAssetUrl, apiGet, apiPost, apiUpload } from '../../../services/apiClient';
import type { ArchiveRestoreResult, BackupFile, BackupOverview, RestoreResult } from '../types/backup';

export const getBackups = (signal?: AbortSignal) => apiGet<BackupOverview>('/admin/backups', signal);
export const createBackup = () => apiPost<BackupFile>('/admin/backups', {});
export const restoreBackup = (id: string) => apiPost<RestoreResult>(`/admin/backups/${encodeURIComponent(id)}/restore`, { confirmation: 'WIEDERHERSTELLEN' });

export function restoreUploadedBackup(file: File): Promise<RestoreResult> {
  const form = new FormData();
  form.append('backup', file);
  form.append('confirmation', 'WIEDERHERSTELLEN');
  return apiUpload<RestoreResult>('/admin/backups/restore-upload', form);
}

export const backupDownloadUrl = (id: string) => apiAssetUrl(`/admin/backups/${encodeURIComponent(id)}/download`);

export const archiveDownloadUrl = () => apiAssetUrl('/admin/archive/download');

export function restoreUploadedArchive(file: File): Promise<ArchiveRestoreResult> {
  const form = new FormData();
  form.append('archive', file);
  form.append('confirmation', 'ARCHIV WIEDERHERSTELLEN');
  return apiUpload<ArchiveRestoreResult>('/admin/archive/restore-upload', form);
}
