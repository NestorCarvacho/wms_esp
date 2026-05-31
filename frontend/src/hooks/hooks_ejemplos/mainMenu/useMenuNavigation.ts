import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '@/hooks/ui';
import { useAppDispatch } from '@/hooks';
import { logout } from '@/store/slices/authSlice.ts';


export const useMenuNavigation = () => {
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const dispatch = useAppDispatch();
  
  // Estados del menú
  const [activeMenuItem, setActiveMenuItem] = useState<number | null>(null);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Refs para los timers
  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Función para limpiar timers
  const clearMenuTimer = useCallback(() => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
  }, []);

  const clearConfigTimer = useCallback(() => {
    if (configCloseTimer.current) {
      clearTimeout(configCloseTimer.current);
      configCloseTimer.current = null;
    }
  }, []);

  // Handlers mejorados con delay
  const handleMenuItemEnter = useCallback((itemId: number) => {
    clearMenuTimer();
    setActiveMenuItem(itemId);
  }, [clearMenuTimer]);

  const handleMenuItemLeave = useCallback(() => {
    clearMenuTimer();
    menuCloseTimer.current = setTimeout(() => {
      setActiveMenuItem(null);
    }, 150); // 150ms delay antes de cerrar
  }, [clearMenuTimer]);

  const handleConfigMenuEnter = useCallback(() => {
    clearConfigTimer();
    setIsConfigMenuOpen(true);
  }, [clearConfigTimer]);

  const handleConfigMenuLeave = useCallback(() => {
    clearConfigTimer();
    configCloseTimer.current = setTimeout(() => {
      setIsConfigMenuOpen(false);
    }, 150); // 150ms delay antes de cerrar
  }, [clearConfigTimer]);

  // Handlers existentes
  const handleLogout = () => {
    dispatch(logout());
    showNotification('info', 'Has cerrado sesión exitosamente', 3000);
    void navigate('/login', { replace: true });
  };

  const handleUserMenuClose = () => {
    setIsUserMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return {
    // Estados
    activeMenuItem,
    isConfigMenuOpen,
    isMobileMenuOpen,
    isUserMenuOpen,
    searchTerm,
    
    // Setters (mantenidos para compatibilidad)
    setActiveMenuItem,
    setIsConfigMenuOpen,
    setIsMobileMenuOpen,
    setIsUserMenuOpen,
    
    // Handlers mejorados
    handleMenuItemEnter,
    handleMenuItemLeave,
    handleConfigMenuEnter,
    handleConfigMenuLeave,
    clearMenuTimer,
    clearConfigTimer,
    
    // Handlers existentes
    handleLogout,
    handleUserMenuClose,
    handleMobileMenuToggle,
    handleSearchChange,
    
    // Navigation
    navigate,
  };
};
