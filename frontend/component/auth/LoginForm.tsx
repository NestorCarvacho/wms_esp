import { useState, type FormEvent } from 'react';
import { LabelInput, Checkbox } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { IconScout } from '@/components/ui/images/IconScout';
import { useAuthContext } from '@/context/AuthContext';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';

const REMEMBER_EMAIL_KEY = 'wms-remember-email';

function readRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuthContext();
  const { showNotification } = useUI();
  const remembered = readRememberedEmail();
  const [email, setEmail] = useState(remembered);
  const [contrasena, setContrasena] = useState('');
  const [rememberEmail, setRememberEmail] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const emailTrim = email.trim();
      await login(emailTrim, contrasena);
      try {
        if (rememberEmail) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, emailTrim);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        /* ignore storage errors */
      }
      onSuccess?.();
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <LabelInput
        id="login-email"
        type="email"
        label="Email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="username"
        iconRight={<IconScout name="user" size="md" />}
      />

      <LabelInput
        id="login-contrasena"
        type={showPassword ? 'text' : 'password'}
        label="Contraseña"
        value={contrasena}
        onChange={setContrasena}
        required
        autoComplete="current-password"
        iconRight={
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((v) => !v)}
            className="rounded-md p-0.5 text-slate-900 hover:text-black dark:text-slate-100 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconScout
              name={showPassword ? 'eyeSlash' : 'eye'}
              size="md"
              className="text-slate-900 dark:text-slate-100"
            />
          </button>
        }
      />

      <Checkbox
        id="login-remember-email"
        checked={rememberEmail}
        onChange={setRememberEmail}
        label="Recordar usuario"
        data-testid="remember-email"
      />

      <PrimaryButton type="submit" colorVariant="success" isLoading={loading} fullWidth>
        Iniciar sesión
      </PrimaryButton>
    </form>
  );
}
