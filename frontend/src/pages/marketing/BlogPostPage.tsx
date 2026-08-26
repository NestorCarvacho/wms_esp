import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { Reveal, Stagger, StaggerItem } from '@/components/marketing/motion';
import { PrimaryButton } from '@/components/ui/buttons';
import { getBlogPost } from '@/content/blog/posts';
import { APP_NAME } from '@/config/appBrand';
import { PATHS } from '@/routes/paths';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return <NotFoundPage />;
  }

  const meta = {
    path: `/blog/${post.slug}`,
    title: `${post.title} — Blog ${APP_NAME}`,
    description: post.description,
    keywords: post.keywords,
    ogType: 'article' as const,
  };

  return (
    <MarketingLayout
      meta={meta}
      article={{ publishedTime: post.publishedAt, author: APP_NAME }}
    >
      <article className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <Link
          to={PATHS.blog}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al blog
        </Link>

        <header className="mt-6">
          <time dateTime={post.publishedAt} className="text-sm text-muted-foreground">
            {post.publishedAt} · {post.readMinutes} min lectura
          </time>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
        </header>

        <Stagger className="mt-10 space-y-10" stagger="relaxed">
          {post.sections.map((section) => (
            <StaggerItem key={section.heading ?? section.paragraphs?.[0]?.slice(0, 30) ?? 'section'}>
              <section>
                {section.heading && <h2 className="text-xl font-bold">{section.heading}</h2>}
                {section.paragraphs?.map((p) => (
                  <p key={p.slice(0, 50)} className="mt-4 leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-16 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <p className="font-semibold">¿Quieres probar Khepri en tu bodega?</p>
          <p className="mt-2 text-sm text-muted-foreground">Planes desde CLP 29.900/mes — oferta fundadores</p>
          <Link to={PATHS.demo} className="mt-4 inline-block">
            <PrimaryButton type="button" colorVariant="success">
              Agendar demo gratis
            </PrimaryButton>
          </Link>
        </Reveal>
      </article>
    </MarketingLayout>
  );
}
