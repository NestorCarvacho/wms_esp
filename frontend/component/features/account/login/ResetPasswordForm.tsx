import React from 'react';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { colorClass } from '@/assets/styles/colors';
import { cn } from '@/lib/utils';
import { IconScout } from '@/components/ui/images/IconScout';


interface ResetPasswordFormProps {
  email: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  error,
  isLoading,
  onEmailChange,
  onSubmit,
  onBackToLogin,
}) => (
  <>
    <form onSubmit={onSubmit} className="pt-4">
      <LabelInput
        id="email"
        value={email}
        onChange={onEmailChange}
        label="Nombre de usuario"
        hasError={!!error}
        errorMessage={error}
        required
        iconRight={<IconScout name="user" size="md" />}
      />

      <div className="pt-8">
        <PrimaryButton
          type="submit"
          colorVariant="success"
          isLoading={isLoading}
          disabled={!email.trim()}
          fullWidth
        >
          Enviar email de recuperación
        </PrimaryButton>
      </div>

      <div className="text-center pt-4 mt-6">
        <Text
          variant="body-medium"
          onClick={onBackToLogin}
          className={cn('cursor-pointer transition-colors hover:opacity-80', colorClass.brand)}
        >
          Regresar
        </Text>
      </div>

      <div className="text-center mt-4">
        <Text variant="small-regular" className={colorClass.muted}>
          • No olvides revisar la carpeta spam
        </Text>
      </div>
    </form>
  </>
);
