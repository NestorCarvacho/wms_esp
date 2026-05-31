# hooks_ejemplos — referencia de patrones

Carpeta **solo lectura / referencia**. No se compila ni se importa en la app WMS (`tsconfig` la excluye).

## Cuándo usarla

Al crear o modificar un hook, **empieza aquí**: busca un ejemplo parecido y replica la estructura en las carpetas activas (`../ui/`, `../mainMenu/`, `../../crud/`).

## Índice rápido

| Carpeta | Patrones |
|---------|----------|
| `ui/table/` | `useTableSearch`, `useTableSort`, `useTableSelection`, `useTableColumns` |
| `ui/navigation/` | Breadcrumbs |
| `ui/filters/calendar/` | Filtros con calendario |
| `mainMenu/` | Navegación y búsqueda en menú |
| `account/` | Login, auth flow, cambio de contraseña |
| `company/`, `employee/`, `attendance/` | CRUD con formularios, listados y export |

## Equivalencias en el WMS

| Referencia (ejemplos) | Implementación WMS |
|-----------------------|-------------------|
| `useTableSearch` + paginación manual | `usePaginatedCrudTable` en `src/crud/` |
| `useUI` (Redux en ejemplos) | `@/hooks/ui` → `UIContext` |
| Listados con API | `buildListQuery` + `pagina=1`, `por_pagina=10`, `buscar` |

## Reglas

1. No añadir dependencias solo por copiar un ejemplo (Redux, i18n, etc.) si el WMS no las usa.
2. Los hooks productivos deben compilar y vivir fuera de `hooks_ejemplos/`.
3. Mantener nombres y convenciones del código que ya existe en `ui/` y `mainMenu/`.
