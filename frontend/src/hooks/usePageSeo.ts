import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoForPath } from '@/config/seo';

export function usePageSeo() {
  const { pathname } = useLocation();
  return useMemo(() => getSeoForPath(pathname), [pathname]);
}
