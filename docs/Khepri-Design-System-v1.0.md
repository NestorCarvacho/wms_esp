# Khepri Software Design System v1.0

> Documento de identidad visual para el ecosistema Khepri Software.

------------------------------------------------------------------------

# Filosofía

Khepri debe transmitir una identidad propia. El objetivo no es que el
usuario piense *"esto parece Bootstrap"* o *"esto parece Material UI"*,
sino que reconozca un lenguaje visual consistente y profesional.

**Valores de diseño**

-   Profesional
-   Tecnológico
-   Minimalista
-   Escalable
-   Claro
-   Atemporal

------------------------------------------------------------------------

# Inspiración

## Referencias

-   Stripe
-   Linear
-   GitHub
-   Atlassian
-   Notion
-   Vercel

## Evitar parecerse a

-   Bootstrap
-   AdminLTE
-   Metronic
-   CoreUI
-   Plantillas genéricas de administración

------------------------------------------------------------------------

# Principios

1.  Menos color = más impacto.
2.  Mucho espacio en blanco.
3.  Componentes consistentes.
4.  El color comunica significado, no decoración.
5.  El diseño debe "respirar".

------------------------------------------------------------------------

# Paleta principal

## Primary (Marca)

  Nivel     HEX
  --------- -------------
  50        #EFF6FF
  100       #DBEAFE
  200       #BFDBFE
  300       #93C5FD
  400       #60A5FA
  500       #3B82F6
  **600**   **#2563EB**
  700       #1D4ED8
  800       #1E40AF
  900       #1E3A8A

Uso: - Marca - Botones principales - Links - Focus - KPIs

## Colores semánticos (y roles de botón)

  Uso         HEX       Rol UI
  ----------- --------- ----------------------
  Cyan        #06B6D4   Secondary / sync
  Purple IA   #8B5CF6   Accent / IA
  Success     #10B981   Guardar / OK
  Warning     #F59E0B   Pendiente / atención
  Danger      #EF4444   Destructivo

Estos mismos HEX alimentan botones rellenos (texto blanco) y swatches de marca.
Ver sección Botones.

------------------------------------------------------------------------

# Tokens de superficie (contraste canvas → panel)

Referencia de implementación: [docs/index.html](index.html).

La legibilidad no depende de sombras fuertes: depende de **tres capas** y un
borde sutil. Light y dark usan la misma estructura; solo cambian los tokens.

```
┌─────────────────────────────────────────┐
│  --bg          (lienzo de página)       │
│   ┌─────────────────────────────────┐   │
│   │  --surface   (card / tabla /    │   │
│   │               sidebar / navbar) │   │
│   │   ┌─────────────────────────┐   │   │
│   │   │ --surface2 (header      │   │   │
│   │   │  tabla, search, chips)  │   │   │
│   │   └─────────────────────────┘   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

| Token        | Rol                                      | Light     | Dark      |
| ------------ | ---------------------------------------- | --------- | --------- |
| `--bg`       | Fondo de página / área de contenido      | `#F8FAFC` | `#0B1220` |
| `--surface`  | Paneles elevados (card, tabla, chrome)   | `#FFFFFF` | `#111827` |
| `--surface2` | Superficie anidada (th, inputs search)   | `#F1F5F9` | `#1E293B` |
| `--border`   | Contorno 1px de paneles y filas          | `#E2E8F0` | `#334155` |
| `--text`     | Texto principal                          | `#0F172A` | `#F8FAFC` |
| `--muted`    | Texto secundario / menú inactivo         | `#64748B` | `#CBD5E1` |

**Reglas**

1. El `body` / layout principal usa `--bg`.
2. Cards, tablas (shell), sidebar y navbar usan `--surface` + `border: 1px solid
   var(--border)`. Así contrastan con el canvas sin sombra obligatoria.
3. Elementos *dentro* de un panel (header de tabla, campo de búsqueda en navbar)
   usan `--surface2`, no otro blanco/negro plano.
