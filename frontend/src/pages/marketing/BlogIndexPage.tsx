import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { Card } from '@/components/ui/cards';
import { HoverLift, Stagger, StaggerItem } from '@/components/marketing/motion';
import { SEO_ROUTES } from '@/config/seo';
import { BLOG_POSTS } from '@/content/blog/posts';
import { PATHS } from '@/routes/paths';

export function BlogIndexPage() {
  return (
    <MarketingLayout meta={SEO_ROUTES['/blog']}>
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-20">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Blog WMS e inventario</h1>
        <p className="mt-4 text-muted-foreground">
          Guías sobre gestión de bodega, control de stock y mejores prácticas para PYME en Chile.
        </p>

        <Stagger className="mt-12 space-y-6" stagger="base">
          {BLOG_POSTS.map((post) => (
            <StaggerItem key={post.slug}>
              <HoverLift>
                <Card elevation={1} padding="24px" className="border-border/60 bg-card/95">
                  <Link to={`${PATHS.blog}/${post.slug}`} className="group block">
                    <h2 className="text-xl font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.publishedAt}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readMinutes} min lectura
                      </span>
                    </div>
                  </Link>
                </Card>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </MarketingLayout>
  );
}
