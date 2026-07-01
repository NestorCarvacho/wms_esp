import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/cards';
import { Text } from '@/components/ui/text/Text';
import { colorClass } from '@/assets/styles/colors';
import { palette } from '@/assets/styles/colors';
import type {
  Bodega,
  InventarioHistogramaDia,
  InventarioStockDistribucion,
} from '@/types/api';
import { useLocale } from '@/context/LocaleContext';
import { useTranslation } from '@/i18n';

const MOV_COLORS = {
  recepcion: palette.success,
  traslado: palette.brandLight,
  despacho: palette.accent,
} as const;

const PIE_COLORS = [
  palette.brandLight,
  palette.accent,
  palette.success,
  palette.brandAux,
  '#7E57C2',
  '#26A69A',
  '#EC407A',
  '#8D6E63',
  '#5C6BC0',
  '#FFA726',
];

function formatFechaCorta(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

interface InventarioDashboardChartsProps {
  histograma: InventarioHistogramaDia[];
  stockDistribucion: InventarioStockDistribucion;
  bodegas: Bodega[];
  chartBodegaId: string;
  onChartBodegaChange: (value: string) => void;
  selectClass: string;
  diasHistograma?: number;
}

export function InventarioDashboardCharts({
  histograma,
  stockDistribucion,
  bodegas,
  chartBodegaId,
  onChartBodegaChange,
  selectClass,
  diasHistograma = 30,
}: InventarioDashboardChartsProps) {
  const { formatNumber } = useLocale();
  const { t } = useTranslation('inventario');

  const histogramaData = histograma.map((d) => ({
    ...d,
    etiqueta: formatFechaCorta(d.fecha),
  }));

  const pieData = stockDistribucion.items.map((item) => ({
    name: item.etiqueta,
    value: item.cantidad,
    porcentaje: item.porcentaje,
    lineas: item.lineas,
  }));

  const pieTitulo =
    stockDistribucion.nivel === 'ubicacion'
      ? 'Stock por ubicación'
      : 'Stock por bodega';

  const pieSubtitulo =
    stockDistribucion.nivel === 'ubicacion'
      ? 'Cantidad total en cada zona de la bodega seleccionada'
      : 'Distribución del inventario entre bodegas de la empresa';

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card elevation={1} padding="20px">
        <Text variant="body-medium" className={colorClass.brandLight}>
          Movimientos por día (últimos {diasHistograma} días)
        </Text>
        <Text variant="small-regular" className={`mt-1 ${colorClass.muted}`}>
          Histograma apilado por tipo de operación
        </Text>
        <div className="mt-4 h-72 w-full">
          {histogramaData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Text variant="small-regular" className={colorClass.muted}>
                Sin movimientos en el período
              </Text>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramaData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="etiqueta"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as InventarioHistogramaDia | undefined;
                    return row?.fecha ?? '';
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="recepcion"
                  name="Recepción"
                  stackId="mov"
                  fill={MOV_COLORS.recepcion}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="traslado"
                  name="Traslado"
                  stackId="mov"
                  fill={MOV_COLORS.traslado}
                />
                <Bar
                  dataKey="despacho"
                  name="Despacho"
                  stackId="mov"
                  fill={MOV_COLORS.despacho}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card elevation={1} padding="20px">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Text variant="body-medium" className={colorClass.brandLight}>
              {pieTitulo}
            </Text>
            <Text variant="small-regular" className={`mt-1 ${colorClass.muted}`}>
              {pieSubtitulo}
            </Text>
          </div>
          <div className="min-w-[180px] flex-1 sm:max-w-[220px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Filtrar por bodega
            </label>
            <select
              className={selectClass}
              value={chartBodegaId}
              onChange={(e) => onChartBodegaChange(e.target.value)}
            >
              <option value="">Todas las bodegas</option>
              {bodegas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 h-72 w-full">
          {pieData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Text variant="small-regular" className={colorClass.muted}>
                Sin stock registrado
              </Text>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                  label={({ name, percent }) => {
                    const pct = percent ?? 0;
                    return pct >= 0.06 ? `${name} (${(pct * 100).toFixed(0)}%)` : '';
                  }}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value, _name, item) => {
                    const row = item.payload as {
                      porcentaje: number;
                      lineas: number;
                    };
                    return [
                      `${formatNumber(Number(value))} u. (${row.porcentaje}% · ${row.lineas} líneas)`,
                      item.name,
                    ];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {stockDistribucion.total_cantidad > 0 && (
          <Text variant="small-regular" className={`mt-2 text-center ${colorClass.muted}`}>
            {t('dashboard.totalUnits', { formatted: formatNumber(stockDistribucion.total_cantidad) })}
          </Text>
        )}
      </Card>
    </div>
  );
}
