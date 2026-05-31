import React from 'react';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { useLogin } from '@/hooks/account/useLogin.ts';
import { colors } from '@/assets/styles/colors';
import { IconScout } from '@/components/ui/images/IconScout';


interface LoginFormProps {
  onForgotPassword: () => void;
  onNeedHelp: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onForgotPassword,
  onNeedHelp,
}) => {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
  } = useLogin();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <LabelInput
        id="username"
        label="Nombre de usuario"
        hasError={!!errors.username}
        errorMessage={errors.username?.message}
        required
        registration={register('username')}
        iconRight={<IconScout name="user" size="md" />}
      />

      <LabelInput
        id="password"
        type="password"
        label="Contraseña"
        hasError={!!errors.password}
        errorMessage={errors.password?.message}
        required
        registration={register('password')}
      />

      <div className="pt-2">
        <PrimaryButton
          type="submit"
          colorVariant="success"
          isLoading={isSubmitting}
          fullWidth
        >
          Iniciar sesión
        </PrimaryButton>
      </div>

      <div className="flex justify-between items-center text-sm pt-4 mt-6">
        <Text
          variant="body-medium"
          onClick={onForgotPassword}
          className="cursor-pointer transition-colors hover:opacity-80"
          color= {colors.primary.dash}
        >
          Olvidé mi contraseña
        </Text>
        <Text
          variant="subheader-medium"
          onClick={onNeedHelp}
          className="cursor-pointer transition-colors hover:opacity-80"
          color={colors.grays.neutral99}
        >
          ¿Necesitas ayuda?
        </Text>
      </div>
    </form>
  );
};
