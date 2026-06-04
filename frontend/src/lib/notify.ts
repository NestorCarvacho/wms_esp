import { toast } from 'sonner';
import type { NotificationType } from '@/store/slices/uiSlice';

export function showAppToast(input: {
  type: NotificationType;
  message: string;
  duration?: number;
}) {
  const duration = input.duration ?? 3000;
  const opts = { duration };

  switch (input.type) {
    case 'success':
      toast.success(input.message, opts);
      break;
    case 'error':
      toast.error(input.message, opts);
      break;
    case 'warning':
    case 'important':
      toast.warning(input.message, opts);
      break;
    default:
      toast.info(input.message, opts);
  }
}
