import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

export function useMenuNavigation() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [activeMenuItem, setActiveMenuItem] = useState<number | null>(null);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuTimerRef = useRef<number | null>(null);
  const configTimerRef = useRef<number | null>(null);

  const clearMenuTimer = useCallback(() => {
    if (menuTimerRef.current) {
      window.clearTimeout(menuTimerRef.current);
      menuTimerRef.current = null;
    }
  }, []);

  const clearConfigTimer = useCallback(() => {
    if (configTimerRef.current) {
      window.clearTimeout(configTimerRef.current);
      configTimerRef.current = null;
    }
  }, []);

  const handleMenuItemEnter = useCallback((itemId: number) => {
    clearMenuTimer();
    setIsConfigMenuOpen(false);
    setActiveMenuItem(itemId);
  }, [clearMenuTimer]);

  const handleMenuItemLeave = useCallback(() => {
    clearMenuTimer();
    menuTimerRef.current = window.setTimeout(() => setActiveMenuItem(null), 150);
  }, [clearMenuTimer]);

  const handleConfigMenuEnter = useCallback(() => {
    clearConfigTimer();
    setActiveMenuItem(null);
    setIsConfigMenuOpen(true);
  }, [clearConfigTimer]);

  const handleConfigMenuLeave = useCallback(() => {
    clearConfigTimer();
    configTimerRef.current = window.setTimeout(() => setIsConfigMenuOpen(false), 150);
  }, [clearConfigTimer]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleUserMenuClose = useCallback(() => setIsUserMenuOpen(false), []);
  const handleMobileMenuToggle = useCallback(() => setIsMobileMenuOpen((v) => !v), []);
  const handleSearchChange = useCallback((term: string) => setSearchTerm(term), []);

  return {
    activeMenuItem,
    isConfigMenuOpen,
    isMobileMenuOpen,
    isUserMenuOpen,
    searchTerm,
    setIsMobileMenuOpen,
    setIsUserMenuOpen,
    handleMenuItemEnter,
    handleMenuItemLeave,
    handleConfigMenuEnter,
    handleConfigMenuLeave,
    clearMenuTimer,
    clearConfigTimer,
    handleLogout,
    handleUserMenuClose,
    handleMobileMenuToggle,
    handleSearchChange,
    navigate: (path: string) => navigate(path),
  };
}
