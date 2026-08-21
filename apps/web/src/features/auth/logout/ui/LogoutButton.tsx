import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/ui';
import { userKeys } from '@/entities/user';

export function LogoutButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const res = await apiClient.post<Record<string, never>, null>('/auth/logout', {});
      if (!res.ok) throw new Error(res.error.message);
    },
    onSuccess: () => {
      queryClient.setQueryData(userKeys.me(), null);
    },
  });

  return (
    <Button variant="ghost" onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
      Log out
    </Button>
  );
}
