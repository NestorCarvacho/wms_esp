/**
 * Genera wireframes del WMS Multi-Tenant en Figma (Figma Desktop).
 * Plugins → Development → Import plugin from manifest → manifest.json
 * Plugins → Development → WMS Wireframe Generator
 */

const COLORS = {
  bg: { r: 0.12, g: 0.14, b: 0.18 },
  surface: { r: 0.17, g: 0.19, b: 0.24 },
  wire: { r: 0.35, g: 0.38, b: 0.45 },
  wireFill: { r: 0.22, g: 0.24, b: 0.3 },
  accent: { r: 0.13, g: 0.72, b: 0.55 },
  text: { r: 0.92, g: 0.94, b: 0.96 },
  muted: { r: 0.65, g: 0.68, b: 0.72 },
  ok: { r: 0.26, g: 0.63, b: 0.45 },
  warn: { r: 0.85, g: 0.65, b: 0.2 },
  miss: { r: 0.75, g: 0.35, b: 0.35 },
};

const FRAME_W = 1280;
const FRAME_H = 800;
const GAP = 80;
const PAD = 24;

/** Fuente: frontend/src/assets/styles/colors.ts (palette) */
const PALETTE_SWATCHES = [
  { hex: '#1565C0', label: 'brand' },
  { hex: '#0D47A1', label: 'brandDark' },
  { hex: '#1976D2', label: 'brandLight' },
  { hex: '#42A5F5', label: 'brandAux' },
  { hex: '#E3F2FD', label: 'brandBg' },
  { hex: '#FF6F00', label: 'accent' },
  { hex: '#FB8C00', label: 'accentMid' },
  { hex: '#43A047', label: 'success' },
  { hex: '#E8F5E9', label: 'successBg' },
  { hex: '#EF5350', label: 'error' },
  { hex: '#FFEBEE', label: 'errorBg' },
  { hex: '#FFB74D', label: 'alert' },
  { hex: '#1A1A1A', label: 'ink' },
  { hex: '#FAFAFA', label: 'surface' },
  { hex: '#E5E5E5', label: 'border' },
];

/** Fuente: frontend/src/index.css — tokens shadcn HSL */
const CSS_TOKENS = [
  { name: 'background', light: '0 0% 100%', dark: '222.2 84% 4.9%' },
  { name: 'foreground', light: '222.2 47.4% 11.2%', dark: '210 40% 98%' },
  { name: 'primary', light: '222.2 47.4% 11.2%', dark: '210 40% 98%' },
  { name: 'muted', light: '210 40% 96.1%', dark: '217.2 32.6% 17.5%' },
  { name: 'muted-foreground', light: '215.4 16.3% 46.9%', dark: '215 20.2% 65.1%' },
  { name: 'destructive', light: '0 84.2% 60.2%', dark: '0 62.8% 30.6%' },
  { name: 'border', light: '214.3 31.8% 91.4%', dark: '217.2 32.6% 17.5%' },
  { name: 'ring', light: '215 20.2% 65.1%', dark: '212.7 26.8% 83.9%' },
];

/** Comparativa: wireframe vs app vs docs/CORE_WMS.md hoja de ruta */
const ROADMAP_ROWS = [
  ['Design tokens / colores', 'Sí', 'Sí', 'index.css + colors.ts'],
  ['Landing /', 'Sí', 'Sí', '—'],
  ['Login /login', 'Sí', 'Sí', '—'],
  ['Dashboard /app', 'Sí', 'Sí', '—'],
  ['CRUD Productos', 'Sí (plantilla)', 'Sí', '—'],
  ['Tipos producto · Unidades medida', 'No', 'Sí', 'Mismo patrón CRUD'],
  ['Bodegas · Tipos zona · Zonas', 'No', 'Sí', 'Mismo patrón CRUD'],
  ['Stock por ubicación', 'Sí', 'Sí MVP', 'Filtros bodega/producto en UI'],
  ['Historial movimientos', 'No', 'Sí MVP', 'Filtros bodega/producto en UI'],
  ['Recepción + escaneo', 'Sí', 'Sí MVP', 'Validación tipo de zona'],
  ['Traslado', 'No', 'Sí MVP', 'Validación tipo de zona'],
  ['Despacho', 'No', 'Sí MVP', 'Validación tipo de zona'],
  ['Config zona recepción', 'No', 'Sí MVP', '—'],
  ['Usuarios', 'Sí', 'Sí', 'Filtro por cargo + empresa'],
  ['Cargos · Roles · Permisos', 'No', 'Sí', '—'],
  ['Empresas (super admin)', 'Sí', 'Sí', 'Solo empresa_id = 1'],
  ['Mi perfil', 'Sí', 'Sí', 'Formulario 4 secciones'],
  ['Tema claro/oscuro (app)', 'Parcial', 'Sí ToolsBar', 'Landing forzado oscuro'],
  ['Órdenes compra/venta', 'No', 'No', 'CORE_WMS — próximo paso'],
  ['Reportes · conteos cíclicos', 'No', 'No', 'CORE_WMS — próximo paso'],
];

