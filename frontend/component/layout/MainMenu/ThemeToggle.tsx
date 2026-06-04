import { Moon, Sun } from 'lucide-react';
import { NavIcon } from '@/components/ui/buttons';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <NavIcon
      icon={isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      onClick={toggleTheme}
      className="shrink-0"
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    />
  );
};

export default ThemeToggle;
