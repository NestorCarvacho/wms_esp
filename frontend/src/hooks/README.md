# Hooks del frontend WMS

## Antes de crear un hook nuevo

**Consulta primero** `hooks_ejemplos/`: ahí están los patrones de referencia (tabla, formularios, menú, UI). Copia la idea y adáptala al WMS; no importes archivos desde esa carpeta.

## Hooks activos (este proyecto)

| Carpeta | Uso |
|---------|-----|
| `ui/` | Tabla, tooltips, navegación; `useUI` reexporta `UIContext` |
| `mainMenu/` | Menú lateral y búsqueda |
| `../crud/usePaginatedCrudTable.ts` | Listados CRUD con paginación y búsqueda server-side |

Los hooks nuevos del WMS van en `ui/`, `mainMenu/` o `crud/` según corresponda, siguiendo el estilo de `hooks_ejemplos/`.
