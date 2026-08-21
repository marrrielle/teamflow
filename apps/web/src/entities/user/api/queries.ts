import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { userSchema, type User } from '@teamflow/contracts';
import { apiClient } from '@/shared/api/client';

const USER_KEYS_ROOT = ['users'] as const;

interface UserKeys {
  all: readonly ['users'];
  me: () => readonly ['users', 'me'];
  list: () => readonly ['users', 'list'];
}

export const userKeys = {
  all: USER_KEYS_ROOT,
  me: () => [...USER_KEYS_ROOT, 'me'] as const,
  list: () => [...USER_KEYS_ROOT, 'list'] as const,
} satisfies UserKeys;

export function useMeQuery() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async (): Promise<User | null> => {
      const res = await apiClient.get<User>('/me');
      if (!res.ok) {
        if (res.error.status === 401) return null;
        throw new Error(res.error.message);
      }
      return userSchema.parse(res.data);
    },
    retry: false,
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async (): Promise<User[]> => {
      const res = await apiClient.get<User[]>('/users');
      if (!res.ok) throw new Error(res.error.message);
      return z.array(userSchema).parse(res.data);
    },
  });
}
