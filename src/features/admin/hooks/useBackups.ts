import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBackup, getBackups, restoreBackup, restoreUploadedArchive, restoreUploadedBackup } from '../api/backupApi';

export const backupsKey = ['admin-backups'] as const;

export const useBackups = (enabled = true) => useQuery({
  queryKey: backupsKey,
  queryFn: ({ signal }) => getBackups(signal),
  enabled
});

export const useCreateBackup = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: createBackup, onSuccess: () => client.invalidateQueries({ queryKey: backupsKey }) });
};

export const useRestoreBackup = () => useMutation({
  mutationFn: (id: string) => restoreBackup(id)
});

export const useRestoreUploadedBackup = () => useMutation({
  mutationFn: (file: File) => restoreUploadedBackup(file)
});

export const useRestoreUploadedArchive = () => useMutation({
  mutationFn: (file: File) => restoreUploadedArchive(file)
});
