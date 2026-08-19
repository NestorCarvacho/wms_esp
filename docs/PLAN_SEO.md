# Plan de posicionamiento web — Khepri Software WMS

Plan accionable para mejorar la visibilidad orgánica de **Khepri Software** en búsquedas relacionadas con software de bodega, inventario y WMS en Chile y Latinoamérica.

**Dominio objetivo:** `kheprisoftware.com`  
**Producto:** WMS multi-tenant en la nube (PYME / operadores logísticos)  
**Posicionamiento:** *WMS accesible, implementación rápida, control por ubicación y trazabilidad operativa.*

---

## 1. Diagnóstico actual

| Área | Estado | Impacto |
|------|--------|---------|
| Landing comercial (`/`) | Existe (`LandingPage.tsx`) | Base OK, copy orientado a producto |
| Meta tags SEO | Solo `<title>` en `index.html` | Alto — Google no tiene descripción ni OG |
| Keywords en H1 | “Trazabilidad total de tu bodega” | Medio — falta “WMS / software bodega” |
| Páginas indexables | 1 ruta pública (`/`, `/login`) | Alto — sin páginas por intención de búsqueda |
| Blog / contenido | No existe | Alto — competidores tienen 10–50+ URLs |
| `robots.txt` / `sitemap.xml` | No existen | Alto |
| Schema.org (JSON-LD) | No existe | Medio |
| SPA React (Vite) | Sin prerender/SSR | Alto — rastreo limitado |
| Google Search Console | Por configurar | Alto |
| Página de precios | No existe | Alto — intención comercial directa |
| Área privada `/app/*` | Indexable por defecto | Medio — riesgo de contenido duplicado / thin |

### Competidores de referencia (Chile)

| Marca | Fortaleza SEO |
|-------|----------------|
| PanalWMS | “Software WMS Chile”, integraciones ERP, muchas landings |
| Altanet | Contenido largo, FAQ, páginas por feature |
| INNVITA | Vertical industria, funcionalidades detalladas |
| Flexy WMS | Marca + SaaS PYME |

**Ventaja diferenciable de Khepri:** precio fundadores bajo, multi-empresa nativo, implementación en días, inventario operativo por ubicación.

---

## 2. Objetivos y KPIs

### Objetivos (6 meses)

1. Aparecer en **top 20** para 5–10 keywords long-tail (ej. `wms pyme chile`, `software inventario bodega barato`).
2. Tener **15–25 URLs indexadas** (marketing + blog).
3. Generar **5–15 leads/mes** orgánicos (demo, contacto, WhatsApp).
4. Establecer autoridad local (“software bodega Chile”) sin competir aún con enterprise.

### KPIs mensuales

| Métrica | Herramienta | Meta mes 3 | Meta mes 6 |
|---------|-------------|------------|------------|
| Impresiones en Google | Search Console | 500+ | 2.000+ |
| Clics orgánicos | Search Console | 30+ | 150+ |
| CTR promedio | Search Console | > 2 % | > 3 % |
| Páginas indexadas | Search Console | 10+ | 20+ |
| Posición media (long-tail) | Search Console / Ahrefs free | Top 30 | Top 15 |
| Leads desde orgánico | Formulario / UTM | 2+ | 8+ |
| Core Web Vitals | PageSpeed Insights | Verde en mobile | Verde |

---

## 3. Arquitectura web objetivo

Separar **marketing** (indexable) de **aplicación** (no indexable):

```
kheprisoftware.com/                    → Home (software WMS Chile)
kheprisoftware.com/precios             → Planes y oferta fundadores
kheprisoftware.com/software-bodega     → Pilar: gestión de bodega
kheprisoftware.com/control-inventario  → Pilar: control de inventario
kheprisoftware.com/wms-pyme            → Segmento PYME
kheprisoftware.com/multi-empresa       → Diferenciador multi-tenant
kheprisoftware.com/funcionalidades/... → Recepción, traslado, despacho, reportes
kheprisoftware.com/comparar/excel      → Comparativa Excel vs WMS
kheprisoftware.com/blog/...            → Artículos SEO
kheprisoftware.com/contacto            → Demo / cotización
kheprisoftware.com/demo                → CTA principal

app.kheprisoftware.com/                → SPA actual (/login, /app/*)
```

> **Fase 1 (rápida):** mantener todo en el mismo dominio pero agregar rutas marketing y bloquear `/app` en `robots.txt`.  
> **Fase 2 (recomendada):** subdominio `app.` para la SPA y dominio raíz estático o prerenderizado.

---

## 4. Mapa de keywords

### Prioridad 1 — Comercial (páginas dedicadas)

