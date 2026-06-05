import { cn } from '@/lib/utils';

const CELL_W = 52;
const CELL_H = 36;
const AISLE_W = 14;
const RACK_COLS = 4;
const RACK_ROWS = 3;
const BLOCK_W = RACK_COLS * CELL_W + AISLE_W;
const BLOCK_H = RACK_ROWS * CELL_H + AISLE_W;

/**
 * Opción A — Minimal pro: gradiente + grid de celdas de almacén (pasillos y ubicaciones).
 */
export function LoginBackgroundOptionA() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-to-br from-slate-50 via-white to-slate-100',
          'dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_at_50%_0%,rgba(148,163,184,0.18),transparent_58%)]',
          'dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(71,85,105,0.25),transparent_60%)]',
        )}
      />

      <svg
        className={cn(
          'absolute inset-0 h-full w-full',
          'text-slate-400 dark:text-slate-600',
          'opacity-[0.22] dark:opacity-[0.16]',
        )}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="warehouse-rack-block"
            width={BLOCK_W}
            height={BLOCK_H}
            patternUnits="userSpaceOnUse"
          >
            {/* Pasillo horizontal */}
            <rect
              x={0}
              y={RACK_ROWS * CELL_H}
              width={BLOCK_W}
              height={AISLE_W}
              fill="currentColor"
              opacity={0.06}
            />
            {/* Pasillo vertical */}
            <rect
              x={RACK_COLS * CELL_W}
              y={0}
              width={AISLE_W}
              height={BLOCK_H}
              fill="currentColor"
              opacity={0.06}
            />
            {/* Celdas de ubicación */}
            {Array.from({ length: RACK_ROWS }, (_, row) =>
              Array.from({ length: RACK_COLS }, (_, col) => {
                const x = col * CELL_W + 1;
                const y = row * CELL_H + 1;
                const filled = (row + col) % 5 === 0;
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={x}
                    y={y}
                    width={CELL_W - 2}
                    height={CELL_H - 2}
                    rx={2}
                    fill={filled ? 'currentColor' : 'none'}
                    fillOpacity={filled ? 0.07 : 0}
                    stroke="currentColor"
                    strokeWidth={0.75}
                    opacity={0.85}
                  />
                );
              }),
            )}
            {/* Etiqueta de pasillo (línea central) */}
            <line
              x1={0}
              y1={RACK_ROWS * CELL_H + AISLE_W / 2}
              x2={RACK_COLS * CELL_W}
              y2={RACK_ROWS * CELL_H + AISLE_W / 2}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="4 6"
              opacity={0.35}
            />
          </pattern>

          <pattern
            id="warehouse-floor"
            width={BLOCK_W * 2}
            height={BLOCK_H * 2}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill="url(#warehouse-rack-block)" />
            <use href="#warehouse-rack-block" x={BLOCK_W} y={0} />
            <use href="#warehouse-rack-block" x={0} y={BLOCK_H} />
            <use href="#warehouse-rack-block" x={BLOCK_W} y={BLOCK_H} />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#warehouse-floor)" />

        {/* Marco exterior tipo planta */}
        <rect
          x={48}
          y={48}
          width={1344}
          height={804}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.2}
          rx={8}
        />
      </svg>

      {/* Viñeta suave hacia el centro (card legible) */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_42%,rgba(248,250,252,0.55)_100%)]',
          'dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_38%,rgba(2,6,23,0.72)_100%)]',
        )}
      />
    </div>
  );
}
