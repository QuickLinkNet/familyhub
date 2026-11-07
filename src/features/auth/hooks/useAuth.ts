import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthProfiles, getAuthSession, login, logout } from '../api/authApi';
import type { AuthSession, LoginInput } from '../types/auth';

export const authSessionKey = ['auth-session'] as const;
export const authProfilesKey = ['auth-profiles'] as const;

const signedOutSession: AuthSession = {
  authenticated: false,
  user: null,
  csrfToken: null
};

export const useAuthProfiles = () => useQuery({
  queryKey: authProfilesKey,
  queryFn: ({ signal }) => getAuthProfiles(signal),
  staleTime: 60_000
});

export const useAuthSession = () => useQuery({
  queryKey: authSessionKey,
  queryFn: ({ signal }) => getAuthSession(signal),
  staleTime: 30_000,
  retry: false
});

export const useLogin = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: session => {
      client.setQueryData(authSessionKey, session);
      void client.invalidateQueries({ queryKey: ['family-members'] });
      void client.invalidateQueries({ queryKey: ['tasks'] });
      void client.invalidateQueries({ queryKey: ['calendars'] });
      void client.invalidateQueries({ queryKey: ['calendar-events'] });
      void client.invalidateQueries({ queryKey: ['rewards'] });
      void client.invalidateQueries({ queryKey: ['shopping-lists'] });
    }
  });
};

export const useLogout = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      client.setQueryData(authSessionKey, signedOutSession);
      client.removeQueries({ queryKey: ['family-members'] });
      client.removeQueries({ queryKey: ['tasks'] });
      client.removeQueries({ queryKey: ['calendars'] });
      client.removeQueries({ queryKey: ['calendar-events'] });
      client.removeQueries({ queryKey: ['rewards'] });
      client.removeQueries({ queryKey: ['shopping-lists'] });
    }
  });
};
