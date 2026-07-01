# Manual de uso — Khepri Software WMS

**Tu WMS a tu medida**

Manual para operadores de bodega, jefes de almacén y administradores del sistema. No requiere conocimientos técnicos.

---

## Tabla de contenidos

1. [Introducción](#1-introducción)
2. [Acceso al sistema](#2-acceso-al-sistema)
3. [Navegación y permisos](#3-navegación-y-permisos)
4. [Configuración inicial recomendada](#4-configuración-inicial-recomendada)
5. [Catálogo e infraestructura de almacén](#5-catálogo-e-infraestructura-de-almacén)
6. [Inventario operativo](#6-inventario-operativo)
7. [Administración de usuarios y accesos](#7-administración-de-usuarios-y-accesos)
8. [Multi-empresa (empresa maestra)](#8-multi-empresa-empresa-maestra)
9. [Regionalización (idioma, hora y moneda)](#9-regionalización-idioma-hora-y-moneda)
10. [Exportaciones e informes](#10-exportaciones-e-informes)
11. [Notificaciones en tiempo real](#11-notificaciones-en-tiempo-real)
12. [Preguntas frecuentes](#12-preguntas-frecuentes)

---

## 1. Introducción

**Khepri Software WMS** es un sistema de gestión de almacén (*Warehouse Management System*) que permite:

- Registrar productos, bodegas y ubicaciones (zonas).
- Controlar el stock en cada ubicación.
- Registrar recepciones, traslados internos y despachos con trazabilidad.
- Administrar usuarios con permisos granulares por empresa.
- Operar en entornos **multi-empresa** (varios clientes en una misma plataforma).

Cada empresa ve únicamente sus propios datos. Los usuarios solo acceden a las pantallas para las que tienen permiso.

---

## 2. Acceso al sistema

### 2.1 URLs

| Entorno | Dirección |
|---------|-----------|
| **Producción** | https://wms-frontend-production-296e.up.railway.app |
| **Desarrollo local** | http://localhost:5173 |

### 2.2 Iniciar sesión

1. Abra la URL de la aplicación.
2. En la pantalla de inicio, haga clic en **Iniciar sesión** (o vaya directamente a `/login`).
3. Ingrese su **correo electrónico** y **contraseña**.
4. Pulse **Iniciar sesión**.

Tras un login exitoso llegará al **Panel principal** (`/app`).

> **Importante:** Si acaba de cambiar permisos, configuración regional de la empresa o migraciones del sistema, **cierre sesión y vuelva a entrar** para refrescar su sesión.

### 2.3 Recuperar contraseña

1. En la pantalla de login, haga clic en **¿Olvidó su contraseña?**
2. Ingrese su correo registrado.
3. Revise su bandeja de entrada (o la consola del servidor en entornos de prueba) y siga el enlace de recuperación.
4. Defina una contraseña nueva que cumpla: mínimo 8 caracteres, al menos una mayúscula y un número.

### 2.4 Bloqueo por intentos fallidos

Por seguridad, tras varios intentos incorrectos la cuenta se bloquea temporalmente. Si el bloqueo es permanente, contacte al administrador de su empresa.

### 2.5 Mi perfil

Desde el menú de usuario puede acceder a **Perfil** (`/app/perfil`) para actualizar datos personales (nombre, teléfono, dirección, etc.).

---

## 3. Navegación y permisos

### 3.1 Menú lateral

El menú se organiza en tres bloques principales:

| Bloque | Contenido |
|--------|-----------|
| **Inventario** | Catálogo de productos y configuración de almacén (bodegas, zonas) |
| **Inventario operativo** | Dashboard, consultas de stock, operaciones y configuración de recepción |
| **Administración** | Usuarios, cargos, roles y permisos |
| **Configuración** | Panel principal y, para super administradores, gestión de empresas |

Solo verá las opciones para las que su usuario tiene permiso. Si falta una pantalla, solicítela a su administrador.

### 3.2 Permisos habituales

Los permisos siguen el formato `modulo.accion`. Ejemplos:

| Permiso | Permite |
|---------|---------|
| `productos.leer` | Ver listado de productos |
| `productos.crear` | Crear productos |
| `inventario.leer` | Ver dashboard, stock y movimientos |
| `inventario.recepcionar` | Registrar recepciones |
| `inventario.trasladar` | Traslados entre zonas |
| `inventario.despachar` | Despachos / salidas |
| `inventario.configurar` | Configurar zona de recepción por bodega |
| `usuarios.leer` | Ver usuarios |
| `roles.leer` | Ver roles y asignar permisos |

### 3.3 Tablas CRUD (listados)

En la mayoría de pantallas encontrará:

- **Búsqueda** en la parte superior de la tabla.
- **Paginación** al pie (cambie filas por página si lo necesita).
- **Orden** haciendo clic en columnas marcadas como ordenables.
- **Crear** con el botón verde o **+** (si tiene permiso).
- **Editar / Eliminar** en el menú de acciones de cada fila (icono ⋮ o lápiz).

---

## 4. Configuración inicial recomendada

Antes de operar inventario, configure el maestro de datos en este orden:

```
1. Unidades de medida
2. Tipos de producto
3. Bodegas
4. Tipos de zona  →  Zonas de bodega
5. Productos (+ presentaciones si aplica)
6. Zona de recepción por bodega (Inventario → Configuración)
7. Usuarios, cargos, roles y permisos
```

### 4.1 Unidades de medida

**Menú:** Inventario → Catálogo → Unidades de medida

Defina las unidades base de sus productos (unidad, caja, kilogramo, etc.). Cada producto usa una unidad base para el stock.

### 4.2 Tipos de producto

**Menú:** Inventario → Catálogo → Tipos de producto

Clasifique sus productos (ej.: insumo, terminado, repuesto).

### 4.3 Bodegas

**Menú:** Inventario → Almacén → Bodegas

Registre cada almacén físico o lógico de su empresa.

### 4.4 Tipos de zona y zonas de bodega

**Menú:** Inventario → Almacén → Tipos de zona / Zonas de bodega

- **Tipo de zona:** categoría (recepción, picking, cuarentena, etc.).
- **Zona de bodega:** ubicación concreta dentro de una bodega (ej.: Pasillo A — Estante 3).

El stock se controla **por zona**, no solo por bodega.

### 4.5 Productos

**Menú:** Inventario → Catálogo → Productos

Campos principales:

| Campo | Descripción |
|-------|-------------|
| SKU | Código único; se usa en escaneo con pistola |
| Nombre | Descripción del producto |
| Unidad de medida | Unidad base del stock |
| Tipo de producto | Clasificación |
| Serializado | Si cada unidad lleva número de serie individual |

**Importación masiva:** en Productos, use el menú **Importar** para cargar un archivo Excel. Descargue antes la **plantilla** desde el mismo menú.

**Presentaciones:** un producto puede venderse/recibirse en cajas o displays distintos a la unidad base. Configure presentaciones en el panel de edición del producto.

---

## 5. Catálogo e infraestructura de almacén

### 5.1 Consulta rápida de producto

**Menú:** Inventario → Catálogo → Consulta producto

Busque por SKU o nombre para ver stock disponible por ubicación sin entrar al listado completo.

### 5.2 Productos serializados

Si un producto está marcado como **serializado**, en recepción deberá registrar cada número de serie. El sistema rastrea cada unidad individualmente.

---

## 6. Inventario operativo

**Menú:** Inventario operativo

Use las pestañas superiores para cambiar de vista.

### 6.1 Dashboard

Muestra un resumen operativo:

- Cantidad de líneas de stock y productos con existencias.
- Movimientos del día y de la semana.
- Gráficos de distribución de stock por bodega o ubicación.
- Últimos movimientos registrados.

Puede filtrar el gráfico por bodega.

### 6.2 Stock por ubicación

Lista el stock actual: **producto + bodega + zona + cantidad** (en unidades base).

Use la búsqueda y paginación para localizar referencias. Desde aquí puede **exportar** a Excel o PDF (botón Exportar).

### 6.3 Historial de movimientos

Registro auditado de todas las operaciones: recepciones, traslados y despachos.

Cada movimiento incluye:

- Fecha y hora (ajustada a su zona horaria configurada).
- Usuario que registró la operación.
- Producto, cantidad, zonas origen/destino.
- Documento de referencia (opcional).

También admite **exportación** Excel/PDF.

### 6.4 Recepción

**Permiso requerido:** `inventario.recepcionar`

Ingreso de mercancía a una zona de la bodega.

**Pasos:**

1. Seleccione **bodega** (y empresa, si es super admin).
2. Escanee o busque el producto por **SKU**.
3. Indique **cantidad** y, si aplica, **presentación** (caja, unidad, etc.).
4. Opcional: folio de documento (guía, OC) y observaciones.
5. Confirme la recepción.

**Zona de destino:** si no elige una zona, el sistema usa la **zona de recepción por defecto** configurada para esa bodega (véase § 6.7).

**Escaneo con pistola:** el campo de búsqueda acepta el SKU escaneado. Puede acumular varias líneas en un lote antes de confirmar.

**Productos serializados:** use el panel de recepción serializada para ingresar cada número de serie.

### 6.5 Traslado

**Permiso requerido:** `inventario.trasladar`

Mueve stock entre **dos zonas de la misma bodega** (ej.: de recepción a picking).

1. Seleccione producto y cantidad.
2. Elija **zona origen** y **zona destino** (deben ser distintas).
3. Confirme.

El stock disminuye en origen y aumenta en destino en una sola operación atómica.

### 6.6 Despacho

**Permiso requerido:** `inventario.despachar`

Salida de mercancía desde una zona (venta, consumo, devolución a proveedor, etc.).

1. Seleccione producto y cantidad.
2. Elija **zona origen** (debe tener stock suficiente).
3. Opcional: documento de referencia.
4. Confirme.

### 6.7 Configuración — Zona de recepción

**Permiso requerido:** `inventario.configurar`

**Menú:** Inventario operativo → Configuración

Para cada bodega, defina la **zona de recepción por defecto**. Sin esta configuración, las recepciones sin zona explícita fallarán con un mensaje indicando que debe configurarla.

### 6.8 Unidades y presentaciones en operaciones

- El stock interno siempre se registra en **unidades base** del producto.
- Si opera en cajas o displays, seleccione la presentación; el sistema convierte automáticamente según la cantidad contenida configurada en el producto.

### 6.9 Flujo operativo típico del día

```
Recepción (zona recepción)
    ↓
Traslado (recepción → picking / almacenamiento)
    ↓
Despacho (picking → salida)
```

Consulte stock y movimientos en cualquier momento para conciliar.

---

## 7. Administración de usuarios y accesos

### 7.1 Modelo de accesos

```
Usuario  →  Cargo  →  Rol(es)  →  Permiso(s)
```

- **Cargo:** puesto de trabajo (ej.: Jefe de bodega).
- **Rol:** conjunto reutilizable de permisos (ej.: Administrador, Operador inventario).
- **Permiso:** acción atómica (ej.: `inventario.recepcionar`).

Al crear un usuario se le asigna un cargo; los roles del cargo se heredan automáticamente.

### 7.2 Usuarios

**Menú:** Administración → Usuarios

- **Crear:** correo, contraseña temporal, cargo y empresa.
- **Editar:** cambiar cargo, activar/desactivar.
- **Eliminar:** desactiva el acceso del usuario.

### 7.3 Cargos

**Menú:** Administración → Cargos

Catálogo de puestos por empresa. Vincule roles a cargos desde **Asignar permisos** (vía matriz cargo–rol en el backend) o asigne roles directamente al usuario según la configuración de su implementación.

### 7.4 Roles

**Menú:** Administración → Roles

Defina roles con nombre y descripción. Luego asigne permisos en la pantalla **Asignar permisos**.

### 7.5 Asignar permisos

**Menú:** Administración → Asignar permisos

1. Seleccione la **empresa** (obligatorio si es super admin).
2. Elija un **rol**.
3. Marque los permisos en la matriz (módulo × acción: leer, crear, editar, eliminar).
4. Guarde.

Si la empresa no tiene permisos base, use el botón **Provisionar RBAC** para copiar el catálogo estándar desde la empresa plantilla.

### 7.6 Permisos (catálogo)

**Menú:** Administración → Permisos

Vista del catálogo de permisos de la empresa. Normalmente no requiere edición manual; se provisiona con el bootstrap RBAC.

---

## 8. Multi-empresa (empresa maestra)

Algunos usuarios pertenecen a la **empresa maestra** (plataforma SaaS). Ellos pueden:

- Ver y administrar **todas las empresas** clientes.
- Filtrar listados por empresa en un selector superior (**Filtro de empresa**).
- Crear nuevas empresas desde **Configuración → Empresas**.

### 8.1 Filtro de empresa

En pantallas con filtro de empresa:

1. Seleccione la empresa en el desplegable superior.
2. Los listados y operaciones aplican a esa empresa.
3. Debe elegir una empresa concreta antes de asignar permisos o editar catálogos dependientes.

### 8.2 Crear una empresa cliente

**Menú:** Configuración → Empresas → Nueva empresa

Complete datos legales y de contacto. Al crear, el sistema puede provisionar automáticamente permisos y roles estándar.

### 8.3 Regionalización por empresa

En **Editar empresa**, sección **Regionalización**, configure idioma, zona horaria y moneda por defecto para todos los usuarios de esa empresa (véase § 9).

---

## 9. Regionalización (idioma, hora y moneda)

El sistema adapta fechas, números y moneda según la configuración de la empresa y la sesión del usuario.

### 9.1 Configuración por empresa

**Menú:** Configuración → Empresas → Editar → Regionalización

| Campo | Ejemplo | Efecto |
|-------|---------|--------|
| Idioma / locale | `es-CL`, `en-US`, `es-MX` | Textos de interfaz e idioma de notificaciones |
| Zona horaria | `America/Santiago` | Horas en movimientos e informes |
| Moneda | `CLP`, `USD`, `MXN` | Formato de montos |

### 9.2 Al iniciar sesión

Al hacer login, el sistema aplica automáticamente las preferencias de su empresa (o overrides de perfil si existen). Verá fechas y números formateados según esas preferencias.

### 9.3 Operación cross-border

Empresas con operaciones en varios países pueden:

- Configurar locale distinto por tenant (empresa en Chile vs. sucursal en México).
- Usuarios de la misma empresa ven timestamps en **su zona horaria**, evitando confusiones en auditoría de bodegas.

---

## 10. Exportaciones e informes

Disponibles en **Stock por ubicación** e **Historial de movimientos**:

| Formato | Uso |
|---------|-----|
| **Excel (.xlsx)** | Análisis en hoja de cálculo |
| **PDF** | Impresión o archivo |

Los export respetan el filtro de empresa activo y el orden de la tabla. Límite: hasta 50.000 filas por exportación.

---

## 11. Notificaciones en tiempo real

Mientras tenga abierta una vista de **Inventario operativo**, el sistema mantiene una conexión en vivo con el servidor.

Recibirá avisos en pantalla (toast) cuando:

- Se registre una recepción, traslado o despacho en su empresa.
- Otro usuario realice una operación de stock.

El mensaje aparece en el **idioma configurado** en su sesión (ej.: *"Recepción registrada…"* en español o *"Receipt recorded…"* en inglés).

> Si no ve notificaciones, verifique que no tenga bloqueados los WebSocket en su red corporativa.

---

## 12. Preguntas frecuentes

### No veo una opción del menú

Su usuario no tiene el permiso necesario. Contacte al administrador para que asigne el rol o permiso correspondiente. Después, **cierre sesión y vuelva a entrar**.

### Error al recepcionar: "Configure la zona de recepción"

Vaya a **Inventario operativo → Configuración**, seleccione la bodega y asigne una zona de recepción por defecto.

### El traslado no permite zonas de bodegas distintas

Los traslados solo funcionan **dentro de la misma bodega**. Para mover entre bodegas, use despacho desde la bodega origen y recepción en la bodega destino.

### No hay stock suficiente al despachar o trasladar

Verifique en **Stock por ubicación** la cantidad en la zona origen. Corrija con un ajuste vía recepción si hubo un error previo.

### Cambié permisos pero no surten efecto

Cierre sesión completamente y vuelva a iniciar sesión para obtener un token actualizado.

### Las fechas no coinciden con mi hora local

Verifique la **regionalización de la empresa** (zona horaria). Tras cambiarla, cierre sesión y vuelva a entrar.

### Soy super admin y los listados están vacíos

Seleccione una **empresa** en el filtro superior antes de consultar catálogos o asignar permisos.

### Importación de productos falla

Descargue la **plantilla actual** desde Productos → Importar. Verifique que los SKU no estén duplicados y que las unidades de medida existan.

---

## Soporte

| Recurso | Enlace |
|---------|--------|
| Índice técnico del proyecto | [INDEX.md](./INDEX.md) |
| API (desarrolladores) | https://wmsesp-production.up.railway.app/docs |
| Inventario — detalle técnico | [CORE_WMS.md](./CORE_WMS.md) |

---

*Manual versión 1.0 — Khepri Software WMS — Junio 2026*
