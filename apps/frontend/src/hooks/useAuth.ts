'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { UserDto } from '@prokoti/types';

export function useAuth() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<UserDto>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return { user, loading, setUser, logout };
}
