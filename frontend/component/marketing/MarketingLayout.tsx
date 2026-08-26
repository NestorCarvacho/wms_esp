import { useEffect, type ReactNode } from 'react';
import { LoginBackground } from '@/components/layout/LoginBackground';
import { SeoHead } from '@/components/seo/SeoHead';
import type { SeoMeta } from '@/config/seo';
import { MarketingMotionRoot, PageEnter } from './motion';
import { MarketingFooter } from './MarketingFooter';
import { MarketingHeader } from './MarketingHeader';

interface MarketingLayoutProps {
  meta: SeoMeta;
  children: ReactNode;
  article?: { publishedTime?: string; author?: string };
  forceDark?: boolean;
}

export function MarketingLayout({ meta, children, article, forceDark = true }: MarketingLayoutProps) {
  useEffect(() => {
    if (!forceDark) return;
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark');
    return () => {
      if (!wasDark) root.classList.remove('dark');
    };
  }, [forceDark]);

  return (
    <MarketingMotionRoot>
      <div className="relative min-h-screen text-foreground">
        <SeoHead meta={meta} article={article} />
        <LoginBackground />
        <MarketingHeader />
        <main className="relative z-10">
          <PageEnter>{children}</PageEnter>
        </main>
        <MarketingFooter />
      </div>
    </MarketingMotionRoot>
  );
}
