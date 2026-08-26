import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { spring, useMotionUITheme, type MotionUITheme } from './ui-theme';

type StaggerKey = keyof MotionUITheme['stagger'];

function travelY(reduce: boolean | null, distance: number): number {
  return reduce ? 0 : distance;
}

export function Reveal({
  children,
  className,
  delay = 0,
  distance,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const theme = useMotionUITheme();
  const reduce = useReducedMotion();
  if (reduce && theme.reducedMotion === 'off') {
    return <div className={className}>{children}</div>;
  }
  const y = travelY(reduce, distance ?? theme.travel.section);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: theme.inView.once, amount: theme.inView.amount }}
      transition={{ ...spring(theme.transitions.ui), delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  stagger = 'base',
  mode = 'inView',
}: {
  children: ReactNode;
  className?: string;
  stagger?: StaggerKey;
  mode?: 'inView' | 'mount';
}) {
  const theme = useMotionUITheme();
  const shared = {
    className,
    variants: {
      hidden: {},
      show: { transition: { staggerChildren: theme.stagger[stagger] } },
    },
    initial: 'hidden' as const,
  };

  if (mode === 'mount') {
    return (
      <motion.div {...shared} animate="show">
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      {...shared}
      whileInView="show"
      viewport={{ once: theme.inView.once, amount: theme.inView.amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  distance,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const theme = useMotionUITheme();
  const reduce = useReducedMotion();
  const y = travelY(reduce, distance ?? theme.travel.enter);

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: spring(theme.transitions.ui),
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function PageEnter({ children, className }: { children: ReactNode; className?: string }) {
  const theme = useMotionUITheme();
  const reduce = useReducedMotion();
  const y = travelY(reduce, theme.travel.enter);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring(theme.transitions.gentle)}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  const theme = useMotionUITheme();
  const reduce = useReducedMotion();
  const y = reduce ? 0 : -theme.travel.hover;

  return (
    <motion.div
      className={className}
      whileHover={{ y }}
      transition={spring(theme.transitions.snap)}
    >
      {children}
    </motion.div>
  );
}
