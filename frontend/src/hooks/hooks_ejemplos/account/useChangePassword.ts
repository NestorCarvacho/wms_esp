import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordData } from '@/schemas/account';
import { useUI } from '@/hooks/ui/useUI';
import { authService } from '@/api';
import { useNavigate, useLocation } from 'react-router-dom';


export const useChangePassword = (hashVerification?: string | null) => {
  const { showNotification } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveHash = hashVerification ?? new URLSearchParams(location.search).get('hash');

  useEffect(() => {
    if (!effectiveHash) {
      showNotification('error', 'El enlace no es válido o expiró. Falta el parámetro hash.', 5000);
      void navigate('/login', { replace: true });
    }
  }, [effectiveHash, navigate, showNotification]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      if (!effectiveHash) {
        showNotification('error', 'El enlace no es válido o expiró. Falta el parámetro hash.', 5000);
        return;
      }
      const response = await authService.updatePassword({
        hashVerification: effectiveHash,
        newPassword: data.newPassword,
      });
      if (!response.success) {
        showNotification('error', response.error?.detail || 'Error al cambiar la contraseña', 5000);
        return;
      }
      showNotification('success', 'Tu contraseña ha sido cambiada exitosamente', 5000);
      void navigate('/login', { replace: true });
      
    } catch (error : any) {
      showNotification('error', error?.message || 'Error al cambiar la contraseña', 5000);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  };
};
