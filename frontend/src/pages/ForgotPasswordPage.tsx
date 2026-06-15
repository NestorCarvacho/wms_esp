import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { solicitarRecuperacionContrasena } from '@/api/auth';
import { ResetPasswordForm } from '@/components/features/account/login/ResetPasswordForm';
import { ResetSuccessForm } from '@/components/features/account/login/ResetSuccessForm';
import { LoginLayout } from '@/components/layout/LoginLayout';
import { useAuthContext } from '@/context/AuthContext';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { PATHS } from '@/routes/paths';

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuthContext();
  const { showNotification } = useUI();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={PATHS.app} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await solicitarRecuperacionContrasena(email.trim());
      setSent(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo enviar el correo';
      setError(message);
      showNotification({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginLayout
      title="Recuperar contraseña"
      description="Le enviaremos un enlace válido por 10 minutos"
    >
      {sent ? (
        <>
          <ResetSuccessForm
            email={email.trim()}
            onBackToLogin={() => {
              window.location.href = PATHS.login;
            }}
          />
          <div className="mt-4 text-center">
            <Link to={PATHS.login} className="text-sm text-blue-600 hover:underline">
              Volver al login
            </Link>
          </div>
        </>
      ) : (
        <>
          <ResetPasswordForm
            email={email}
            error={error}
            isLoading={loading}
            onEmailChange={setEmail}
            onSubmit={handleSubmit}
            onBackToLogin={() => undefined}
          />
          <div className="mt-2 text-center">
            <Link to={PATHS.login} className="text-sm text-blue-600 hover:underline">
              Volver al login
            </Link>
          </div>
        </>
      )}
    </LoginLayout>
  );
}