let fontRegular;
let fontMedium;
let fontBold;

async function loadFonts() {
  fontRegular = { family: 'Inter', style: 'Regular' };
  fontMedium = { family: 'Inter', style: 'Medium' };
  fontBold = { family: 'Inter', style: 'Bold' };
  await figma.loadFontAsync(fontRegular);
  await figma.loadFontAsync(fontMedium);
  await figma.loadFontAsync(fontBold);
}

function solid(color, opacity = 1) {
  return [{ type: 'SOLID', color, opacity }];
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function createScreenFrame(name, x, y, w, h) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.resize(w, h);
  frame.fills = solid(COLORS.bg);
  frame.layoutMode = 'NONE';
  return frame;
}

function addText(parent, content, x, y, size, weight, color) {
  const t = figma.createText();
  t.fontName = weight === 'bold' ? fontBold : weight === 'medium' ? fontMedium : fontRegular;
  t.fontSize = size;
  t.fills = solid(color);
  t.characters = content;
  t.x = x;
  t.y = y;
  parent.appendChild(t);
  return t;
}

function addWireBox(parent, x, y, w, h, label, fill = COLORS.wireFill) {
  const box = figma.createFrame();
  box.name = label || 'WireBox';
  box.x = x;
  box.y = y;
  box.resize(w, h);
  box.fills = solid(fill);
  box.strokes = solid(COLORS.wire);
  box.strokeWeight = 1;
  box.dashPattern = [6, 4];
  box.cornerRadius = 6;
  parent.appendChild(box);
  if (label) {
    addText(box, label, 10, 8, 11, 'medium', COLORS.muted);
  }
  return box;
}

function addButton(parent, x, y, label, primary) {
  const w = Math.max(100, label.length * 7 + 24);
  const btn = figma.createFrame();
  btn.name = `Btn: ${label}`;
  btn.x = x;
  btn.y = y;
  btn.resize(w, 36);
  btn.cornerRadius = 6;
  btn.fills = solid(primary ? COLORS.accent : COLORS.surface);
  if (!primary) {
    btn.strokes = solid(COLORS.wire);
    btn.strokeWeight = 1;
  }
  parent.appendChild(btn);
  addText(btn, label, 12, 10, 12, 'medium', primary ? COLORS.bg : COLORS.text);
  return btn;
}

function addTopNav(parent, yOffset) {
  const nav = addWireBox(parent, PAD, yOffset, FRAME_W - PAD * 2, 48, 'TopNavigation');
  addText(nav, 'WMS', 12, 28, 13, 'bold', COLORS.text);
  addWireBox(nav, FRAME_W - PAD * 2 - 200, 10, 120, 28, 'Buscar', COLORS.surface);
  addWireBox(nav, FRAME_W - PAD * 2 - 60, 10, 36, 28, 'User → Perfil', COLORS.surface);
  return nav;
}

function addColorSwatch(parent, x, y, hex, label) {
  const sw = figma.createRectangle();
  sw.x = x;
  sw.y = y;
  sw.resize(72, 48);
  sw.cornerRadius = 4;
  sw.fills = solid(hexToRgb(hex));
  sw.strokes = solid(COLORS.wire);
  sw.strokeWeight = 1;
  parent.appendChild(sw);
  addText(parent, label, x, y + 52, 10, 'medium', COLORS.text);
  addText(parent, hex, x, y + 66, 9, 'regular', COLORS.muted);
}

