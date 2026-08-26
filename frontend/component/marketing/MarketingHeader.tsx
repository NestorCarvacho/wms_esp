import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { LogoWms } from '@/components/ui/images';
import { PrimaryButton } from '@/components/ui/buttons';
import { APP_NAME } from '@/config/appBrand';
import { PATHS } from '@/routes/paths';
import { useLoginPanel } from '@/hooks/useLoginPanel';
import { spring, useMotionUITheme } from './motion';

const NAV_LINKS = [
  { label: 'Software bodega', to: PATHS.softwareBodega },
  { label: 'Control inventario', to: PATHS.controlInventario },
  { label: 'WMS PYME', to: PATHS.wmsPyme },
  { label: 'Precios', to: PATHS.precios },
  { label: 'Blog', to: PATHS.blog },
  { label: 'Nosotros', to: PATHS.nosotros },
] as const;

export function MarketingHeader() {
  const openLoginPanel = useLoginPanel();
  const theme = useMotionUITheme();
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);

  useMotionValueEvent(scrollY, 'change', (value) => {
    setCompact(value > 24);
  });

  return (
    <motion.header
      className="sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-md"
      animate={{
        boxShadow: compact ? '0 10px 30px hsl(var(--foreground) / 0.08)' : '0 0 0 hsl(var(--foreground) / 0)',
      }}
      transition={spring(theme.transitions.snap)}
    >
      <motion.div
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4"
        animate={{ paddingTop: compact ? 8 : 12, paddingBottom: compact ? 8 : 12 }}
        transition={spring(theme.transitions.snap)}
      >
        <Link to={PATHS.landing} className="flex items-center gap-2 hover:opacity-90">
          <LogoWms variant="solo" className="h-10 w-auto" alt={APP_NAME} />
          <span className="hidden text-sm font-semibold sm:inline">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to={PATHS.demo} className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
            Demo
          </Link>
          <PrimaryButton type="button" colorVariant="success" className="gap-2" onClick={openLoginPanel}>
            Ingresar
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </motion.div>
    </motion.header>
  );
}
