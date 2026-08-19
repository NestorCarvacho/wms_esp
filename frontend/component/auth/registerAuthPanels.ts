import { registerSidePanelComponent } from '@/components/layout/SidePanelContainer';
import { LoginSidePanel } from './LoginSidePanel';

export const LOGIN_SIDE_PANEL_KEY = 'LoginSidePanel';

let registered = false;

export function registerAuthPanels() {
  if (registered) return;
  registerSidePanelComponent(LOGIN_SIDE_PANEL_KEY, LoginSidePanel);
  registered = true;
}