function buildColorTokens(parent) {
  addText(parent, 'DESIGN TOKENS — Colores WMS', PAD, PAD, 14, 'bold', COLORS.accent);
  addText(parent, 'Fuente: frontend/src/assets/styles/colors.ts + index.css', PAD, 38, 11, 'regular', COLORS.muted);

  addText(parent, 'Palette (hex) — uso en Tailwind / legacy inline', PAD, 70, 13, 'bold', COLORS.text);
  PALETTE_SWATCHES.forEach((item, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    addColorSwatch(parent, PAD + col * 120, 95 + row * 88, item.hex, item.label);
  });

  const tokenBox = addWireBox(parent, PAD, 380, FRAME_W - PAD * 2, 360, 'CSS variables (shadcn) — :root / .dark');
  addText(tokenBox, 'Token', 16, 36, 11, 'bold', COLORS.muted);
  addText(tokenBox, 'Light (HSL)', 220, 36, 11, 'bold', COLORS.muted);
  addText(tokenBox, 'Dark (HSL)', 520, 36, 11, 'bold', COLORS.muted);
  CSS_TOKENS.forEach((tok, i) => {
    const y = 58 + i * 36;
    addText(tokenBox, tok.name, 16, y, 11, 'medium', COLORS.text);
    addText(tokenBox, tok.light, 220, y, 10, 'regular', COLORS.muted);
    addText(tokenBox, tok.dark, 520, y, 10, 'regular', COLORS.muted);
  });

  const sem = addWireBox(parent, PAD, 760, FRAME_W - PAD * 2, 120, 'Semánticos colorClass');
  [
    'brand / brandLight — azul',
    'accent — naranja (iconos activos)',
    'success — emerald (CTA login/landing)',
    'destructive — errores',
    'muted-foreground — textos secundarios',
  ].forEach((line, i) => {
    addText(sem, line, 16, 36 + i * 16, 11, 'regular', COLORS.text);
  });
}

function buildLanding(parent) {
  addText(parent, 'LANDING — /', PAD, PAD, 14, 'bold', COLORS.accent);
  const header = addWireBox(parent, PAD, 50, FRAME_W - PAD * 2, 52, 'Header sticky (oscuro fijo)');
  addButton(header, FRAME_W - PAD * 2 - 160, 12, 'Ingresar al sistema', true);
  addText(parent, 'Trazabilidad total de tu bodega', PAD, 130, 28, 'bold', COLORS.text);
  addButton(parent, PAD, 210, 'Ingresar al sistema', true);
  const mock = addWireBox(parent, 620, 120, 620, 220, 'Mock dashboard');
  addWireBox(parent, PAD, 360, FRAME_W - PAD * 2, 400, 'Secciones: métricas · beneficios · módulos · CTA');
}

function buildLogin(parent) {
  addText(parent, 'LOGIN — /login', PAD, PAD, 14, 'bold', COLORS.accent);
  const bg = addWireBox(parent, PAD, 50, FRAME_W - PAD * 2, FRAME_H - 80, 'LoginBackground');
  const card = addWireBox(bg, (FRAME_W - PAD * 2 - 400) / 2, 120, 400, 320, 'Card login', COLORS.surface);
  addWireBox(card, 24, 120, 352, 40, 'Email', COLORS.wireFill);
  addWireBox(card, 24, 175, 352, 40, 'Contraseña', COLORS.wireFill);
  addButton(card, 24, 240, 'Iniciar sesión', true);
}

function buildDashboard(parent) {
  addText(parent, 'DASHBOARD — /app', PAD, PAD, 14, 'bold', COLORS.accent);
  addTopNav(parent, PAD);
  addWireBox(parent, PAD, 110, FRAME_W - PAD * 2, 32, 'Breadcrumb: Inicio');
  [0, 1, 2].forEach((i) => {
    addWireBox(parent, PAD + i * 400, 195, 360, 90, ['Tu sesión', 'Resumen API', 'Empresa'][i]);
  });
  const quick = addWireBox(parent, PAD, 310, FRAME_W - PAD * 2, 120, 'Accesos rápidos');
  ['Productos', 'Bodegas', 'Unidades', 'Usuarios'].forEach((l, i) => {
    addWireBox(quick, 16 + i * 290, 40, 260, 64, l, COLORS.surface);
  });
}

