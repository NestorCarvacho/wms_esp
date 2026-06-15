import { Link } from 'react-router-dom';
import { LoginLayout } from '@/components/layout/LoginLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text/Text';
import { colorClass } from '@/assets/styles/colors';
import { PATHS } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <LoginLayout
      title="Página no encontrada"
      description="La ruta que buscas no existe o fue movida."
    >
      <div className="space-y-6 text-center">
        <Text variant="header-4" className={colorClass.brand}>
          404
        </Text>
        <Text variant="body-regular" className={colorClass.muted}>
          Verifique la URL o regrese al inicio.
        </Text>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={PATHS.landing}>
            <PrimaryButton type="button" variant="outline" fullWidth>
              Ir al inicio
            </PrimaryButton>
          </Link>
          <Link to={PATHS.login}>
            <PrimaryButton type="button" fullWidth>
              Iniciar sesión
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </LoginLayout>
  );
}
