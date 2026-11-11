import { apiDelete, apiGet, apiPut, apiUpload } from '../../../services/apiClient';
import type { WallPresentation, WallPresentationInput, WallPresentationSettings } from '../types/wallPresentation';

export const getWallPresentation = (signal?: AbortSignal) => apiGet<WallPresentation>('/wall-presentation', signal);
export const getWallPresentationSettings = (signal?: AbortSignal) => apiGet<WallPresentationSettings>('/admin/wall-presentation', signal);
export const updateWallPresentation = (input: WallPresentationInput) => apiPut<WallPresentationSettings>('/admin/wall-presentation', input);
export const uploadWallPhoto = (photo: File) => {
  const formData = new FormData();
  formData.append('photo', photo);
  return apiUpload<WallPresentationSettings>('/admin/wall-photos', formData);
};
export const deleteWallPhoto = (id: string) => apiDelete<void>(`/admin/wall-photos/${id}`);
