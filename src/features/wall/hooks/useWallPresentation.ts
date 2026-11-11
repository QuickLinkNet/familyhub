import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteWallPhoto, getWallPresentation, getWallPresentationSettings, updateWallPresentation, uploadWallPhoto } from '../api/wallPresentationApi';
import type { WallPhoto, WallPresentationInput } from '../types/wallPresentation';

export const wallPresentationKey = ['wall-presentation'] as const;
export const wallPresentationSettingsKey = ['wall-presentation-settings'] as const;

export const useWallPresentation = () => useQuery({
  queryKey: wallPresentationKey,
  queryFn: ({ signal }) => getWallPresentation(signal),
  staleTime: 10 * 60_000,
  refetchInterval: 15 * 60_000
});

export const useWallPresentationSettings = (enabled = true) => useQuery({
  queryKey: wallPresentationSettingsKey,
  queryFn: ({ signal }) => getWallPresentationSettings(signal),
  enabled
});

function useWallMutation<T>(mutationFn: (value: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: wallPresentationKey });
      void client.invalidateQueries({ queryKey: wallPresentationSettingsKey });
    }
  });
}

export const useUpdateWallPresentation = () => useWallMutation((input: WallPresentationInput) => updateWallPresentation(input));
export const useUploadWallPhoto = () => useWallMutation((photo: File) => uploadWallPhoto(photo));
export const useDeleteWallPhoto = () => useWallMutation((id: string) => deleteWallPhoto(id));

export function useRotatingWallPhoto(photos: WallPhoto[]) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % photos.length), 15_000);
    return () => window.clearInterval(timer);
  }, [photos.length]);
  useEffect(() => { if (index >= photos.length) setIndex(0); }, [index, photos.length]);
  return photos[index] ?? null;
}
