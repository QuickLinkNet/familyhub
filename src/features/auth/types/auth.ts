export type AuthRole = 'ADMIN' | 'PARENT' | 'CHILD';

export interface AuthProfile {
  id: string;
  name: string;
  color: string;
  role: AuthRole;
  requiresSecret: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  color: string;
  role: AuthRole;
}

export interface AuthSession {
  authenticated: boolean;
  user: AuthUser | null;
  csrfToken: string | null;
}

export interface LoginInput {
  memberId: string;
  secret: string;
}
