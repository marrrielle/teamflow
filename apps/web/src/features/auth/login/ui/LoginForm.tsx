import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginRequestSchema, userSchema, type LoginRequest, type User } from '@teamflow/contracts';
import { apiClient } from '@/shared/api/client';
import { Button, Input } from '@/shared/ui';
import { userKeys } from '@/entities/user';
import { useToast } from '@/shared/lib/toast';

export function LoginForm() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(loginRequestSchema) });

  const mutation = useMutation({
    mutationFn: async (values: LoginRequest): Promise<User> => {
      const res = await apiClient.post<LoginRequest, User>('/auth/login', values);
      if (!res.ok) throw new Error(res.error.message);
      return userSchema.parse(res.data);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.me(), user);
      showToast(`Welcome back, ${user.name}`, 'success');
    },
    onError: (error: Error) => {
      setError('root', { message: error.message });
      showToast(error.message, 'error');
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex w-full max-w-sm flex-col gap-4"
      noValidate
    >
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
      </div>
      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
      <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
        Sign in
      </Button>
    </form>
  );
}
