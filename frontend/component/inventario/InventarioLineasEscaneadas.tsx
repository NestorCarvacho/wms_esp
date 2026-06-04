import { Text } from '@/components/ui/text/Text';
import { LinkButton } from '@/components/ui/buttons';
import type { LineaEscaneada } from '@/pages/inventario/lineasEscaneadas';
import { totalUnidades } from '@/pages/inventario/lineasEscaneadas';
import { cn } from '@/lib/utils';

interface InventarioLineasEscaneadasProps {
  lineas: LineaEscaneada[];
  onQuitar: (lineId: string) => void;
  onCantidadChange: (lineId: string, cantidad: number) => void;
  disabled?: boolean;
}

export function InventarioLineasEscaneadas({
  lineas,
  onQuitar,
  onCantidadChange,
  disabled = false,
}: InventarioLineasEscaneadasProps) {
  const total = totalUnidades(lineas);

  return (
    <div
      className={cn(
        'flex h-full min-h-[320px] flex-col rounded-lg border border-border',
        'bg-muted/40 dark:bg-muted/20',
      )}
    >
      <div className="border-b border-border bg-card px-3 py-2">
        <Text variant="body-medium" className="font-medium text-foreground">
          Escaneados
        </Text>
        <Text variant="body-regular" className="text-muted-foreground">
          {lineas.length} línea(s) · {total} unidad(es)
        </Text>
      </div>

      <ul className="flex-1 overflow-y-auto p-2">
        {lineas.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted-foreground">
            Escanee códigos con la pistola. Cada lectura suma una unidad al producto.
          </li>
        ) : (
          lineas.map((linea) => (
            <li
              key={linea.lineId}
              className="mb-2 rounded-md border border-border bg-card p-2 shadow-sm last:mb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <code className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {linea.sku}
                  </code>
                  <p
                    className="truncate text-sm text-foreground"
                    title={linea.nombre}
                  >
                    {linea.nombre}
                  </p>
                </div>
                <LinkButton
                  type="button"
                  onClick={() => onQuitar(linea.lineId)}
                  disabled={disabled}
                  className="shrink-0 text-xs"
                >
                  Quitar
                </LinkButton>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                Cant.
                <input
                  type="number"
                  min={1}
                  step={1}
                  disabled={disabled}
                  className="w-16 rounded border border-input bg-background px-2 py-1 text-sm text-foreground"
                  value={linea.cantidad}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    if (!Number.isNaN(qty)) onCantidadChange(linea.lineId, qty);
                  }}
                />
              </label>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
