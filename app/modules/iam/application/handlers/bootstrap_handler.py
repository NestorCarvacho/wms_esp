"""Handler: provisionar catálogo RBAC en empresa nueva."""
from __future__ import annotations

from typing import Any

from app.core.security import hash_password
from app.modules.iam.application.commands_catalog import ProvisionarRbacCommand
from app.modules.iam.domain.ports import (
    IEmpresaReadRepository,
    IPasswordHasher,
    IRbacBootstrapRepository,
    ITenantAccessValidator,
)

PASSWORD_ADMIN_DEFAULT = "WmsAdmin1!"


class ProvisionarRbacEmpresaHandler:
    def __init__(
        self,
        bootstrap: IRbacBootstrapRepository,
        empresas: IEmpresaReadRepository,
        tenant: ITenantAccessValidator,
        password_hasher: IPasswordHasher | None = None,
    ):
        self.bootstrap = bootstrap
        self.empresas = empresas
        self.tenant = tenant
        self.password_hasher = password_hasher

    def _hashear(self, password: str) -> str:
        if self.password_hasher:
            return self.password_hasher.hashear(password)
        return hash_password(password)

    async def _validar_acceso(self, usuario: dict, empresa_destino_id: int) -> None:
        empresa_caller = usuario.get("empresa_id")
        es_maestra = bool(usuario.get("es_empresa_maestra"))
        if not es_maestra:
            if empresa_destino_id != empresa_caller:
                raise ValueError("No autorizado para provisionar RBAC de esta empresa")
            return
        await self.tenant.validar_acceso(empresa_caller, empresa_destino_id)

    async def handle(self, cmd: ProvisionarRbacCommand) -> dict[str, Any]:
        if cmd.empresa_destino_id == cmd.empresa_plantilla_id:
            raise ValueError("La empresa plantilla ya tiene el catálogo RBAC base")

        empresa = await self.empresas.obtener_por_id(cmd.empresa_destino_id)
        if not empresa:
            raise ValueError("Empresa no encontrada")

        plantilla = await self.empresas.obtener_por_id(cmd.empresa_plantilla_id)
        if not plantilla:
            raise ValueError("Empresa plantilla RBAC no encontrada")

        if await self.bootstrap.contar_permisos(cmd.empresa_plantilla_id) == 0:
            raise ValueError("La empresa plantilla no tiene permisos configurados")

        if cmd.usuario is not None and not cmd.es_super_admin:
            await self._validar_acceso(cmd.usuario, cmd.empresa_destino_id)

        if cmd.empresa_maestra_id is not None:
            await self.bootstrap.vincular_empresa_administrada(
                cmd.empresa_maestra_id, cmd.empresa_destino_id
            )

        try:
            permisos_antes = await self.bootstrap.contar_permisos(cmd.empresa_destino_id)
            permisos_creados = await self.bootstrap.copiar_permisos(
                cmd.empresa_plantilla_id, cmd.empresa_destino_id
            )
            await self.bootstrap.flush()

            roles_provisionados = 0
            for rol_plantilla in await self.bootstrap.listar_roles_activos(cmd.empresa_plantilla_id):
                rol_destino = await self.bootstrap.asegurar_rol(
                    cmd.empresa_destino_id,
                    rol_plantilla.nombre,
                    rol_plantilla.descripcion,
                )
                roles_provisionados += 1
                codigos = await self.bootstrap.codigos_permiso_de_rol(rol_plantilla.id)
                permiso_ids = await self.bootstrap.ids_por_codigos(cmd.empresa_destino_id, codigos)
                await self.bootstrap.reemplazar_rol_permiso(rol_destino.id, permiso_ids)

            cargos_provisionados = await self._provisionar_cargos(
                cmd.empresa_plantilla_id, cmd.empresa_destino_id
            )
            usuarios_roles_sincronizados = await self._sincronizar_usuarios_sin_roles(
                cmd.empresa_destino_id
            )
            admin_creado = await self._crear_admin_inicial_si_vacia(
                cmd.empresa_destino_id, empresa.codigo
            )

            await self.bootstrap.commit()
            permisos_despues = await self.bootstrap.contar_permisos(cmd.empresa_destino_id)

            resultado: dict[str, Any] = {
                "empresa_id": cmd.empresa_destino_id,
                "empresa_plantilla_id": cmd.empresa_plantilla_id,
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
            await self.bootstrap.rollback()
            raise

    async def _crear_admin_inicial_si_vacia(
        self, empresa_id: int, codigo_empresa: str
    ) -> dict[str, Any] | None:
        if await self.bootstrap.contar_usuarios(empresa_id) > 0:
            return None
        email = f"admin@{codigo_empresa.lower()}.cl"
        password_plain = PASSWORD_ADMIN_DEFAULT
        cargo_admin = await self.bootstrap.asegurar_cargo(empresa_id, "Administrador")
        usuario = await self.bootstrap.crear_usuario_admin_inicial(
            empresa_id=empresa_id,
            email=email,
            password_hash=self._hashear(password_plain),
            cargo_id=cargo_admin.id,
        )
        rol_admin = await self.bootstrap.obtener_rol_por_nombre(empresa_id, "Administrador")
        if rol_admin:
            await self.bootstrap.asignar_roles_usuario(usuario.id, [rol_admin.id])
        return {
            "usuario_id": usuario.id,
            "email": email,
            "password_temporal": password_plain,
            "nota": "Cambia esta contraseña al primer inicio de sesión",
        }

    async def _provisionar_cargos(
        self, empresa_plantilla_id: int, empresa_destino_id: int
    ) -> int:
        cargos_plantilla = await self.bootstrap.listar_cargos_activos(empresa_plantilla_id)
        provisionados = 0
        if cargos_plantilla:
            for cargo_plantilla in cargos_plantilla:
                cargo_destino = await self.bootstrap.asegurar_cargo(
                    empresa_destino_id, cargo_plantilla.nombre
                )
                provisionados += 1
                for rol_nombre in await self.bootstrap.nombres_roles_de_cargo(cargo_plantilla.id):
                    rol_destino = await self.bootstrap.obtener_rol_por_nombre(
                        empresa_destino_id, rol_nombre
                    )
                    if rol_destino:
                        await self.bootstrap.asegurar_permiso_cargo(
                            cargo_destino.id, rol_destino.id
                        )
        else:
            cargo_destino = await self.bootstrap.asegurar_cargo(empresa_destino_id, "Administrador")
            provisionados = 1
            rol_admin = await self.bootstrap.obtener_rol_por_nombre(
                empresa_destino_id, "Administrador"
            )
            if rol_admin:
                await self.bootstrap.asegurar_permiso_cargo(cargo_destino.id, rol_admin.id)
        return provisionados

    async def _sincronizar_usuarios_sin_roles(self, empresa_id: int) -> int:
        sincronizados = 0
        for usuario_id, cargo_id in await self.bootstrap.usuarios_sin_roles_con_cargo(empresa_id):
            rol_ids = await self.bootstrap.roles_de_cargo(cargo_id, empresa_id)
            if not rol_ids:
                rol_admin = await self.bootstrap.obtener_rol_por_nombre(empresa_id, "Administrador")
                if rol_admin:
                    rol_ids = [rol_admin.id]
            if rol_ids:
                await self.bootstrap.asignar_roles_usuario(usuario_id, rol_ids)
                sincronizados += 1
        return sincronizados
