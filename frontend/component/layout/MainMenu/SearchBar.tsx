import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchBar } from '@/hooks/mainMenu/useSearchBar';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  variant?: 'desktop' | 'sidebar';
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  variant = 'desktop',
  placeholder = 'Buscar módulo…',
}) => {
  const navigate = useNavigate();
  const { options, getTargetForValue } = useSearchBar();
  const isDesktop = variant === 'desktop';
  const [query, setQuery] = useState(searchTerm);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 12);
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 12);
  }, [options, query]);

  const goTo = (url: string) => {
    const target = url.startsWith('/') ? url : `/${url}`;
    void navigate(target);
    setQuery('');
    onSearchChange('');
    setOpen(false);
  };

  const handleSelect = (value: string) => {
    const target = getTargetForValue(value);
    if (target) goTo(target);
  };

  if (isDesktop) {
    return (
      <div className="desktop-search-bar relative flex-1 max-w-[360px] mx-4 lg:mx-8">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearchChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered[0]) {
                handleSelect(filtered[0].value);
              }
            }}
            className={cn(
              'h-9 w-full rounded-lg border-0 bg-slate-800/80 pl-10 pr-3 text-sm text-white',
              'placeholder:text-slate-400 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500',
            )}
            data-testid="desktop-selector"
          />
          {open && filtered.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-lg"
              role="listbox"
            >
              {filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt.value)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearchChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && filtered[0]) {
            handleSelect(filtered[0].value);
          }
        }}
        className={cn(
          'h-9 w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-10 pr-3 text-sm text-white',
          'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600',
        )}
        data-testid="sidebar-selector"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-lg">
          {filtered.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
