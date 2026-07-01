# ADR 002: Módulo IAM hexagonal (Fase 1a)

## Estado

Aceptado — Fase 1a (2026-06)

## Contexto

Tras el piloto `inventory` (ADR 001), el siguiente bounded context crítico es **IAM**: login, JWT, permisos RBAC y recuperación de contraseña. Hoy:

- `AutorizacionService` importaba SQLAlchemy directamente en `domain`
- `AuthService` mezclaba reglas de bloqueo, email, JWT y persistencia

## Decisión

Crear `app/modules/iam/` con vertical slice **autenticación + resolución de permisos**:

| Handler | Responsabilidad |
|---------|-----------------|
| `LoginHandler` | Credenciales, bloqueo, emisión JWT |
| `ResolverPermisosUsuarioQueryHandler` | Cadena usuario_rol → permiso |
| `SolicitarRecuperacionContrasenaHandler` | Token reset + email |
| `RestablecerContrasenaHandler` | Cambio con token |
| `CambiarContrasenaHandler` | Cambio autenticado |
| `ValidarTokenQueryHandler` | Validación payload JWT |

**Puertos:** `IUserAuthRepository`, `IAutorizacionRepository`, `ITokenIssuer`, `IPasswordHasher`, `IEmailNotifier`, `IPasswordResetRepository`.

**Fachadas legacy:** `AuthService`, `AutorizacionService` delegan a handlers.

**Composition root:** `build_iam_handlers()` en `app/bootstrap/container.py`.

## Consecuencias

- Tests unitarios de login sin BD
- SQL de permisos movido a `iam/infrastructure`
- `/auth/registrar` sigue roto (sin handler) — pendiente Fase 1b con `UsuarioService`
- `app/api/v1/dependencies.py` sin cambios de contrato JWT

## Fase 1c (completada)

- CRUD handlers: Rol, Permiso, Cargo
- `ProvisionarRbacEmpresaHandler` (bootstrap catálogo RBAC)
- Puertos `IRolRepository`, `IPermisoRepository`, `ICargoRepository`, `IRbacBootstrapRepository`

## Fase 2 — tenant (piloto, ADR 003)

- Módulo `app/modules/tenant/` con `ITenantRepository`
- `EmpresaMaestraService` como fachada
- IAM consume `TenantAccessAdapter`

## Próximos pasos

- CRUD empresa en módulo tenant
- Módulo `catalog` (productos)
- `notification-service` (WebSocket/email)

## Historial de fases IAM

**1b:** Handlers CRUD usuario, sync RBAC, `/auth/registrar` vía `CrearUsuarioHandler`.

**1a:** Login, permisos, recuperación contraseña; fachadas `AuthService` / `AutorizacionService`.
