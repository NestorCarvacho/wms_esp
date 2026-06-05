# Frontend UI — shadcn/ui

Sistema de componentes: **[shadcn/ui](https://ui.shadcn.com)** en `component/ui/shadcn/`.

**Sera UI eliminado** (`src/sera/` borrado).

## Componentes shadcn en uso

| Área | shadcn | Wrapper / host WMS |
|------|--------|-------------------|
| Botones | `button` | `PrimaryButton` |
| Inputs | `input`, `label` | `LabelInput` |
| Cards | `card` | `Card` |
| Tablas | `table` | `Table` |
| Modales | `dialog` | `ModalContainer` |
| Side panels | `sheet` | `SidePanelContainer` |
| Notificaciones | `sonner` | `NotificationContainer`, `showAppToast` |
| Filtros | `popover`, `command` | `ComboBox` |
| Menú superior | `dropdown-menu` | `NavigationBar`, `ToolsBar` (usuario) |
| Menú móvil | — | `SideMenu` + `component/ui/menu/*` |
| Tooltips | `tooltip` | `Tooltip`, celdas tabla (`_TableCell`) |
| Migas de pan | `breadcrumb` | `Breadcrumb` (`PageLayout`) |
| Menú acciones tabla | `dropdown-menu` | `ActionMenu` (icono ⋯) |

## Tokens de color

`src/assets/styles/colors.ts` exporta `colorClass` (Tailwind) y `palette` (hex solo para estilos inline legacy).

## Añadir componentes 

```bash
cd frontend
npx shadcn@latest add dropdown-menu
```

`components.json` → `"ui": "@/components/ui/shadcn"`.

## DataTables.net

Eliminado. Tablas = React + shadcn `Table`.
