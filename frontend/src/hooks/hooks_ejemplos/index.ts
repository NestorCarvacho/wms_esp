import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// Redux hooks with TypeScript
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();


// Account hooks
export * from './account';

// MainMenu hooks
export * from './mainMenu';
export * from './attendance';
export * from './employee';
export * from './company';

// UI hooks
export * from './ui';
export * from './ui/filters/calendar';

// Re-export del hook personalizado de counter
export { useUI } from './ui/useUI.ts';