function buildCrud(parent, title, breadcrumb) {
  addText(parent, title, PAD, PAD, 14, 'bold', COLORS.accent);
  addTopNav(parent, PAD);
  addWireBox(parent, PAD, 110, FRAME_W - PAD * 2, 32, breadcrumb);
  addButton(parent, FRAME_W - PAD - 120, 150, '+ Nuevo', true);
  addWireBox(parent, PAD, 195, FRAME_W - PAD * 2, 48, 'Filtro empresa (super admin)');
  const table = addWireBox(parent, PAD, 260, FRAME_W - PAD * 2, 280, 'Tabla paginada + orden server-side + SidePanel edit');
  addWireBox(table, 16, 40, FRAME_W - PAD * 2 - 32, 32, 'Columnas + Acciones (editar / eliminar)', COLORS.surface);
  [0, 1, 2].forEach((r) => {
    addWireBox(table, 16, 80 + r * 44, FRAME_W - PAD * 2 - 32, 36, `Fila ${r + 1}`, COLORS.wireFill);
  });
}

function buildStock(parent) {
  addText(parent, 'STOCK — /app/inventario/stock', PAD, PAD, 14, 'bold', COLORS.accent);
  addTopNav(parent, PAD);
  addWireBox(parent, PAD, 110, FRAME_W - PAD * 2, 32, 'Breadcrumb › Stock por ubicación');
  addWireBox(parent, PAD, 195, FRAME_W - PAD * 2, 40, 'Filtro empresa');
  addWireBox(parent, PAD, 250, FRAME_W - PAD * 2, 300, 'Tabla: Producto | SKU | Bodega | Zona | Cantidad');
}

function buildRecepcion(parent) {
  addText(parent, 'RECEPCIÓN — /app/inventario/recepcion', PAD, PAD, 14, 'bold', COLORS.accent);
  addTopNav(parent, PAD);
  const left = addWireBox(parent, PAD, 195, 580, 380, 'InventarioOperacionEscaneo — config');
  ['Bodega', 'Zona destino', 'Escaneo / SKU', 'Cantidad'].forEach((f, i) => {
    addWireBox(left, 16, 40 + i * 56, 548, 40, f, COLORS.surface);
  });
  const right = addWireBox(parent, 640, 195, 616, 380, 'Líneas escaneadas');
  addButton(right, 16, 320, 'Confirmar recepción', true);
}

function buildPerfil(parent) {
  addText(parent, 'PERFIL — /app/perfil', PAD, PAD, 14, 'bold', COLORS.accent);
  addTopNav(parent, PAD);
  addWireBox(parent, PAD, 110, FRAME_W - PAD * 2, 32, 'Breadcrumb: Inicio › Mi perfil');
  addText(parent, 'Mi perfil', PAD, 155, 22, 'bold', COLORS.text);
  addText(parent, 'Datos de cuenta y perfil personal', PAD, 185, 12, 'regular', COLORS.muted);

  const grid = addWireBox(parent, PAD, 220, FRAME_W - PAD * 2, 520, 'FormLayout 2 columnas');
  const sections = [
    { title: 'Cuenta', fields: ['Email', 'Empresa (readonly)', 'Cargo (readonly)'] },
    { title: 'Datos personales', fields: ['RUT', 'Nombres', 'Apellidos', 'Fecha nac.', 'Género', 'Teléfono'] },
    { title: 'Dirección', fields: ['Dirección', 'Comuna', 'Ciudad', 'Región', 'País'] },
    { title: 'Información adicional', fields: ['URL foto', 'Biografía'] },
  ];
  sections.forEach((sec, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 16 + col * 600;
    const sy = 40 + row * 200;
    const box = addWireBox(grid, sx, sy, 580, 180, sec.title, COLORS.surface);
    sec.fields.forEach((f, fi) => {
      addWireBox(box, 12, 36 + fi * 22, 556, 18, f, COLORS.wireFill);
    });
  });

  addButton(parent, PAD, 760, 'Volver', false);
  addButton(parent, 140, 760, 'Guardar perfil', true);
}

