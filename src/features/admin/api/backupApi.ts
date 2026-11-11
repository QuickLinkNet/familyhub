import { apiAssetUrl, apiGet, apiPost, apiUpload } from '../../../services/apiClient';
import type { BackupFile, BackupOverview, RestoreResult } from '../types/backup';

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
