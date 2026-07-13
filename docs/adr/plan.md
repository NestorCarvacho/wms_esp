# Plan de corrección — violaciones de arquitectura y code smells

> **Estado (2026-07-13): implementado.** Commits: `55089d7` (refactor principal), `70f26f8` (stock mínimo), pendiente commit de cierre de pendientes.

Basado en el análisis de arquitectura hexagonal modular (ver `CLAUDE.md`). Objetivo: restaurar el aislamiento entre módulos (bounded contexts), reducir servicios sobredimensionados y eliminar duplicación de lógica de autorización.

## Protocolo de checkpoints

Cada paso numerado (1.1, 1.2, 1.3, 1.4, 2, 3) termina en un bloque **✅ CHECKPOINT** con comandos concretos. Regla para quien ejecute (humano o agente):

1. No pasar al siguiente paso hasta que el checkpoint del paso actual esté en verde.
2. Si el checkpoint falla: **no seguir avanzando ni "arreglar hacia adelante" a ciegas** — diagnosticar la causa en el propio commit/cambio recién hecho antes de tocar el siguiente archivo. Si no se resuelve en un intento razonable, revertir el paso (`git diff`/`git checkout` del archivo tocado) y reportar el bloqueo en vez de continuar con un estado roto.
3. Cada paso = un commit separado (o un diff revisable independiente) — esto es lo que permite revertir un paso sin arrastrar los demás.
4. Antes de cada checkpoint, correr también `git status` para confirmar que solo se tocaron los archivos esperados de ese paso (evita que un cambio en 1.1 arrastre ediciones no relacionadas en 1.3).

---

## 1. Acoplamiento cruzado entre módulos (prioridad alta)

**Problema:** varios módulos importan directamente la infraestructura/dominio de otros módulos, rompiendo el aislamiento que exige la arquitectura modular. Esto impide reemplazar o testear un módulo sin arrastrar a los demás, y contradice lo que exige `lint-imports` en CI.

**Riesgo de ciclos (verificado):** las 4 dependencias son unidireccionales — no existe import inverso `inventory→catalog`, `warehouse→inventory` ni `tenant→iam` en ningún archivo. Invertirlas con puertos **no genera ciclos** con el código actual.

**`app/shared/` ya existe**, con esta estructura:
```
app/shared/
├── formatting.py
├── locale_formatting.py
├── kernel/{exceptions.py, result.py}
└── presentation/result_http.py
```
No contiene puertos de dominio compartidos hoy — es el lugar natural para alojarlos, pero cada import cruzado detectado usa **un solo método** de la clase importada, así que en los 4 casos alcanza con un puerto de una función y no hace falta tocar `app/shared/kernel` ni `result.py`.

**Casos detectados (con firma exacta y uso real):**

### 1.1 `catalog` (infra) → `inventory` (infra)
- Archivo: `app/modules/catalog/infrastructure/producto_consulta_service.py:11`
- Import: `from app.modules.inventory.infrastructure.inventario_crud import InventarioCRUDRepository`
- Clase afectada: `ProductoConsultaService` (líneas 19-222), no implementa ninguna interfaz hoy; recibe `inventario_repo: InventarioCRUDRepository` en el constructor (líneas 20-28) y la guarda en `self.inventario_repo`.
- Único uso real (líneas 83-89):
  ```python
  stock_items, _ = await self.inventario_repo.listar_stock(
      empresa_id=empresa_id, producto_id=producto.id,
      pagina=1, por_pagina=500, es_super_admin=False,
  )
  ```
- **Corrección:** crear `IStockConsultaPort` en `app/modules/catalog/domain/ports.py`:
  ```python
  class IStockConsultaPort(Protocol):
      async def listar_stock_producto(self, empresa_id: int, producto_id: int) -> list[...]: ...
  ```
  Implementar un adaptador `InventarioStockConsultaAdapter` en `catalog/infrastructure/` que envuelva `InventarioCRUDRepository.listar_stock` con los parámetros fijos (`pagina=1, por_pagina=500, es_super_admin=False`) ya resueltos internamente. `ProductoConsultaService` pasa a depender de `IStockConsultaPort`, no de `InventarioCRUDRepository`.

