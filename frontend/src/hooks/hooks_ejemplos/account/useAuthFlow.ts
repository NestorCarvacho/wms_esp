import { useState } from 'react';
import { useAppDispatch } from '@/hooks';
import { recoverPasswordAsync } from '@/store/slices/authSlice.ts';


export type AuthFlowState = 'login' | 'reset-password' | 'reset-success';

export interface ResetPasswordFormData {
  email: string;
}

export const useAuthFlow = () => {
  const dispatch = useAppDispatch();
  const [currentView, setCurrentView] = useState<AuthFlowState>('login');
  const [resetFormData, setResetFormData] = useState<ResetPasswordFormData>({
    email: '',
  });
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string>('');

  const navigateToReset = () => {
    setCurrentView('reset-password');
    setResetError('');
  };

  const navigateToLogin = () => {
    setCurrentView('login');
    setResetFormData({ email: '' });
    setResetError('');
  };

  const navigateToSuccess = () => {
    setCurrentView('reset-success');
  };

  const handleResetEmailChange = (email: string) => {
    setResetFormData({ email });
    if (resetError) {
      setResetError('');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError('');
    try {
      const email = resetFormData.email.trim();
      await dispatch(recoverPasswordAsync({ userName: email })).unwrap();
      navigateToSuccess();
    } catch (err: any) {
      const msg = typeof err === 'string'
        ? err
        : err?.description || err?.message || 'Error al enviar el email. Intenta nuevamente.';
      setResetError(msg);
    } finally {
      setIsResetting(false);
    }
  };

  return {
    currentView,
    resetFormData,
    isResetting,
    resetError,
    navigateToReset,
    navigateToLogin,
    navigateToSuccess,
    handleResetEmailChange,
    handleResetSubmit,
  };
};
