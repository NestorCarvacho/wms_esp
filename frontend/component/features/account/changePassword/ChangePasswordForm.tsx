import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { ChangePasswordData } from '@/schemas/account';
import { IconScout } from '@/components/ui/images/IconScout';
import { colorClass } from '@/assets/styles/colors';
import { cn } from '@/lib/utils';


interface ChangePasswordFormProps {
  register: UseFormRegister<ChangePasswordData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<ChangePasswordData>;
  isSubmitting: boolean;
  onBackToLogin: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  register,
  handleSubmit,
  errors,
  isSubmitting,
  onBackToLogin,
}) => (
  <>
    <form onSubmit={handleSubmit} className="space-y-8 pt-8">
      <LabelInput
        id="newPassword"
        type="password"
        label="Nueva contraseña"
        hasError={!!errors.newPassword}
        errorMessage={errors.newPassword?.message}
        required
        registration={register('newPassword')}
      />

      {/* Campo de Confirmar Contraseña */}
      <LabelInput
        id="confirmPassword"
        type="password"
        label="Repetir contraseña"
        hasError={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword?.message}
        required
        registration={register('confirmPassword')}
      />

      {/* Botón de Cambiar Contraseña */}
      <div className="pt-2">
        <PrimaryButton
          type="submit"
          isLoading={isSubmitting}
          fullWidth
          iconRight={<IconScout name="sync" size="md" />}
        >
          Cambiar Contraseña
        </PrimaryButton>
      </div>

      {/* Enlace para regresar */}
      <div className="text-center">
        <Text
          variant="body-medium"
          onClick={onBackToLogin}
          className={cn('cursor-pointer transition-colors hover:opacity-80', colorClass.brand)}
        >
          Regresar
        </Text>
      </div>
    </form>
  </>
);