**✅ CHECKPOINT 1.1**
```bash
grep -rn "from app.modules.inventory" app/modules/catalog/   # debe devolver 0 resultados
python -m pytest tests/modules/catalog/ -q                    # debe seguir en verde
lint-imports                                                    # sin nuevas violaciones catalog→inventory
```
Criterio de aceptación: `ProductoConsultaService` compila sin importar nada de `inventory` fuera del adaptador nuevo, y `consultar_por_codigo` sigue devolviendo el mismo resultado que antes (validar manualmente con un producto de prueba si no hay test — ver nota de cobertura más abajo).

**Estado: ✅** — `IStockConsultaPort`, adaptador, cableado y `tests/modules/catalog/test_producto_consulta_service.py`.

### 1.2 `catalog` (domain) → `inventory` (domain)
- Archivo: `app/modules/catalog/domain/services/presentacion_stock_converter.py` (7 líneas, es solo un re-export: `InventarioPresentacionService = PresentacionConverter`)
- Import: `from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter`
- No se usa ningún método directamente — todo el archivo es un alias de compatibilidad hacia atrás.
- `PresentacionConverter` (`app/modules/inventory/domain/services/presentacion_converter.py`, 31 líneas) tiene un único método público:
  ```python
  def calcular_descuento_stock_base(self, cantidad: Decimal, cantidad_contenida: Decimal,
      venta_por_presentacion: bool, permite_venta_unidad: bool, permite_venta_presentacion: bool) -> Decimal
  ```
- **Corrección:** este caso es distinto a los demás — no es un uso real, es un alias muerto o de compatibilidad. Antes de crear un puerto, **buscar quién importa `InventarioPresentacionService` desde `catalog`** (`grep -r "InventarioPresentacionService" app/`). Si no tiene consumidores, **eliminar el archivo directamente** (ver Checklist al agregar/eliminar código en `CLAUDE.md`). Si sí tiene consumidores, hacer que importen `PresentacionConverter` directamente desde `inventory.domain.services` en el punto de uso, y borrar el alias — no vale la pena crear un puerto para un simple re-export.

**✅ CHECKPOINT 1.2**
```bash
grep -rn "InventarioPresentacionService" app/   # decide la rama: 0 resultados → ya se puede borrar el archivo
python -m pytest -q                              # suite completa en verde (no solo catalog, por si algo externo sí lo usaba)
lint-imports
```
Criterio de aceptación: `presentacion_stock_converter.py` fue eliminado, o sus consumidores fueron migrados a importar `PresentacionConverter` directamente — en ambos casos, cero referencias a `InventarioPresentacionService` en el repo.

**Estado: ✅** — archivo eliminado; `producto_presentacion_service.py` importa `PresentacionConverter` directamente.

### 1.3 `inventory` (infra) → `warehouse` (infra)
- Archivo: `app/modules/inventory/infrastructure/sqlalchemy_repository.py:10`
- Import: `from app.modules.warehouse.infrastructure.bodega_crud import BodegaCRUDRepository`
- Instanciado en línea 19: `self._bodega = BodegaCRUDRepository(session)`
- Único uso, dentro de `bodega_existe` (líneas 32-34):
  ```python
  async def bodega_existe(self, bodega_id: int, empresa_id: int) -> bool:
      bodega = await self._bodega.obtener_por_id(bodega_id, empresa_id)
      return bodega is not None
  ```
- **Corrección:** crear `IBodegaExistenciaPort` en `app/modules/inventory/domain/ports.py`:
  ```python
  class IBodegaExistenciaPort(Protocol):
      async def existe(self, bodega_id: int, empresa_id: int) -> bool: ...
  ```
  Implementar `WarehouseBodegaExistenciaAdapter` en `inventory/infrastructure/` que envuelva `BodegaCRUDRepository.obtener_por_id` y devuelva el booleano. `SqlAlchemyInventarioRepository` (o la clase que contiene `bodega_existe`) pasa a recibir el puerto por constructor en vez de instanciar `BodegaCRUDRepository` directamente.