| Keyword principal | URL | H1 sugerido |
|-------------------|-----|-------------|
| software wms chile | `/` | Software WMS en la nube para gestión de bodega en Chile |
| software gestión bodega | `/software-bodega` | Software de gestión de bodega para PYME |
| control inventario bodega | `/control-inventario` | Control de inventario de bodega por ubicación |
| wms pyme chile | `/wms-pyme` | WMS para PYME: simple, en la nube y accesible |
| precio software bodega | `/precios` | Planes y precios — oferta fundadores |

### Prioridad 2 — Educativa (blog)

| Keyword | Título artículo |
|---------|-----------------|
| qué es un wms | Qué es un WMS y cuándo lo necesita tu bodega |
| excel vs software inventario | Excel vs software de inventario: cuándo cambiar |
| trazabilidad bodega | Trazabilidad en bodega: qué es y cómo implementarla |
| errores inventario distribución | 7 errores comunes de inventario en distribución |
| stock por ubicación | Cómo organizar stock por ubicación en tu almacén |

### Prioridad 3 — Long-tail (fácil de rankear)

- `software bodega pequeña empresa chile`
- `wms barato chile`
- `sistema inventario multi bodega`
- `control stock código barras bodega`
- `software recepción despacho bodega`

### Keywords a evitar en fase inicial

- Integración Softland / SAP (aún no es diferenciador)
- “Mejor WMS Chile” (muy competitivo)
- Picking inteligente / automatización robotizada (fuera de alcance MVP)

---

## 5. Plan por fases

### Fase 0 — Fundamentos (semana 1–2)

**Objetivo:** que Google pueda rastrear e interpretar el sitio.

| # | Tarea | Archivo / acción | Esfuerzo |
|---|-------|------------------|----------|
| 0.1 | Registrar dominio en Google Search Console | DNS + verificación | 1 h |
| 0.2 | Crear `robots.txt` | `frontend/public/robots.txt` — Allow `/`, Disallow `/app/`, `/login` | 30 min |
| 0.3 | Crear `sitemap.xml` | `frontend/public/sitemap.xml` — URLs públicas | 1 h |
| 0.4 | Meta description + OG + Twitter | `frontend/index.html` o componente SEO | 2 h |
| 0.5 | Canonical URL | `<link rel="canonical">` por página | 1 h |
| 0.6 | JSON-LD `Organization` + `SoftwareApplication` | Home | 2 h |
| 0.7 | Bloquear indexación `/app/*` | `robots.txt` + `noindex` en layout app | 1 h |
| 0.8 | Configurar Google Analytics 4 | Eventos: demo, contacto, login | 2 h |
| 0.9 | Medir baseline PageSpeed | Registrar scores iniciales | 30 min |

**Entregable:** sitio verificado en Search Console, sitemap enviado, meta tags básicos.

---

### Fase 1 — On-page y landing (semana 3–4)

**Objetivo:** optimizar la home y crear páginas de conversión.

| # | Tarea | Detalle |
|---|-------|---------|
| 1.1 | Reescribir H1/H2 de home | Incluir “software WMS”, “gestión de bodega”, “Chile” |
| 1.2 | Crear página `/precios` | Tabla Starter / Business / Pro + oferta fundadores + FAQ precios |
| 1.3 | Crear página `/contacto` o `/demo` | Formulario + WhatsApp + email `contacto@kheprisoftware.com` |
| 1.4 | Sección FAQ en home | 8–10 preguntas con `FAQPage` schema |
| 1.5 | CTAs con keywords | “Ver planes desde CLP 29.900”, “Agendar demo gratis” |
| 1.6 | Footer SEO | Enlaces a pilares, blog, contacto, términos |
| 1.7 | Imágenes con `alt` descriptivo | “Dashboard stock por ubicación Khepri WMS” |
| 1.8 | Enlazar manual de usuario público | PDF o `/docs` resumido para confianza |

**Copy SEO — title y description home:**

```
Title: Software WMS Chile | Gestión de Bodega e Inventario en la Nube — Khepri
Description: Control de inventario por ubicación con recepción, traslado y despacho. WMS en la nube para PYME desde CLP 29.900/mes. Demo gratis.
```

**Entregable:** 3 URLs públicas indexables (home, precios, contacto/demo).

---

### Fase 2 — SEO técnico SPA (semana 5–6)

**Objetivo:** que React no penalice el rastreo.

