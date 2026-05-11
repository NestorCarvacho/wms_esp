# Capa de Seguridad (Identity & Infrastructure)

## Responsabilidades
- Gestión de ciclo de vida del JWT.
- Cifrado de contraseñas (BCrypt o Argon2).
- Middleware de autorización basado en roles.

## Implementación de Roles
- Al loguearse, se deben aplanar los roles del cargo en el token:
  `claims: { roles: ["admin", "operario"] }`.
- **Empresa Maestra:** El sistema debe identificar si el `empresa_id` corresponde a la empresa de administración (SaaS-CORE) para permitir la creación de nuevos tenants (empresas).

## Infraestructura
- Manejo de excepciones global (Middleware de errores).
- Configuración de la cadena de conexión a MySQL.