**✅ CHECKPOINT 1.3**
```bash
grep -rn "from app.modules.warehouse" app/modules/inventory/   # debe devolver 0 resultados
python -m pytest tests/modules/inventory/test_recepcionar_handler.py -q -v   # confirmar si toca bodega_existe; debe seguir en verde
lint-imports
```
Criterio de aceptación: si `test_recepcionar_handler.py` no ejercita `bodega_existe`, agregar un test unitario mínimo del adaptador nuevo (mock del puerto, casos existe/no-existe) antes de marcar este paso como completo — no dejarlo sin cobertura.

**Estado: ✅** — `IBodegaExistenciaPort`, adaptador, UoW cableado y `tests/modules/inventory/test_warehouse_bodega_existencia_adapter.py`.

### 1.4 `iam` (infra) → `tenant` (infra)
- Archivo: `app/modules/iam/infrastructure/crud_repositories.py:8-9`
- Imports: `EmpresaCRUDRepository` (tenant) y `TenantAccessAdapter` (tenant)
- Uso 1 — `SqlAlchemyEmpresaReadRepository` (líneas 229-234): solo `obtener_por_id(empresa_id)`.
- Uso 2 — `SqlAlchemyTenantAccessValidator` (líneas 142-147): solo `validar_acceso(empresa_maestra_id, empresa_objetivo_id)`.
- **Corrección:** crear dos puertos pequeños en `app/modules/iam/domain/ports.py`:
  ```python
  class IEmpresaLookupPort(Protocol):
      async def obtener_por_id(self, empresa_id: int) -> ...: ...

  class ITenantAccessPort(Protocol):
      async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> bool: ...
  ```
  Implementar adaptadores en `iam/infrastructure/` que delegan 1:1 en `EmpresaCRUDRepository` y `TenantAccessAdapter` respectivamente (son wrappers casi transparentes, dado que la firma ya coincide). `SqlAlchemyEmpresaReadRepository` y `SqlAlchemyTenantAccessValidator` reciben estos puertos por constructor.

**✅ CHECKPOINT 1.4**
```bash
grep -rn "from app.modules.tenant" app/modules/iam/   # debe devolver 0 resultados
python -m pytest tests/modules/iam/ -q                  # test_login_handler, test_rbac_handlers, test_catalog_handlers en verde
lint-imports
```
Criterio de aceptación: login y validación de acceso multi-empresa (empresa maestra accediendo a empresa gestionada) siguen funcionando igual — si no hay test directo de `TenantAccessAdapter`, probar manualmente un login de empresa maestra con `?empresa_id=` antes de cerrar el paso.

**Estado: ✅** — `IEmpresaLookupPort` / `ITenantAccessPort` en `iam/domain/ports.py` (con alias `IEmpresaReadRepository` / `ITenantAccessValidator`), adaptadores en `tenant_adapters.py`, `tests/modules/iam/test_tenant_adapters.py`.

**Cableado común (los 4 casos):** actualizar el `build_*_handlers` correspondiente en `app/bootstrap/` para instanciar el adaptador nuevo (ej. `InventarioStockConsultaAdapter(InventarioCRUDRepository(session))`) e inyectarlo donde antes se pasaba el repo concreto.

**Lint:** configurar `import-linter` (`setup.cfg` o `.importlinter`, verificar cuál usa el proyecto) con un contrato tipo `Layers` o `Independence` que prohíba imports de `domain/`/`infrastructure/` de un módulo hacia otro módulo salvo a través de `domain/ports.py` propio. Esto evita que el problema reaparezca sin depender de revisión manual en PR.

**Tests:** no existe cobertura hoy para ninguno de los 4 flujos afectados:
- `ProductoConsultaService` — sin test (`tests/modules/catalog/` solo cubre `test_producto_handlers.py` y `test_tipo_producto_handlers.py`).
- `SqlAlchemyInventarioRepository.bodega_existe` — cobertura indirecta dudosa vía `tests/modules/inventory/test_recepcionar_handler.py` (único test del módulo); revisar si ese test toca `bodega_existe` antes de refactorizar.
- `SqlAlchemyEmpresaReadRepository` / `SqlAlchemyTenantAccessValidator` — sin test directo; `tests/modules/iam/` (`test_login_handler.py`, `test_rbac_handlers.py`, `test_catalog_handlers.py`) no los referencia por nombre.

Dado que no hay red de seguridad, **agregar un test unitario del adaptador nuevo (mockeando el puerto)** antes de eliminar el import directo, para no refactorizar a ciegas.