4. No pintar cards con `--bg`: se pierden en el lienzo.
5. Sombras: opcionales y muy suaves; el contraste principal es bg ↔ surface.

## Variables CSS canónicas

Misma forma que el mockup (`docs/index.html`): light en `:root`, dark en `.dark`.

```css
:root {
  --primary: #2563EB;
  --secondary: #06B6D4;
  --accent: #8B5CF6;
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;

  --bg: #F8FAFC;
  --surface: #FFFFFF;
  --surface2: #F1F5F9;
  --border: #E2E8F0;
  --text: #0F172A;
  --muted: #64748B;
}

.dark {
  --bg: #0B1220;
  --surface: #111827;
  --surface2: #1E293B;
  --border: #334155;
  --text: #F8FAFC;
  --muted: #CBD5E1;
  /* primary / secondary / accent / success / warning / danger se mantienen */
}
```

------------------------------------------------------------------------

# Tipografía

Fuente principal:

-   Inter

Alternativas:

-   Geist
-   Manrope

Pesos recomendados:

-   700
-   600
-   500
-   400

------------------------------------------------------------------------

# Espaciado

Escala base:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

------------------------------------------------------------------------

# Radios

| Elemento              | Radio   |
| --------------------- | ------- |
| Cards / tablas (shell)| **16px** |
| Alertas / bloques     | **12px** |
| Botones / inputs / menú | **10px** |
| Badges                | **999px** |

Cards y botones **no** comparten el mismo radio: el panel es más redondeado;
controles de acción, un poco más contenidos.

------------------------------------------------------------------------

# Cards

Patrón canónico (light y dark vía tokens):

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
}
```

- Viven sobre `--bg` → el blanco/surface se lee como “tarjeta”.
- KPI / títulos: tipografía bold; labels en `--muted`.
- Hover opcional: borde un poco más marcado; sombra discreta. Sin elevación 3D.

------------------------------------------------------------------------

# Tablas

La tabla es un **panel** (`--surface`), no filas sueltas sobre el canvas.

```css
.table {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}
th {
  background: var(--surface2); /* contraste interno, no --bg */
  padding: 14px;
  border-bottom: 1px solid var(--border);
}
td {
  padding: 14px;
  border-bottom: 1px solid var(--border);
}
```

| Parte        | Token / tratamiento                                      |
| ------------ | -------------------------------------------------------- |
| Shell        | `--surface` + borde + radio 16px                         |
| Header (`th`)| `--surface2`                                             |
| Filas        | Separadores `1px` `--border`                             |
| Hover fila   | `rgba(primary, 0.06)` (válido en light y dark)           |
| Seleccionada | `rgba(primary, 0.12)`                                    |

Mucho padding, pocas líneas, alta legibilidad.

------------------------------------------------------------------------

# Navbar y Sidebar

Ambos son chrome de `--surface` (mismo token que las cards), no un tercer
fondo inventado.

| Pieza            | Tratamiento                                              |
| ---------------- | -------------------------------------------------------- |
| Navbar           | `--surface` + `border-bottom: 1px solid var(--border)`   |
| Sidebar          | `--surface` + `border-right: 1px solid var(--border)`    |
| Ítem menú        | Texto `--muted`; radio 10px                              |
| Ítem activo      | `background: rgba(37, 99, 235, 0.12)`; texto `--primary` |
| Search en navbar | Fondo `--surface2` + borde `--border`                    |

Usar **alpha del primary** para el activo (no `#EFF6FF` fijo): funciona en
light y dark sin tokens extra.

Sin degradados.

------------------------------------------------------------------------

# Botones

Referencia: sección `.buttons` en [docs/index.html](index.html).

## Anatomía

```css
button {
  border: none;
  border-radius: 10px;
  padding: 11px 18px;
  font-weight: 600;
  color: #fff; /* solo en variantes rellenas */
}
```

