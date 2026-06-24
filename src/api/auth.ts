import client from './client';

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  link?: string;
  socialLinks?: Record<string, string>;
  role?: string;
  createdAt: string;
}

export async function login(params: LoginParams): Promise<UserProfile> {
  return client.post('/auth/login', params) as unknown as UserProfile;
}

export async function register(params: RegisterParams): Promise<UserProfile> {
  return client.post('/auth/register', params) as unknown as UserProfile;
}

export async function getProfile(): Promise<UserProfile> {
  return client.get('/user/profile') as unknown as UserProfile;
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  return client.put('/user/profile', updates) as unknown as UserProfile;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function refreshToken(): Promise<void> {
  await client.post('/auth/refresh');
}

export async function handleOAuthCallback(): Promise<UserProfile> {
  return client.get('/user/profile') as unknown as UserProfile;
}

export async function exchangeOAuthTokens(accessToken: string, refreshToken: string): Promise<UserProfile> {
  return client.post('/auth/oauth/exchange', {
    access_token: accessToken,
    refresh_token: refreshToken,
  }) as unknown as UserProfile;
}