**✅ CHECKPOINT DE CIERRE — Sección 1**
```bash
lint-imports                 # el contrato nuevo (paso 4 de "Cableado común") debe pasar en verde para los 4 pares de módulos
python -m pytest -q          # suite completa
cd frontend && npm run build # por si algún tipo compartido de API cambió (poco probable, pero barato de verificar)
```
Solo al llegar aquí en verde se considera cerrada la Sección 1 y se puede pasar a la Sección 2.

**Estado: ✅** — contratos `import-linter` (6 nuevos), `pytest` y `npm run build` en verde.

---

## 2. Servicio de infraestructura sobredimensionado (prioridad media)

**Archivo:** `app/modules/catalog/infrastructure/producto_importacion_service.py` (633 líneas)

**Problema:** mezcla parsing de Excel, validación de negocio y persistencia en una sola clase/archivo, dificultando testing unitario y violando SRP.

**Tests existentes:** ninguno. No hay archivos en `tests/` que referencien `importar_desde_excel` ni `openpyxl` — esta refactorización parte sin red de seguridad, así que el paso 3 (tests nuevos) no es opcional.

**Inventario real de métodos, agrupados por responsabilidad:**

| Grupo | Método | Línea | Qué hace |
|---|---|---|---|
| Parsing / plantilla Excel | `generar_plantilla` | 89 | Genera el archivo Excel de plantilla vacío para descarga |
| Parsing / plantilla Excel | `_estilar_encabezado` | 147 | Da formato/estilo a la cabecera de la plantilla generada |
| Parsing / plantilla Excel | `_parsear_productos` | 509 | Parsea filas de la hoja de productos del Excel a diccionarios |
| Parsing / plantilla Excel | `_parsear_presentaciones` | 563 | Parsea filas de presentaciones del Excel |
| Parsing / plantilla Excel | `_indices_columnas` | 614 | Resuelve índices de columnas según encabezado y mapping esperado |
| Validación de negocio | `_cargar_existentes` | 503 | Carga SKUs/barcodes ya existentes en BD para detectar duplicados |
| Validación de negocio | `_cargar_barcodes_existentes` | 490 | Obtiene el set de códigos de barra ya registrados por empresa |
| Validación de negocio | `_mapa_skus_empresa` | 480 | Mapea SKU → id de producto existente por empresa |
| Persistencia / orquestación | `importar_desde_excel` | 155 | Método público principal: orquesta parseo → validación → creación |
| Persistencia / orquestación | `_crear_presentaciones_masivo` | 454 | Inserta en bloque las presentaciones nuevas |

**Enfoque de corrección:**

1. Separar en tres piezas dentro de `catalog/infrastructure/`:
   - **`producto_importacion_parser.py`**: mueve `_parsear_productos`, `_parsear_presentaciones`, `_indices_columnas`, `generar_plantilla`, `_estilar_encabezado`. Solo depende de `openpyxl`, sin tocar BD ni reglas de negocio.
   - **`producto_importacion_validador.py`**: mueve `_cargar_existentes`, `_cargar_barcodes_existentes`, `_mapa_skus_empresa`. Recibe las filas parseadas y devuelve filas válidas + errores por fila (necesita acceso de solo-lectura al repo para chequear duplicados — inyectar `IProductoRepository`, no una sesión de BD directa).
   - **`producto_importacion_service.py`** (se queda con este nombre, pero se reduce a orquestar): conserva `importar_desde_excel` y `_crear_presentaciones_masivo`, invocando parser → validador → `IProductoRepository.crear()` en lote.
2. El puerto `IProductoImportacionService` en `domain/ports.py` no cambia de firma pública; solo cambia la implementación interna — el endpoint y el bootstrap de `catalog_container.py` no requieren cambios salvo el wiring de las nuevas dependencias del servicio orquestador (parser + validador).
3. Antes de mover código, agregar tests de caracterización sobre `importar_desde_excel` con un Excel de ejemplo (happy path + un caso con SKU duplicado) para tener una base de comparación. Después de separar, agregar tests unitarios independientes para parser (dado un Excel, produce los diccionarios esperados) y validador (dado un set de filas + existentes en BD, marca los duplicados correctamente).

