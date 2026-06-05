import { cn } from '@/lib/utils';

/**
 * Opción B — Tech smart: nodos, conexiones, barcode y ubicación (muy tenue).
 */
export function LoginBackgroundOptionB() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/80',
          'dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
        )}
      />
      <div
        className={cn(
          'absolute inset-0 opacity-70 dark:opacity-100',
          'bg-[radial-gradient(ellipse_at_20%_0%,rgba(59,130,246,0.12),transparent_50%)]',
          'dark:bg-[radial-gradient(ellipse_at_20%_0%,rgba(59,130,246,0.08),transparent_55%)]',
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_at_80%_100%,rgba(16,185,129,0.08),transparent_45%)]',
          'dark:bg-[radial-gradient(ellipse_at_80%_100%,rgba(16,185,129,0.06),transparent_50%)]',
        )}
      />

      <svg
        className={cn(
          'absolute inset-0 h-full w-full',
          'text-slate-400/90 dark:text-slate-500/90',
          'opacity-[0.14] dark:opacity-[0.11]',
        )}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="login-b-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.35"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-b-grid)" />

        <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
          <path d="M120 180 L280 140 L420 220 L560 160 L720 200" opacity="0.5" />
          <path d="M200 380 L360 340 L520 400 L680 360 L840 420" opacity="0.45" />
          <path d="M960 120 L1100 200 L1280 160" opacity="0.4" />
          <path d="M100 620 L260 580 L400 640 L540 600 L700 660 L860 620" opacity="0.45" />
          <path d="M280 140 L360 340 L520 400" opacity="0.35" />
          <path d="M420 220 L520 400 L680 360" opacity="0.35" />
          <path d="M720 200 L840 420 L1100 200" opacity="0.3" />
          <path d="M560 160 L680 360 L860 620" opacity="0.3" />
          <path d="M400 640 L540 600 L860 620" opacity="0.35" />
          <path d="M1280 160 L1180 480 L1020 520" opacity="0.35" />
          <path d="M1180 480 L860 620" opacity="0.25" />
        </g>

        <g fill="currentColor">
          {[
            [120, 180],
            [280, 140],
            [420, 220],
            [560, 160],
            [720, 200],
            [200, 380],
            [360, 340],
            [520, 400],
            [680, 360],
            [840, 420],
            [960, 120],
            [1100, 200],
            [1280, 160],
            [100, 620],
            [260, 580],
            [400, 640],
            [540, 600],
            [700, 660],
            [860, 620],
            [1180, 480],
            [1020, 520],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 4 : 3} opacity={i % 4 === 0 ? 0.55 : 0.4} />
          ))}
          <circle cx={720} cy={450} r={6} opacity="0.65" />
          <circle cx={720} cy={450} r={14} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        </g>

        <g fill="currentColor" opacity="0.5">
          <Barcode x={80} y={720} scale={0.9} />
          <Barcode x={1240} y={80} scale={0.75} />
          <Barcode x={1180} y={760} scale={0.65} />
        </g>

        <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55">
          <MapPin cx={180} cy={120} size={28} />
          <MapPin cx={1320} cy={380} size={24} />
          <MapPin cx={320} cy={780} size={22} />
          <MapPin cx={1050} cy={680} size={26} />
        </g>
      </svg>
    </div>
  );
}

function Barcode({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const bars = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1];
  let offset = 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {bars.map((w, i) => {
        const rect = <rect key={i} x={offset} y={0} width={w * 2} height={32} rx={0.5} />;
        offset += w * 2 + 2;
        return rect;
      })}
    </g>
  );
}

function MapPin({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const h = size;
  const w = size * 0.72;
  return (
    <g transform={`translate(${cx - w / 2} ${cy - h})`}>
      <path
        d={`M ${w / 2} ${h} C ${w / 2} ${h} 0 ${h * 0.55} 0 ${h * 0.35} a ${w / 2} ${h * 0.35} 0 1 1 ${w} 0 C ${w} ${h * 0.55} ${w / 2} ${h} ${w / 2} ${h} z`}
      />
      <circle cx={w / 2} cy={h * 0.35} r={h * 0.12} fill="currentColor" stroke="none" opacity="0.4" />
    </g>
  );
}
