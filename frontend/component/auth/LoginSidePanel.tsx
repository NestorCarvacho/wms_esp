import { LogoWms } from '@/components/ui/images';
import { APP_NAME, APP_TAGLINE } from '@/config/appBrand';
import { LoginForm } from './LoginForm';

interface LoginSidePanelProps {
  onSuccess?: () => void;
}

export function LoginSidePanel({ onSuccess }: LoginSidePanelProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <LogoWms variant="solo" className="mx-auto h-10 w-auto" alt={APP_NAME} />
        <p className="mt-3 text-sm text-muted-foreground">
          Ingresa con tu cuenta de <span className="font-medium text-foreground">{APP_NAME}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{APP_TAGLINE}</p>
      </div>

      <LoginForm onSuccess={onSuccess} />
    </div>
  );
}
