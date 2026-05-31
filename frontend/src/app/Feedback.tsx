import { Card } from '@/components/ui/cards/Card';
import { Text } from '@/components/ui/text/Text';
import { colors } from '@/assets/styles/colors';

interface FeedbackProps {
  type?: 'error' | 'success' | 'info';
  message: string;
}

const styles = {
  error: { bg: '#FDEDED', border: colors.feedback.error300, color: colors.feedback.error400 },
  success: { bg: '#EDF7ED', border: colors.feedback.success300, color: '#2E7D32' },
  info: { bg: colors.primary.background, border: colors.primary.auxiliar, color: colors.primary.main },
};

export function Feedback({ type = 'info', message }: FeedbackProps) {
  const palette = styles[type];
  return (
    <Card
      elevation={1}
      padding="12px 16px"
      backgroundColor={palette.bg}
      className="mb-4"
      style={{ border: `1px solid ${palette.border}` }}
    >
      <Text variant="body-regular" color={palette.color}>
        {message}
      </Text>
    </Card>
  );
}

export function StatusPill({ active }: { active: number | boolean }) {
  const isActive = active === 1 || active === true;
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: isActive ? '#E8F5E9' : '#F5F5F5',
        color: isActive ? '#2E7D32' : colors.grays.neutral66,
      }}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}
