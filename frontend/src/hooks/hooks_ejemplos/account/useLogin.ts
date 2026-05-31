import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormData } from '@/schemas/account/loginForm';
import { useAuth } from '@/api';
import { loginAsync } from '@/store/slices/authSlice.ts';
import { useAppDispatch } from '@/hooks';


interface UseLoginReturn {
  register: ReturnType<typeof useForm<LoginFormData>>['register'];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<LoginFormData>>['formState']['errors'];
  isSubmitting: boolean;
  authError: string;
}

export const useLogin = (): UseLoginReturn => {
  const [authError, setAuthError] = useState('');
  const dispatch = useAppDispatch();
  const { loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError('');
    const payload = { userName: data.username, passWord: data.password };

    try {
      const result = await dispatch(loginAsync(payload)).unwrap();
      if (result && result.token) {
        // éxito: redirección se maneja afuera
        return;
      }
    } catch (err: any) {
      const msg = typeof err === 'string'
        ? err
        : err?.description || err?.message || 'Error de conexión';

      const trimmed = msg.trim();
      const isCred = /credenciales/i.test(trimmed);

      if (isCred) {
        setError('username', { message: ' ' });
        setError('password', { message: 'Usuario o contraseña incorrectos' });
        return;
      }
      setError('username', { message: ' ' });
      setError('password', { message: ' ' });
      setAuthError(trimmed);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isSubmitting || loading,
    authError,
  };
};
