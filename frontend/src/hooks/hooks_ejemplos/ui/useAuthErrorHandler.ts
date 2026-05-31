import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api';
import { useAppDispatch } from '@/hooks';
import { logout } from '@/store/slices/authSlice';

/**
 * Hook para configurar el manejo de errores de autenticación global.
 * Debe ser usado una sola vez en el componente raíz de la aplicación.
 */
export const useAuthErrorHandler = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    apiClient.setUnauthorizedHandler((status) => {
      if (status === 401) {
        // Limpiar el estado de autenticación (el menú se limpia automáticamente via extraReducers)
        dispatch(logout());
        // Navegar al login usando React Router
        void navigate('/login', { replace: true });
      } else if (status === 403) {
        // Redirigir a la página principal en caso de acceso prohibido
        void navigate('/', { replace: true });
      }
    });

    // Cleanup: remover el handler al desmontar
    return () => {
      apiClient.setUnauthorizedHandler(() => {});
    };
  }, [navigate, dispatch]);
};