function buildUsuarios(parent) {
  addText(parent, 'USUARIOS — /app/usuarios', PAD, PAD, 14, 'bold', COLORS.accent);
  addTopNav(parent, PAD);
  addWireBox(parent, PAD, 110, FRAME_W - PAD * 2, 32, 'Breadcrumb: Administración › Accesos › Usuarios');
  addText(parent, 'Usuarios', PAD, 155, 22, 'bold', COLORS.text);
  addButton(parent, FRAME_W - PAD - 120, 150, '+ Nuevo', true);
  addWireBox(parent, PAD, 195, FRAME_W - PAD * 2, 48, 'Filtro empresa (super admin)');
  addWireBox(parent, PAD, 252, FRAME_W - PAD * 2, 48, 'CrudDynamicFilters: filtro Cargo');
  const table = addWireBox(parent, PAD, 315, FRAME_W - PAD * 2, 260, 'Tabla: email · empresa · cargo · estado · acciones');
  addWireBox(table, 16, 40, FRAME_W - PAD * 2 - 32, 32, 'StatusPill activo/inactivo', COLORS.surface);
  addText(parent, 'SidePanel UsuarioEditPanel al crear/editar', PAD, 590, 11, 'regular', COLORS.muted);
}

function buildEmpresas(parent) {
  addText(parent, 'EMPRESAS — /app/empresas', PAD, PAD, 14, 'bold', COLORS.accent);
  addTopNav(parent, PAD);
  addWireBox(parent, PAD, 110, FRAME_W - PAD * 2, 32, 'Breadcrumb: Configuración › Empresas');
  addText(parent, 'Empresas', PAD, 155, 22, 'bold', COLORS.text);
  addWireBox(parent, PAD, 195, FRAME_W - PAD * 2, 48, 'Solo super admin (empresa_id = 1)');
  addButton(parent, FRAME_W - PAD - 120, 150, '+ Nueva empresa', true);
  const table = addWireBox(parent, PAD, 260, FRAME_W - PAD * 2, 300, 'Tabla tenants: nombre · RUT · estado');
  addWireBox(table, 16, 40, FRAME_W - PAD * 2 - 32, 32, 'SidePanel EmpresaEditPanel', COLORS.surface);
  addWireBox(parent, PAD, 580, FRAME_W - PAD * 2, 48, 'Si no es super admin → Feedback info', COLORS.wireFill);
}

function statusColor(value) {
  if (value === 'Sí' || value.indexOf('Sí') === 0) return COLORS.ok;
  if (value === 'Parcial') return COLORS.warn;
  if (value === 'No') return COLORS.miss;
  if (
    value.indexOf('MVP') >= 0 ||
    value.indexOf('próximo') >= 0 ||
    value.indexOf('Filtros') >= 0 ||
    value.indexOf('Validación') >= 0 ||
    value.indexOf('Mismo patrón') >= 0
  ) {
    return COLORS.warn;
  }
  return COLORS.muted;
}

function buildRoadmapComparison(parent) {
  addText(parent, 'COMPARATIVA — Wireframe vs App vs Hoja de ruta', PAD, PAD, 16, 'bold', COLORS.accent);
  addText(
    parent,
    'Hoja de ruta inventario: docs/CORE_WMS.md (próximos pasos). Wireframe = este plugin Figma.',
    PAD,
    42,
    11,
    'regular',
    COLORS.muted,
  );

  const innerW = parent.width - PAD * 2;
  const header = addWireBox(parent, PAD, 72, innerW, 40, '', COLORS.surface);
  const headerCols = [
    { label: 'Pantalla / módulo', x: 16 },
    { label: 'En wireframe', x: 340 },
    { label: 'En app (código)', x: 520 },
    { label: 'Hoja de ruta / notas', x: 700 },
  ];
  headerCols.forEach((c) => addText(header, c.label, c.x, 14, 11, 'bold', COLORS.text));

  const rowColX = [340, 520, 700];
  ROADMAP_ROWS.forEach((row, i) => {
    const y = 124 + i * 34;
    const box = addWireBox(parent, PAD, y, innerW, 30, '', COLORS.wireFill);
    addText(box, row[0], 16, 10, 10, 'medium', COLORS.text);
    rowColX.forEach((colX, idx) => {
      addText(box, row[idx + 1], colX, 10, 10, 'regular', statusColor(row[idx + 1]));
    });
  });

  const legend = addWireBox(parent, PAD, 124 + ROADMAP_ROWS.length * 34 + 16, innerW, 56, 'Leyenda');
  addText(legend, 'Verde = cubierto · Ámbar = parcial / roadmap · Rojo = no en wireframe', 16, 22, 11, 'regular', COLORS.muted);
}

