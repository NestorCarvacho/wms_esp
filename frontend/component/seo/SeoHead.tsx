import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/config/appBrand';
import type { SeoMeta } from '@/config/seo';
import { canonicalUrl, SITE_URL } from '@/config/seo';

interface SeoHeadProps {
  meta: SeoMeta;
  article?: { publishedTime?: string; author?: string };
}

export function SeoHead({ meta, article }: SeoHeadProps) {
  const canonical = canonicalUrl(meta.path);
  const ogImage = `${SITE_URL.replace(/\/$/, '')}/og-image.svg`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      <link rel="canonical" href={canonical} />
      {meta.noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={meta.ogType ?? 'website'} />
      <meta property="og:locale" content="es_CL" />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImage} />

      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.author && <meta name="author" content={article.author} />}
    </Helmet>
  );
}
