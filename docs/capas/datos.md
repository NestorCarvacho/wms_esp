# Capa de Acceso a Datos (Data Access / Repositories)

## Responsabilidades
- Ejecutar consultas SQL (CRUD).
- Mapear registros de la DB a objetos del lenguaje (Entidades).
- Llamar a Stored Procedures para procesos masivos de gran magnitud.

## Reglas de Implementación
- **Filtro Automático:** Inyectar `WHERE empresa_id = @eid` en cada consulta de lectura.
- **Auditoría Silenciosa:** El repositorio debe encargarse de setear la fecha de actualización y el ID del usuario que realiza la acción.
- **Rendimiento:** Usar carga diferida (Lazy Loading) o inmediata (Eager Loading) según la complejidad del dashboard solicitado.