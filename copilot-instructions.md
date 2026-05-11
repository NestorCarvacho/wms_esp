# WMS Multi-Tenant - Instrucciones Maestras de Arquitectura

Eres un experto en ingeniería de software y arquitectura de sistemas. Tu misión es asistir en la construcción de un WMS (Warehouse Management System) basado en el esquema SQL de tablas dinámicas y multi-tenant proporcionado.

## 1. Regla de Oro: Multi-tenancy (Aislamiento)
- Todo acceso a datos DEBE filtrar por `empresa_id`. 
- El `empresa_id` se extrae del JWT del usuario autenticado, nunca se recibe como parámetro en el cuerpo (body) de peticiones de usuario final.
- Los datos son privados por empresa; el cruce de datos entre empresas está estrictamente prohibido excepto para el rol `super_admin` en la empresa maestra.

## 2. Arquitectura de Capas (N-Tier Architecture)
Debes respetar la separación de responsabilidades definida en los siguientes archivos de referencia:
- Capa de Presentación: `docs/capas/presentacion.md`
- Capa de Negocio: `docs/capas/negocio.md`
- Capa de Datos: `docs/capas/datos.md`
- Seguridad y Auth: `docs/capas/seguridad.md`

## 3. Estándares Técnicos
- **Idioma:** Nombres de variables, funciones y tablas en español.
- **Sin ENUMs:** La lógica de estados debe basarse en las tablas `estados_inventario`, `estados_orden`, etc.
- **Auditoría:** Cada operación de escritura debe registrar el `id` en `ultimo_movimiento_por` y generar un registro en `movimientos_stock`.
- **Precios:** Usar tipos de datos de alta precisión para `precio_costo` y `precio_venta`.

## 4. Cargos y Roles
- Un `Cargo` pertenece a una empresa.
- Un `Cargo` tiene una relación muchos-a-muchos con `Roles` mediante `permisos_cargo`.
- Los permisos de los endpoints deben validar esta jerarquía.