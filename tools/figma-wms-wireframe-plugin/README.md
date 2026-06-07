# WMS Wireframe Generator (Figma Plugin)

Genera en Figma un wireframe de baja fidelidad con las pantallas principales del WMS Multi-Tenant.

## Pantallas incluidas

| # | Frame | Contenido |
|---|-------|-----------|
| 00 | Design tokens | Palette `colors.ts` + variables `index.css` |
| 01 | Mapa rutas | Rutas públicas y `/app/*` |
| 02–07 | Landing, Login, Dashboard, CRUD, Stock, Recepción | Flujo principal |
| 08 | Perfil | Formulario cuenta + datos personales + dirección |
| 09 | Usuarios | CRUD + filtro cargo |
| 10 | Empresas | Super admin + tabla tenants |
| 11 | Comparativa | Wireframe vs código vs `docs/CORE_WMS.md` |

La fila inferior **11 — Comparativa** lista qué está en el wireframe, qué existe en la app y qué queda en la hoja de ruta (filtros stock/movimientos, validación zonas, OC/OV, reportes).

## Cómo usarlo

1. Abre tu archivo Figma (o crea uno nuevo).
2. En Figma: **Plugins → Development → Import plugin from manifest…**
3. Selecciona `tools/figma-wms-wireframe-plugin/manifest.json` de este repo.
4. Ejecuta **Plugins → Development → WMS Wireframe Generator**.
5. Se creará la página **WMS Wireframe** con 7 frames horizontales.

## Requisitos

- Fuente **Inter** (Regular, Medium, Bold) — disponible por defecto en Figma.

## MCP de Figma (alternativa automática desde Cursor)

Tu `~/.cursor/mcp.json` debe usar el servidor remoto oficial:

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

Luego reinicia Cursor, autentica Figma en MCP y pide al agente usar `use_figma` o `create_new_file`.

**Nota:** El paquete `@figma/mcp-server-figma` en npm no existe; esa configuración provoca error en el MCP.
