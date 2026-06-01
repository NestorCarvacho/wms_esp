import { registerSidePanelComponent } from '@/components/layout/SidePanelContainer';
import { ProductoEditPanel } from './ProductoEditPanel';
import { BodegaEditPanel } from './BodegaEditPanel';
import { UnidadMedidaEditPanel } from './UnidadMedidaEditPanel';
import { EmpresaEditPanel } from './EmpresaEditPanel';
import { UsuarioEditPanel } from './UsuarioEditPanel';
import { CargoEditPanel } from './CargoEditPanel';
import { RolEditPanel } from './RolEditPanel';
import { TipoZonaEditPanel } from './TipoZonaEditPanel';
import { ZonaBodegaEditPanel } from './ZonaBodegaEditPanel';

let registered = false;

export function registerCrudPanels() {
  if (registered) return;
  registerSidePanelComponent('ProductoEditPanel', ProductoEditPanel);
  registerSidePanelComponent('BodegaEditPanel', BodegaEditPanel);
  registerSidePanelComponent('UnidadMedidaEditPanel', UnidadMedidaEditPanel);
  registerSidePanelComponent('EmpresaEditPanel', EmpresaEditPanel);
  registerSidePanelComponent('UsuarioEditPanel', UsuarioEditPanel);
  registerSidePanelComponent('CargoEditPanel', CargoEditPanel);
  registerSidePanelComponent('RolEditPanel', RolEditPanel);
  registerSidePanelComponent('TipoZonaEditPanel', TipoZonaEditPanel);
  registerSidePanelComponent('ZonaBodegaEditPanel', ZonaBodegaEditPanel);
  registered = true;
}
