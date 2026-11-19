import { apiGet, apiPut } from '../../../services/apiClient';
import type { ProfilePreferenceInput, ProfilePreferences } from '../types/profilePreferences';

export const getProfilePreferences = (signal?: AbortSignal) => apiGet<ProfilePreferences>('/profile-preferences', signal);
export const updateProfilePreferences = (input: ProfilePreferenceInput) => apiPut<ProfilePreferences>('/profile-preferences', input);
