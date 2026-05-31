import { useMemo } from 'react';
import type { SelectorOption } from '@/components/ui/inputs/Selector';
import { useMenu } from '@/api';
import type { MenuItem } from '@/api';


export type MenuNode = MenuItem;

const normalize = (str: string) => str
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export const useSearchBar = () => {
  const { mainMenu, configMenu } = useMenu();

  const memo = useMemo<{ options: SelectorOption[]; valueToUrl: Map<string, string> }>(() => {
    const flat: Array<{ title: string; url?: string | null; relatedWords?: string | null }> = [];
    const walk = (nodes: MenuNode[] | null | undefined) => {
      nodes?.forEach((node) => {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        if (!hasChildren || node.url) {
          flat.push({ title: node.title, url: node.url, relatedWords: node.relatedWords });
        }
        if (hasChildren) walk(node.children);
      });
    };
    walk(mainMenu || []);
    if (configMenu) walk([configMenu]);

    const seen = new Set<string>();
    const deduped: Array<{ title: string; url?: string | null; relatedWords?: string | null }> = [];
    for (const node of flat) {
      const titleKey = `t:${normalize(node.title)}`;
      const urlKey = `u:${normalize(String(node.url ?? ''))}`;
      const pairKey = `${titleKey}|${urlKey}`;
      // Only treat as duplicate when BOTH title and URL match
      if (!seen.has(pairKey)) {
        seen.add(pairKey);
        deduped.push(node);
      }
    }

    const formatPath = (raw: string) => {
      const cleaned = String(raw).trim().replace(/^\/+|\/+$/g, '');
      if (!cleaned) return '';
      const parts = cleaned.split('/').filter(Boolean).map((seg) => {
        const spaced = seg.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
        const words = spaced.toLowerCase().split(' ').filter(Boolean);
        if (words.length === 0) return '';
        const first = words[0];
        const rest = words.slice(1);
        return `${first.charAt(0).toUpperCase()}${first.slice(1)}${rest.length ? ' ' + rest.join(' ') : ''}`;
      });
      return parts.join(' / ');
    };

    const valueToUrl = new Map<string, string>();
    const options = deduped.map((node, index) => {
      const label = node.title;
      const url = node.url || undefined;
      const related = node.relatedWords || '';
      const normalizedLabel = normalize(label);
      const normalizedRelated = normalize(related);
      const tokens = [normalizedLabel, normalizedRelated]
        .filter(Boolean)
        .join(' ')
        .trim();
      const value = `${normalizedLabel}|${normalize(url ?? '')}|${index}`;
      if (url) valueToUrl.set(value, url);
      const supportingText = url ? formatPath(url) : undefined;
      return {
        value,
        label,
        supportingText,
        searchTokens: tokens || undefined,
      } satisfies SelectorOption;
    });

    return { options, valueToUrl };
  }, [mainMenu, configMenu]);

  const { options, valueToUrl } = memo;

  const getTargetForValue = (val: string | string[]): string | null => {
    const selected = Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
    const raw = valueToUrl.get(selected) ?? null;
    return raw ?? null;
  };

  return { options, getTargetForValue };
};

export default useSearchBar;
