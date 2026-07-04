# Contribuir a WMS ESP

Guía para desarrolladores que trabajan en el repositorio [NestorCarvacho/wms_esp](https://github.com/NestorCarvacho/wms_esp).

## Requisitos previos

- Python 3.9+, Node.js 18+, MySQL 8.0
- Clonar el repo e instalar dependencias (`README.md`)

## Flujo de trabajo

1. Crear rama desde `main`: `git checkout -b feature/mi-cambio`
2. Implementar cambios siguiendo la arquitectura hexagonal (ver [ARCHITECTURE.md](./ARCHITECTURE.md))
3. Ejecutar checks locales antes del push:

```bash
python -m pytest -q
lint-imports          # pip install import-linter
cd frontend && npm run build
```

4. Abrir Pull Request hacia `main`
5. CI debe pasar: pytest, lint-imports, frontend build (`.github/workflows/ci.yml`)

## Reglas de arquitectura

### Endpoints nuevos o modificados

- Router delgado en `app/api/v1/endpoints/`
- Inyectar handlers vía `Depends(obtener_*_handlers)` — **no** servicios en `app/domain/services/` (eliminados)
- Multi-tenant: usar `contexto_requiere_permiso("recurso.accion")` y `kwargs_listado(ctx)`

### Código en bounded contexts

| Capa | Puede importar | No puede importar |
|------|----------------|-------------------|
| `domain` | `app.shared.kernel`, stdlib | `sqlalchemy`, `app.infrastructure`, `app.api` |
| `application` | `domain`, `app.shared` | `app.infrastructure`, `sqlalchemy`, adaptadores concretos |
| `infrastructure` | ORM, SQLAlchemy, repos del módulo | `app.api` |
| `presentation/http` | handlers, bootstrap | lógica SQL directa |

`lint-imports` valida estos contratos (ver `.importlinter`).

### Persistencia

- SQL nuevo → `app/modules/<contexto>/infrastructure/`
- Si se necesita compatibilidad legacy, re-export en `app/infrastructure/repositories/`
- Entidades de dominio + `orm_mappers.py` cuando el handler trabaje con tipos ricos (ver catalog, iam)

### Permisos RBAC

Formato `recurso.accion` (ej. `inventario.recepcionar`). Cadena efectiva:

```
Usuario → usuario_rol → Rol → rol_permiso → Permiso
```

Los cargos pueden heredar roles vía `permiso_cargo` / bootstrap al crear usuarios.

### Frontend

- Rutas bajo `/app/*`
- Registrar permiso en `frontend/src/api/menuConfig.ts` (`ROUTE_PERMISSIONS`)
- Añadir ruta en `frontend/src/App.tsx` con `PermissionRoute` si aplica

## Commits

- Mensajes en español o inglés, imperativo: `fix:`, `refactor:`, `feat:`, `docs:`
- Un propósito por commit cuando sea posible

## Documentación

Al cambiar comportamiento visible o arquitectura, actualizar:

- [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) — usuarios finales
- [ARCHITECTURE.md](./ARCHITECTURE.md) / [CLAUDE.md](../CLAUDE.md) — desarrolladores
- [INDEX.md](./INDEX.md) — si se añaden módulos o rutas

## Alcance fuera del portafolio actual

No implementar sin acuerdo explícito:

- Recuperación de contraseña por email
- Notificaciones en tiempo real / WebSocket de inventario
- Dashboard de inventario (eliminado; usar Stock y Movimientos)
