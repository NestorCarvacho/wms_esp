import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useLoginPanel } from '@/hooks/useLoginPanel';
import { PATHS } from '@/routes/paths';

/** Abre el panel de login cuando la URL trae ?login=1 */
export function LoginPanelHost() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const openLoginPanel = useLoginPanel();
  const openedRef = useRef(false);

  useEffect(() => {
    if (searchParams.get('login') !== '1') {
      openedRef.current = false;
      return;
    }

    if (openedRef.current) return;
    openedRef.current = true;

    const next = new URLSearchParams(searchParams);
    next.delete('login');
    setSearchParams(next, { replace: true });

    if (isAuthenticated) {
      navigate(PATHS.app, { replace: true });
      return;
    }

    openLoginPanel();
  }, [isAuthenticated, navigate, openLoginPanel, searchParams, setSearchParams]);

  return null;
}