| Opción | Pros | Contras | Recomendación |
|--------|------|---------|---------------|
| A. `vite-plugin-prerender` | Rápido, mismo repo | Limitado a rutas fijas | **Fase 2 inicial** |
| B. Sitio Astro/Next en `/marketing` | SEO excelente | Segundo proyecto | Mediano plazo |
| C. Subdominio `app.` + landing estática | Arquitectura limpia | Config DNS/deploy | **Objetivo 6 meses** |

| # | Tarea |
|---|-------|
| 2.1 | Instalar y configurar prerender para `/`, `/precios`, `/contacto`, pilares |
| 2.2 | `react-helmet-async` o hook `usePageSeo(title, description, canonical)` |
| 2.3 | Lazy routes marketing vs app (chunks separados) |
| 2.4 | Comprimir assets + preload fuentes críticas |
| 2.5 | Validar con “Inspección de URL” en Search Console |

**Entregable:** HTML pre-renderizado visible sin ejecutar JS (View Source con contenido).

---

### Fase 3 — Contenido y autoridad (mes 2–4)

**Objetivo:** captar tráfico informacional y long-tail.

#### Páginas pilar (una por semana)

| Semana | URL | Palabras | Enfoque |
|--------|-----|----------|---------|
| 1 | `/software-bodega` | 1.500+ | Qué resuelve, módulos, CTA demo |
| 2 | `/control-inventario` | 1.500+ | Stock por zona, trazabilidad |
| 3 | `/wms-pyme` | 1.200+ | PYME, precio, implementación rápida |
| 4 | `/multi-empresa` | 1.000+ | Operadores logísticos, multi-tenant |

#### Calendario blog (2 artículos/mes mínimo)

| Mes | Artículo 1 | Artículo 2 |
|-----|------------|------------|
| 2 | Qué es un WMS | Excel vs software inventario |
| 3 | Stock por ubicación | Errores comunes en bodega |
| 4 | Trazabilidad en almacén | Cómo elegir WMS para PYME |
| 5 | WMS en la nube vs on-premise | Checklist implementación bodega |
| 6 | Caso de éxito (cliente piloto) | Comparativa suave (sin nombrar competidor) |

#### Estructura de cada artículo

1. H1 con keyword
2. Introducción (problema)
3. 3–5 secciones H2
4. Lista / tabla comparativa
5. CTA a demo o precios
6. Enlaces internos a pilares
7. Meta title/description únicos

**Entregable:** 4 pilares + 6–12 artículos indexados.

---

### Fase 4 — Local, confianza y conversión (mes 4–6)

| # | Tarea | Detalle |
|---|-------|---------|
| 4.1 | Google Business Profile | Categoría software, Chile, WhatsApp |
| 4.2 | LinkedIn empresa | 1 post/semana (resumen de blog) |
| 4.3 | Testimonios en home | 2–3 clientes fundadores con nombre/sector |
| 4.4 | Página “Nosotros” | Historia, equipo, misión |
| 4.5 | Página legal | Privacidad + términos (requerido para Ads futuro) |
| 4.6 | Backlinks iniciales | Directorios Chile (Quot.cl, Capterra, GetApp) |
| 4.7 | Guest post / alianza | Operador logístico, consultora ERP |
| 4.8 | Email captura newsletter | “Guía: migrar de Excel a WMS” (lead magnet) |

**Entregable:** presencia local + señales E-E-A-T (experiencia, confianza).

---

## 6. Checklist on-page por página

Usar en cada nueva URL marketing:

- [ ] Title único (50–60 caracteres, keyword al inicio)
- [ ] Meta description (150–160 caracteres, CTA)
- [ ] H1 único con keyword principal
- [ ] H2/H3 con variaciones semánticas
- [ ] URL corta en español (`/software-bodega`, no `/page?id=3`)
- [ ] Canonical self-referencing
- [ ] Open Graph (title, description, image 1200×630)
- [ ] JSON-LD si aplica (FAQ, Product, SoftwareApplication)
- [ ] 2+ enlaces internos desde otras páginas
- [ ] 1 CTA principal (demo / precios)
- [ ] Imágenes optimizadas (WebP) con `alt`
- [ ] Mobile-first (responsive verificado)

---

## 7. Implementación en el repositorio (tareas dev)

Orden sugerido para el equipo técnico:

```
1. frontend/public/robots.txt
2. frontend/public/sitemap.xml
3. frontend/src/config/seo.ts          → titles, descriptions por ruta
4. frontend/src/hooks/usePageSeo.ts  → meta dinámicos
5. frontend/index.html                 → defaults + OG
6. frontend/src/pages/PreciosPage.tsx
7. frontend/src/pages/ContactoPage.tsx
8. frontend/src/pages/marketing/...      → pilares
9. frontend/src/pages/blog/...           → MDX o JSON estático
10. vite.config.ts                     → prerender plugin
11. App.tsx                            → rutas públicas marketing
```

