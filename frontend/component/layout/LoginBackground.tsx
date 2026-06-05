import { LOGIN_BACKGROUND_VARIANT } from './loginBackgroundConfig';
import { LoginBackgroundOptionA } from './LoginBackgroundOptionA';
import { LoginBackgroundOptionB } from './LoginBackgroundOptionB';

/** Renderiza la variante activa (ver `loginBackgroundConfig.ts`). */
export function LoginBackground() {
  if (LOGIN_BACKGROUND_VARIANT === 'B') {
    return <LoginBackgroundOptionB />;
  }
  return <LoginBackgroundOptionA />;
}
