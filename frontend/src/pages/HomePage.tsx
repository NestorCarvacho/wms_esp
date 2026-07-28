import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useMenu } from '@/api';
import { useAuthContext } from '@/context/AuthContext';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';
import { mainMenuIconName, sectionIconName } from '@/components/ui/menu';
import { appPath } from '@/routes/paths';
import { APP_NAME } from '@/config/appBrand';
import type { MenuItem, MenuLinkNode } from '@/api/menuConfig';
import { cn } from '@/lib/utils';

function linkIcon(link: MenuLinkNode): IconScoutName {
  const name = link.routeMetadata?.iconName;
  const allowed: IconScoutName[] = [
    'folderOpen',
    'usersAlt',
    'setting',
    'building',
    'layers',
    'table',
    'user',
    'lock',
    'home',
    'search',
  ];
  if (name && allowed.includes(name as IconScoutName)) return name as IconScoutName;
  return 'layers';
}

function ScreenLink({ link }: { link: MenuLinkNode }) {
  if (!link.url || link.url === appPath()) return null;

  return (
    <Link
      to={link.url}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3',
        'text-foreground transition-colors',
        'hover:border-primary/40 hover:bg-[rgba(37,99,235,0.06)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-muted text-primary">
        <IconScout name={linkIcon(link)} size="md" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold">{link.title}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function MenuBlock({ item }: { item: MenuItem }) {
  const sections = (item.children ?? []).filter((s) => (s.children?.length ?? 0) > 0);
  if (sections.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">
          <IconScout name={mainMenuIconName(item)} size="md" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h2>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const links = (section.children ?? []).filter((l) => l.url && l.url !== appPath());
          if (links.length === 0) return null;

          return (
            <div key={`${item.id}-${section.title}`} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <IconScout name={sectionIconName(section.icon)} size="sm" />
                <span>{section.title}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {links.map((link) => (
                  <ScreenLink key={String(link.id)} link={link} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HomePage() {
  const { user } = useAuthContext();
  const { mainMenu, configMenu } = useMenu();
  const blocks = configMenu ? [...mainMenu, configMenu] : mainMenu;
  const greetingName = user?.email?.split('@')[0] ?? 'usuario';

  return (
    <PageLayout
      icon="home"
      supportingText={`Accede a las pantallas disponibles según tus permisos en ${APP_NAME}.`}
    >
      <div className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Hola, <span className="font-medium text-foreground">{greetingName}</span>
        </p>

        {blocks.length === 0 ? (
          <p className="rounded-2xl border border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
            No tienes pantallas asignadas. Contacta a un administrador para revisar tus permisos.
          </p>
        ) : (
          blocks.map((item) => <MenuBlock key={item.id} item={item} />)
        )}

        <div className="border-t border-border pt-6">
          <Link
            to={appPath('/perfil')}
            className={cn(
              'inline-flex items-center gap-2 text-sm font-medium text-primary',
              'hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md',
            )}
          >
            <IconScout name="user" size="sm" />
            Ir a mi perfil
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;
