import { Card } from '@/components/ui/cards/Card';
import { Text } from '@/components/ui/text/Text';
import { cn } from '@/lib/utils';
import { colorClass } from '@/assets/styles/colors';

interface FeedbackProps {
  type?: 'error' | 'success' | 'info';
  message: string;
}

const feedbackClass = {
  error: 'bg-red-50 border-red-300',
  success: 'bg-emerald-50 border-emerald-400',
  info: 'bg-blue-50 border-blue-300',
} as const;

const feedbackTextClass = {
  error: colorClass.destructive,
  success: colorClass.success,
  info: colorClass.brand,
} as const;

export function Feedback({ type = 'info', message }: FeedbackProps) {
  return (
    <Card
      elevation={1}
      padding="12px 16px"
      className={cn('mb-4 border', feedbackClass[type])}
    >
      <Text variant="body-regular" className={feedbackTextClass[type]}>
        {message}
      </Text>
    </Card>
  );
}

export function StatusPill({ active }: { active: number | boolean }) {
  const isActive = active === 1 || active === true;
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
      )}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}