### Rutas a agregar en `App.tsx`

```tsx
<Route path="/precios" element={<PreciosPage />} />
<Route path="/contacto" element={<ContactoPage />} />
<Route path="/software-bodega" element={<SoftwareBodegaPage />} />
<Route path="/control-inventario" element={<ControlInventarioPage />} />
<Route path="/wms-pyme" element={<WmsPymePage />} />
<Route path="/blog" element={<BlogIndexPage />} />
<Route path="/blog/:slug" element={<BlogPostPage />} />
```

### `robots.txt` ejemplo

```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /login

Sitemap: https://kheprisoftware.com/sitemap.xml
```

---

## 8. Herramientas recomendadas

| Herramienta | Uso | Costo |
|-------------|-----|-------|
| Google Search Console | Indexación, keywords, errores | Gratis |
| Google Analytics 4 | Tráfico y conversiones | Gratis |
| PageSpeed Insights | Core Web Vitals | Gratis |
| Bing Webmaster Tools | Indexación adicional | Gratis |
| Ubersuggest / Ahrefs Webmaster | Keywords (limitado) | Freemium |
| Screaming Frog (≤500 URLs) | Auditoría técnica | Gratis |
| Plausible / Umami | Analytics privacidad-friendly | Opcional |

---

## 9. Seguimiento mensual (ritual)

**Día 1 de cada mes (30 min):**

1. Search Console → rendimiento (clics, impresiones, CTR, posición).
2. Revisar páginas no indexadas y corregir.
3. Actualizar tabla de keywords (top 10 ganadores / perdedores).
4. Publicar 2 piezas de contenido programadas.
5. Revisar leads orgánicos en CRM o hoja de cálculo.

**Plantilla de reporte:**

| Keyword | Posición | Impresiones | Clics | URL |
|---------|----------|-------------|-------|-----|
| … | … | … | … | … |

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| SPA no indexada | Prerender o sitio marketing estático |
| Competir con marcas grandes | Enfocar long-tail + PYME + precio |
| Prometer integraciones que no existen | Copy honesto; roadmap público |
| Contenido sin actualizar | Calendario editorial mínimo 2/mes |
| `/app` indexado | robots + noindex |
| Cambio de URL Railway → dominio propio | 301 redirects + actualizar sitemap |

---

## 11. Resumen ejecutivo (primeros 30 días)

| Semana | Acción clave | Resultado esperado |
|--------|--------------|-------------------|
| 1 | Search Console + robots + sitemap + meta tags | Base técnica |
| 2 | Optimizar home + página precios + FAQ schema | Conversión + relevancia |
| 3 | Prerender rutas públicas + hook SEO | HTML rastreable |
| 4 | Publicar 1 pilar + 1 artículo blog | Primera expansión indexable |

**Inversión estimada:** 20–40 h dev (fases 0–2) + 8–16 h contenido/mes (fase 3).

**Prioridad absoluta si el tiempo es limitado:**

1. Meta tags + Search Console  
2. Página `/precios`  
3. Prerender de la landing  
4. Primer artículo “Excel vs WMS”  

---

## 12. Referencias internas

| Recurso | Uso para SEO |
|---------|--------------|
| [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) | Base para FAQs y artículos |
| [CORE_WMS.md](./CORE_WMS.md) | Funcionalidades técnicas verificables |
| [LandingPage.tsx](../frontend/src/pages/LandingPage.tsx) | Home actual a optimizar |
| [Khepri-Design-System-v1.0.md](./Khepri-Design-System-v1.0.md) | Consistencia visual en nuevas páginas |

---

*Plan SEO v1.0 — Khepri Software — agosto 2026*

---

## Estado de implementación (agosto 2026)

| Fase | Estado | Notas |
|------|--------|-------|
| 0 — Fundamentos | ✅ | `robots.txt`, `sitemap.xml`, meta OG, `HelmetProvider`, GA4 opcional |
| 1 — On-page | ✅ | Home optimizada, `/precios`, `/demo`, `/contacto`, FAQ + schema |
| 2 — Técnico SPA | ✅ | `inject-seo-html.mjs` post-build (17 rutas), `noindex` en `/app` y `/login` |
| 3 — Contenido | ✅ | 4 pilares + blog (6 artículos) |
| 4 — Confianza | ✅ | `/nosotros`, testimonios, `/privacidad`, `/terminos` |

**Pendiente manual:** registrar dominio en Google Search Console, configurar `VITE_GA_MEASUREMENT_ID` y actualizar número WhatsApp en `seo.ts`.
