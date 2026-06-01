import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginLayout } from '@/components/layout/LoginLayout';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { IconScout } from '@/components/ui/images/IconScout';
import { useAuthContext } from '@/context/AuthContext';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';

export function LoginPage() {
  const { login, isAuthenticated } = useAuthContext();
  const { showNotification } = useUI();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), contrasena);
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'No se pudo iniciar sesión',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginLayout title="WMS Multi-Tenant" description="Inicia sesión para gestionar tu almacén">
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <LabelInput
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={setEmail}
          required
          iconRight={<IconScout name="user" size="md" />}
        />

        <LabelInput
          id="contrasena"
          type="password"
          label="Contraseña"
          value={contrasena}
          onChange={setContrasena}
          required
        />

        <PrimaryButton type="submit" colorVariant="success" isLoading={loading} fullWidth>
          Iniciar sesión
        </PrimaryButton>
      </form>
    </LoginLayout>
  );
}