## Variantes rellenas (texto blanco)

El color del botón comunica **rol / módulo**, no decoración.

| Clase / rol   | Token / HEX   | Uso típico                         |
| ------------- | ------------- | ---------------------------------- |
| Primary       | `#2563EB`     | CTA principal (crear, confirmar)   |
| Secondary     | `#06B6D4`     | Acción secundaria / sync / info    |
| Accent (IA)   | `#8B5CF6`     | Flujos de IA / insights            |
| Success       | `#10B981`     | Guardar / confirmar positivo       |
| Warning       | `#F59E0B`     | Pendiente / atención               |
| Danger        | `#EF4444`     | Eliminar / destructivo             |

Hover: oscurecer un paso (p. ej. Primary → `#1D4ED8`). Sin degradados ni 3D.

## Outline (cancelar / terciario)

```css
.out {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}
```

Usar para Cancelar, “Volver”, acciones de bajo énfasis junto a un CTA relleno.

## Reglas

1. Un solo botón **Primary** por grupo de acciones visibles.
2. Danger solo para destrucción explícita.
3. Secondary / Accent no compiten con Primary en la misma fila salvo que el
   flujo lo requiera (p. ej. Sync + Nuevo).
4. Outline nunca lleva fondo de color de marca.

------------------------------------------------------------------------

# Badges (estados en tablas)

Fondo suave + texto saturado (no texto blanco sobre color fuerte):

| Estado  | Fondo     | Texto     |
| ------- | --------- | --------- |
| Success | `#DCFCE7` | `#166534` |
| Warning | `#FEF3C7` | `#92400E` |
| Danger  | `#FEE2E2` | `#B91C1C` |

Radio `999px`. En dark, preferir el mismo approach con fondos alpha o pares
equivalentes sobre `--surface` (evitar badges light crudos sobre fondo oscuro).

------------------------------------------------------------------------

# Inputs

| Tema  | Fondo        | Borde                    |
| ----- | ------------ | ------------------------ |
| Light | `--surface` o `--surface2` (search) | `--border` / `#CBD5E1` |
| Dark  | `--surface2` | `--border`               |

Focus: anillo/halo con primary a baja opacidad (`rgba(37, 99, 235, 0.25)`).

------------------------------------------------------------------------

# Colores por módulo

  Módulo          Color       Alineación botón
  --------------- ----------- ----------------
  Dashboard       #8B5CF6     Accent
  Inventario      #2563EB     Primary
  Logística       #06B6D4     Secondary
  Ventas          #10B981     Success
  Compras         #F59E0B     Warning
  RRHH            #EC4899     (acento módulo)
  Configuración   #64748B     Muted / outline

Los colores de módulo pueden teñir iconos de nav, KPIs o acentos locales; el
CTA global de la app sigue siendo Primary salvo contexto semántico claro.

------------------------------------------------------------------------

# Iconografía

Utilizar una sola familia:

-   Lucide
-   Tabler Icons
-   Phosphor

Nunca mezclar estilos.

------------------------------------------------------------------------

# Identidad Khepri

La marca debe reflejar el concepto de Khepri mediante:

-   Geometría basada en círculos y arcos.
-   Curvas suaves.
-   Esquinas redondeadas.
-   Patrones inspirados en las alas del escarabajo.
-   Gráficos elegantes.
-   Mucho espacio en blanco.

------------------------------------------------------------------------

# Objetivo

Cuando alguien vea una captura de pantalla debe pensar:

> "Ese software tiene una identidad propia."

No:

> "Eso parece Bootstrap."

------------------------------------------------------------------------

# Próximas versiones

Este documento puede crecer para incluir:

-   Design Tokens
-   Componentes
-   Accesibilidad
-   Responsive
-   Animaciones
-   Sistema de iconos
-   Branding
-   Manual del logotipo
-   Guía de ilustraciones
