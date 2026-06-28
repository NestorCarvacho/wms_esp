"""Provisiona permisos y roles estándar en una empresa nueva o existente."""
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.domain.services.empresa_maestra_service import EmpresaMaestraService
from app.infrastructure.repositories.empresa_administrada_repository import EmpresaAdministradaRepository
from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository
from app.infrastructure.repositories.empresa_rbac_bootstrap_repository import EmpresaRbacBootstrapRepository

PLANTILLA_EMPRESA_ID = 1
PASSWORD_ADMIN_DEFAULT = "WmsAdmin1!"


class EmpresaRbacBootstrapService:
    def __init__(
        self,
        repository: EmpresaRbacBootstrapRepository,
        empresa_repository: EmpresaCRUDRepository,
        session: AsyncSession,
    ):
        self.repository = repository
        self.empresa_repository = empresa_repository
        self.session = session

    async def _validar_acceso(self, usuario: dict, empresa_destino_id: int) -> None:
        empresa_caller = usuario.get("empresa_id")
        es_maestra = bool(usuario.get("es_empresa_maestra"))

        if not es_maestra:
            if empresa_destino_id != empresa_caller:
                raise ValueError("No autorizado para provisionar RBAC de esta empresa")
            return

        maestra = EmpresaMaestraService(EmpresaAdministradaRepository(self.session))
        await maestra.validar_acceso(empresa_caller, empresa_destino_id)

    async def provisionar(
        self,
        empresa_destino_id: int,
        usuario: dict | None = None,
        empresa_plantilla_id: int = PLANTILLA_EMPRESA_ID,
        es_super_admin: bool = False,
        empresa_maestra_id: int | None = None,
    ) -> dict[str, Any]:
        if empresa_destino_id == empresa_plantilla_id:
            raise ValueError("La empresa plantilla ya tiene el catálogo RBAC base")

        empresa = await self.empresa_repository.obtener_por_id(empresa_destino_id)
        if not empresa:
            raise ValueError("Empresa no encontrada")

        plantilla = await self.empresa_repository.obtener_por_id(empresa_plantilla_id)
        if not plantilla:
            raise ValueError("Empresa plantilla RBAC no encontrada")

        permisos_plantilla = await self.repository.contar_permisos(empresa_plantilla_id)
        if permisos_plantilla == 0:
            raise ValueError("La empresa plantilla no tiene permisos configurados")

        if usuario is not None and not es_super_admin:
            await self._validar_acceso(usuario, empresa_destino_id)

        if empresa_maestra_id is not None:
            await self.repository.vincular_empresa_administrada(
                empresa_maestra_id, empresa_destino_id
            )

        try:
            permisos_antes = await self.repository.contar_permisos(empresa_destino_id)
            permisos_creados = await self.repository.copiar_permisos(
                empresa_plantilla_id, empresa_destino_id
            )
            await self.session.flush()

            roles_plantilla = await self.repository.listar_roles_activos(empresa_plantilla_id)
            roles_provisionados = 0
            for rol_plantilla in roles_plantilla:
                rol_destino = await self.repository.asegurar_rol(
                    empresa_destino_id,
                    rol_plantilla.nombre,
                    rol_plantilla.descripcion,
                )
                roles_provisionados += 1
                codigos = await self.repository.codigos_permiso_de_rol(rol_plantilla.id)
                permiso_ids = await self.repository.ids_por_codigos(empresa_destino_id, codigos)
                await self.repository.reemplazar_rol_permiso(rol_destino.id, permiso_ids)

            cargos_provisionados = await self._provisionar_cargos(
                empresa_plantilla_id, empresa_destino_id
            )
            usuarios_roles_sincronizados = await self._sincronizar_usuarios_sin_roles(
                empresa_destino_id
            )

            admin_creado = await self._crear_admin_inicial_si_vacia(
                empresa_destino_id, empresa.codigo
            )

            await self.repository.commit()
            permisos_despues = await self.repository.contar_permisos(empresa_destino_id)

            resultado: dict[str, Any] = {
                "empresa_id": empresa_destino_id,
                "empresa_plantilla_id": empresa_plantilla_id,
                "permisos_antes": permisos_antes,
                "permisos_creados": permisos_creados,
                "total_permisos": permisos_despues,
                "roles_provisionados": roles_provisionados,
                "cargos_provisionados": cargos_provisionados,
                "usuarios_roles_sincronizados": usuarios_roles_sincronizados,
                "ya_existia_catalogo": permisos_antes > 0,
            }
            if admin_creado:
                resultado["admin_inicial"] = admin_creado
            return resultado
        except Exception:
            await self.repository.rollback()
            raise

    async def _crear_admin_inicial_si_vacia(
        self, empresa_id: int, codigo_empresa: str
    ) -> dict[str, Any] | None:
        """Crea un usuario Administrador por defecto si la empresa no tiene usuarios."""
        total = await self.repository.contar_usuarios(empresa_id)
        if total > 0:
            return None

        email = f"admin@{codigo_empresa.lower()}.cl"
        password_plain = PASSWORD_ADMIN_DEFAULT
        password_hash = hash_password(password_plain)

        cargo_admin = await self.repository.asegurar_cargo(empresa_id, "Administrador")
        usuario = await self.repository.crear_usuario_admin_inicial(
            empresa_id=empresa_id,
            email=email,
            password_hash=password_hash,
            cargo_id=cargo_admin.id,
        )

        rol_admin = await self.repository.obtener_rol_por_nombre(empresa_id, "Administrador")
        if rol_admin:
            await self.repository.asignar_roles_usuario(usuario.id, [rol_admin.id])

        return {
            "usuario_id": usuario.id,
            "email": email,
            "password_temporal": password_plain,
            "nota": "Cambia esta contraseña al primer inicio de sesión",
        }

    async def _provisionar_cargos(
        self, empresa_plantilla_id: int, empresa_destino_id: int
    ) -> int:
        cargos_plantilla = await self.repository.listar_cargos_activos(empresa_plantilla_id)
        provisionados = 0

        if cargos_plantilla:
            for cargo_plantilla in cargos_plantilla:
                cargo_destino = await self.repository.asegurar_cargo(
                    empresa_destino_id, cargo_plantilla.nombre
                )
                provisionados += 1
                for rol_nombre in await self.repository.nombres_roles_de_cargo(
                    cargo_plantilla.id
                ):
                    rol_destino = await self.repository.obtener_rol_por_nombre(
                        empresa_destino_id, rol_nombre
                    )
                    if rol_destino:
                        await self.repository.asegurar_permiso_cargo(
                            cargo_destino.id, rol_destino.id
                        )
        else:
            cargo_destino = await self.repository.asegurar_cargo(
                empresa_destino_id, "Administrador"
            )
            provisionados = 1
            rol_admin = await self.repository.obtener_rol_por_nombre(
                empresa_destino_id, "Administrador"
            )
            if rol_admin:
                await self.repository.asegurar_permiso_cargo(
                    cargo_destino.id, rol_admin.id
                )

        return provisionados

    async def _sincronizar_usuarios_sin_roles(self, empresa_id: int) -> int:
        sincronizados = 0
        pendientes = await self.repository.usuarios_sin_roles_con_cargo(empresa_id)
        for usuario_id, cargo_id in pendientes:
            rol_ids = await self.repository.roles_de_cargo(cargo_id, empresa_id)
            if not rol_ids:
                rol_admin = await self.repository.obtener_rol_por_nombre(
                    empresa_id, "Administrador"
                )
                if rol_admin:
                    rol_ids = [rol_admin.id]
            if rol_ids:
                await self.repository.asignar_roles_usuario(usuario_id, rol_ids)
                sincronizados += 1
        return sincronizados
