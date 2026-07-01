# ADR 003: Módulo tenant (multi-empresa)

## Estado

Aceptado — piloto (2026-06)

## Contexto

Tras completar IAM (Fases 1a–1c), la lógica de **empresa maestra** y acceso cross-tenant seguía en `EmpresaMaestraService` acoplada directamente a `EmpresaAdministradaRepository`. RBAC bootstrap y asignación rol↔permiso necesitan validar acceso entre empresas administradas.

## Decisión

Crear `app/modules/tenant/` con:

- **Puerto** `ITenantRepository`: es_empresa_maestra, validar_acceso, listar administradas, ids scope
- **Infraestructura** `SqlAlchemyTenantRepository` + `TenantAccessAdapter` (consumido por IAM)
- **Composition root** `build_tenant_handlers()` en `app/bootstrap/tenant_container.py`
- **Fachada** `EmpresaMaestraService` delega al módulo tenant

IAM importa `TenantAccessAdapter` desde tenant (dependencia unidireccional: iam → tenant).

## Consecuencias

- Validación multi-tenant centralizada y testeable
- Camino para extraer `tenant-service` en microservicios
- Empresa CRUD (`EmpresaService`) permanece legacy hasta migración Fase 2

## Próximos pasos

- Handlers CRUD empresa en módulo tenant
- Módulo `catalog` (productos, tipos) como siguiente bounded context
