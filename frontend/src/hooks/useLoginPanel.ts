import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_SIDE_PANEL_KEY } from '@/components/auth/registerAuthPanels';
import { useUI } from '@/hooks/ui';
import { PATHS } from '@/routes/paths';

export function useLoginPanel() {
  const { openSidePanel, closeSidePanel } = useUI();
  const navigate = useNavigate();

  const openLoginPanel = useCallback(() => {
    openSidePanel({
      component: LOGIN_SIDE_PANEL_KEY,
      title: 'Iniciar sesión',
      props: {
        onSuccess: () => {
          closeSidePanel();
          navigate(PATHS.app);
        },
      },
    });
  }, [closeSidePanel, navigate, openSidePanel]);

  return openLoginPanel;
}
