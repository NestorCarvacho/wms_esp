import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { restablecerContrasena } from '@/api/auth';
import { ChangePasswordForm } from '@/components/features/account/changePassword/ChangePasswordForm';
import { LoginLayout } from '@/components/layout/LoginLayout';
import { Text } from '@/components/ui/text/Text';
import { colorClass } from '@/assets/styles/colors';
import { useAuthContext } from '@/context/AuthContext';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { validateChangePassword, type ChangePasswordData } from '@/schemas/account';
import { PATHS } from '@/routes/paths';

export function ResetPasswordPage() {
  const { isAuthenticated } = useAuthContext();
  const { showNotification } = useUI();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token')?.trim() ?? '', [params]);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>();

  if (isAuthenticated) {
    return <Navigate to={PATHS.app} replace />;
  }

  if (!token) {
    return (
      <LoginLayout title="Enlace inválido" description="Solicite un nuevo correo de recuperación">
        <Text variant="body-regular" className={`text-center ${colorClass.muted}`}>
          El enlace no incluye un token válido o ha caducado (10 minutos).
        </Text>
        <div className="mt-6 text-center">
          <Link to={PATHS.forgotPassword} className="text-sm text-blue-600 hover:underline">
            Solicitar nuevo enlace
          </Link>
        </div>
      </LoginLayout>
    );
  }

  async function onSubmit(data: ChangePasswordData) {
    setFormError('');
    const validation = validateChangePassword(data);
    if (validation) {
      setFormError(validation);
      return;
    }
    try {
      await restablecerContrasena(token, data.newPassword);
      setDone(true);
      showNotification({ type: 'success', message: 'Contraseña actualizada' });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña';
      setFormError(message);
      showNotification({ type: 'error', message });
    }
  }

  if (done) {
    return (
      <LoginLayout title="Contraseña actualizada" description="Ya puede iniciar sesión">
        <Text variant="body-regular" className={`text-center ${colorClass.muted}`}>
          Su contraseña fue cambiada correctamente.
        </Text>
        <div className="mt-6 text-center">
          <Link to={PATHS.login} className="text-sm text-blue-600 hover:underline">
            Ir al login
          </Link>
        </div>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout title="Nueva contraseña" description="El enlace caduca en 10 minutos">
      {formError ? (
        <Text variant="small-regular" className={`mb-4 ${colorClass.destructive}`}>
          {formError}
        </Text>
      ) : null}
      <ChangePasswordForm
        register={register}
        handleSubmit={handleSubmit(onSubmit)}
        errors={errors}
        isSubmitting={isSubmitting}
        onBackToLogin={() => undefined}
      />
      <div className="mt-2 text-center">
        <Link to={PATHS.login} className="text-sm text-blue-600 hover:underline">
          Volver al login
        </Link>
      </div>
    </LoginLayout>
  );
}
