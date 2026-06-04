# Hooks del frontend WMS

## Antes de crear un hook nuevo

Revisa hooks existentes en `ui/`, `mainMenu/` y `src/crud/` (misma idea: tabla, formularios, menú, UI).

## Hooks activos (este proyecto)

| Carpeta | Uso |
|---------|-----|
| `ui/` | Tabla, tooltips, navegación; `useUI` reexporta `UIContext` |
| `mainMenu/` | Menú lateral y búsqueda |
| `../crud/usePaginatedCrudTable.ts` | Listados CRUD con paginación y búsqueda server-side |

Los hooks nuevos del WMS van en `ui/`, `mainMenu/` o `crud/` según corresponda.
