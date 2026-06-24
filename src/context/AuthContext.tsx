import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import * as authApi from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  handleOAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toUser(profile: authApi.UserProfile): User {
  return {
    id: String(profile.id),
    username: profile.username,
    email: profile.email,
    avatar: profile.avatar,
    bio: profile.bio,
    link: profile.link,
    socialLinks: profile.socialLinks,
    role: profile.role,
    createdAt: profile.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to fetch profile (cookies are sent automatically)
  useEffect(() => {
    authApi.getProfile()
      .then((profile) => {
        setUser(toUser(profile));
      })
      .catch(() => {
        // Not logged in or token expired — that's fine
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const profile = await authApi.login({ email, password });
      setUser(toUser(profile));
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const profile = await authApi.register({ username, email, password });
      setUser(toUser(profile));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const apiUpdates: Partial<authApi.UserProfile> = {};
    if (updates.username !== undefined) apiUpdates.username = updates.username;
    if (updates.email !== undefined) apiUpdates.email = updates.email;
    if (updates.bio !== undefined) apiUpdates.bio = updates.bio;
    if (updates.avatar !== undefined) apiUpdates.avatar = updates.avatar;
    if (updates.link !== undefined) apiUpdates.link = updates.link;
    if (updates.socialLinks !== undefined) apiUpdates.socialLinks = updates.socialLinks;
    const profile = await authApi.updateProfile(apiUpdates);
    setUser(toUser(profile));
  }, []);

  const handleOAuthCallback = useCallback(async (accessToken: string, refreshToken: string) => {
    try {
      const profile = await authApi.exchangeOAuthTokens(accessToken, refreshToken);
      setUser(toUser(profile));
    } catch {
      throw new Error('OAuth login failed');
    }
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      isAdmin,
      loading,
      login,
      register,
      logout,
      updateProfile,
      handleOAuthCallback,
    }),
    [user, isAdmin, loading, login, register, logout, updateProfile, handleOAuthCallback]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
