import React from 'react';
import { IconScout } from '@/components/ui/images/IconScout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { colorClass } from '@/assets/styles/colors';
import { cn } from '@/lib/utils';


interface ResetSuccessFormProps {
  email: string;
  onBackToLogin: () => void;
}

export const ResetSuccessForm: React.FC<ResetSuccessFormProps> = ({
  email,
  onBackToLogin,
}) => (
  <>
    <div className="text-center mb-8">
      <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <IconScout 
          name="checkCircle"
          size={64}
          className={colorClass.successIcon}
        />  
      </div>
      
      <div>
        <Text variant="subheader-regular" className={cn('text-justify', colorClass.body)}>
          Enviamos un email a tu correo electrónico con las instrucciones 
          para recuperar tu contraseña.
        </Text>
        <div className="mt-4">
          <Text variant="subheader-regular" className={cn('text-center', colorClass.muted)}>
            Usuario: {email}
          </Text>
        </div>
      </div>
    </div>

    <div className="pt-2 mb-6 text-center">
      <PrimaryButton
        onClick={onBackToLogin}
        variant="outline"
        iconLeft={<IconScout name="arrowLeft" />}
      >
        Ok, regresar al login
      </PrimaryButton>
    </div>

    <div className="text-center pt-4 border-t border-gray-200">
      <Text variant="small-regular" className={colorClass.muted}>
        • No olvides revisar la carpeta spam
      </Text>
    </div>
  </>
);