function buildSitemap(parent) {
  addText(parent, 'MAPA DE RUTAS', PAD, PAD, 14, 'bold', COLORS.accent);
  const routes = [
    ['/', 'Landing', 'No'],
    ['/login', 'Login', 'No'],
    ['/app', 'Dashboard', 'Sí'],
    ['/app/productos', 'Productos', 'Sí'],
    ['/app/tipos-producto', 'Tipos producto', 'Sí'],
    ['/app/unidades-medida', 'Unidades medida', 'Sí'],
    ['/app/bodegas', 'Bodegas', 'Sí'],
    ['/app/inventario/stock', 'Stock', 'Sí'],
    ['/app/inventario/recepcion', 'Recepción', 'Sí'],
    ['/app/usuarios', 'Usuarios', 'Sí'],
    ['/app/cargos', 'Cargos', 'Sí'],
    ['/app/empresas', 'Empresas', 'Sí'],
    ['/app/perfil', 'Perfil', 'Sí'],
  ];
  routes.forEach((row, i) => {
    const box = addWireBox(parent, PAD, 50 + i * 52, FRAME_W - PAD * 2, 44, '', COLORS.wireFill);
    addText(box, row[0], 16, 16, 11, 'medium', COLORS.accent);
    addText(box, row[1], 280, 16, 11, 'regular', COLORS.text);
    addText(box, row[2], 520, 16, 11, 'regular', COLORS.muted);
  });
}

async function run() {
  await loadFonts();

  const page = figma.currentPage;
  page.name = 'WMS Wireframe';

  const row1Screens = [
    { name: '00 — Design tokens', build: buildColorTokens, h: 920 },
    { name: '01 — Mapa rutas', build: buildSitemap, h: FRAME_H },
    { name: '02 — Landing', build: buildLanding, h: FRAME_H },
    { name: '03 — Login', build: buildLogin, h: FRAME_H },
    { name: '04 — Dashboard', build: buildDashboard, h: FRAME_H },
    { name: '05 — CRUD Productos', build: (p) => buildCrud(p, 'CRUD — /app/productos', 'Inventario › Catálogo › Productos'), h: FRAME_H },
    { name: '06 — Stock', build: buildStock, h: FRAME_H },
    { name: '07 — Recepción', build: buildRecepcion, h: FRAME_H },
    { name: '08 — Perfil', build: buildPerfil, h: FRAME_H },
    { name: '09 — Usuarios', build: buildUsuarios, h: FRAME_H },
    { name: '10 — Empresas', build: buildEmpresas, h: FRAME_H },
  ];

  let x = 0;
  let row1MaxH = FRAME_H;
  for (const screen of row1Screens) {
    const frame = createScreenFrame(screen.name, x, 0, FRAME_W, screen.h);
    page.appendChild(frame);
    screen.build(frame);
    row1MaxH = Math.max(row1MaxH, screen.h);
    x += FRAME_W + GAP;
  }

  const compareW = Math.max(1600, x - GAP);
  const compareY = row1MaxH + 120;
  const compareH = 124 + ROADMAP_ROWS.length * 34 + 90;
  const compareFrame = createScreenFrame('11 — Comparativa (app vs wireframe vs roadmap)', 0, compareY, compareW, compareH);
  page.appendChild(compareFrame);
  buildRoadmapComparison(compareFrame);

  figma.viewport.scrollAndZoomIntoView(page.children);
  figma.closePlugin(
    `Wireframe WMS: ${row1Screens.length} pantallas + design tokens + comparativa en "${page.name}".`,
  );
}

run().catch((err) => {
  figma.closePlugin(`Error: ${err.message}`);
});