**✅ CHECKPOINT 2.a — antes de mover código**
```bash
python -m pytest tests/modules/catalog/test_importacion_caracterizacion.py -q   # archivo nuevo de caracterización, debe pasar contra el código ACTUAL sin tocar
```
No avanzar al split de archivos hasta tener este test en verde contra el código original — es la base de comparación.

**✅ CHECKPOINT 2.b — después de separar en 3 archivos**
```bash
python -m pytest tests/modules/catalog/test_importacion_caracterizacion.py -q   # debe seguir pasando IDÉNTICO tras el split
python -m pytest tests/modules/catalog/test_producto_importacion_parser.py -q     # test nuevo del parser
python -m pytest tests/modules/catalog/test_producto_importacion_validador.py -q  # test nuevo del validador
lint-imports
```
Criterio de aceptación: el test de caracterización pasa sin modificaciones (mismo input, mismo output que antes del split) — si hay que tocar ese test para que pase, es señal de que el split cambió comportamiento, no solo estructura.

**Estado: ✅** — split en `parser` / `validador` / `service`; validador usa `IProductoRepository` (métodos `listar_skus_y_nombres_empresa`, `listar_codigos_barras_empresa`, `mapa_ids_por_skus`); tests de caracterización, parser y validador en verde.

---

## 3. Duplicación de autorización en endpoints (prioridad baja)

**Archivo:** `app/api/v1/endpoints/productos.py` — el chequeo `if not es_admin and producto["empresa_id"] != empresa_id: raise HTTPException(403, ...)` se repite manualmente en al menos 2-3 endpoints (líneas 244 y 394 según el análisis previo).

**Enfoque de corrección:**

1. Añadir un método a `ContextoEmpresa` (`app/api/v1/empresa_contexto.py`), por ejemplo `ctx.verificar_acceso_a_empresa(empresa_id_del_recurso: int) -> None`, que encapsule la comprobación y lance el `HTTPException(403)` de forma centralizada.
2. Reemplazar las repeticiones en `productos.py` (y revisar si el mismo patrón existe en otros endpoints CRUD del catálogo/inventario) por una sola llamada a `ctx.verificar_acceso_a_empresa(...)`.
3. Si el patrón se repite en más de 2 módulos, documentarlo en `CLAUDE.md` bajo "Helpers obligatorios" para que nuevas features lo usen desde el inicio.

**✅ CHECKPOINT 3**
```bash
grep -rn 'es_admin and producto\[' app/api/v1/endpoints/   # debe devolver 0 resultados tras el reemplazo
python -m pytest -k "producto and (permiso or empresa or 403)" -q   # tests de acceso multi-tenant existentes
curl -X GET localhost:8000/api/v1/productos/{id} -H "Authorization: Bearer <token_empresa_B>"  # smoke test manual: 403 esperado al acceder a producto de otra empresa
```
Criterio de aceptación: mismo código de respuesta (403) y mismo mensaje de error que antes del cambio — es un refactor de forma, no de comportamiento.

**Estado: ✅** — `verificar_acceso_a_empresa` en todos los endpoints GET detalle afectados (`productos`, `bodegas`, `roles`, `cargos`, `unidadesMedidas`, `tipos-producto`, `tipos-zona`, `zonas-bodega`); documentado en `CLAUDE.md`; `tests/api/test_empresa_contexto.py`.

---

## Orden sugerido de ejecución

Secuencia con puerta de checkpoint entre cada paso — no se avanza al siguiente número sin el ✅ del anterior:

1. **Checkpoint 3** — bajo riesgo, cambio pequeño y aislado, sirve de calentamiento.
2. **Checkpoint 1.1** → **1.2** → **1.3** → **1.4** → **Checkpoint de cierre Sección 1** — un commit por checkpoint, PR separado por par de módulos si se quiere revisar en GitHub antes de seguir con el siguiente par.
3. **Checkpoint 2.a** (test de caracterización) → split de archivos → **Checkpoint 2.b** — nunca mover código de `producto_importacion_service.py` antes de tener 2.a en verde.

Si algún checkpoint intermedio falla y no se resuelve en el propio paso, se revierte ese paso puntual (no los anteriores, que ya quedaron validados) y se reporta el bloqueo antes de continuar — ver "Protocolo de checkpoints" al inicio de este documento.
