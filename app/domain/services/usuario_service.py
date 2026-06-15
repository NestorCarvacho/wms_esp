"""

Servicio CRUD de Usuarios (Capa de Negocio).

"""

from typing import Dict, Any

from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository
from app.infrastructure.repositories.usuario_rol_crud_repository import UsuarioRolCRUDRepository

from app.schemas.usuario import UsuarioRespuestaDTO, UsuarioListaDTO

from app.domain.services.display_helpers import format_empresa_nombre



class UsuarioService:

    def __init__(
        self,
        repository: UsuarioCRUDRepository,
        rol_repository: UsuarioRolCRUDRepository | None = None,
    ):
        self.repository = repository
        self.rol_repository = rol_repository

    

    async def listar_usuarios(

        self,

        empresa_id: int,

        pagina: int = 1,

        por_pagina: int = 10,

        es_super_admin: bool = False,

        empresa_id_filtro: int | None = None,

        empresas_scope_ids: list[int] | None = None,

        buscar: str | None = None,

        cargo_id: int | None = None,

        ordenar_por: str | None = None,

        orden: str | None = None,

    ) -> Dict[str, Any]:

        usuarios, total = await self.repository.listar(

            empresa_id=empresa_id,

            pagina=pagina,

            por_pagina=por_pagina,

            solo_activos=True,

            es_super_admin=es_super_admin,

            empresa_id_filtro=empresa_id_filtro,

            empresas_scope_ids=empresas_scope_ids,

            buscar=buscar,

            cargo_id=cargo_id,

            ordenar_por=ordenar_por,

            orden=orden,

        )

        

        usuarios_serializados = []

        for u in usuarios:

            dto = UsuarioListaDTO.model_validate(u)

            data = dto.model_dump()

            data["empresa_nombre"] = format_empresa_nombre(u.empresa)

            data["cargo_nombre"] = u.cargo.nombre if u.cargo else None

            usuarios_serializados.append(data)



        return {

            "total": total,

            "pagina": pagina,

            "por_pagina": por_pagina,

            "usuarios": usuarios_serializados,

        }

    

    async def obtener_usuario(self, usuario_id: int, empresa_id: int = None) -> Dict[str, Any]:

        usuario = await self.repository.obtener_por_id(usuario_id, empresa_id)

        if not usuario:

            raise ValueError("Usuario no encontrado")

        

        usuario_dto = UsuarioRespuestaDTO.model_validate(usuario)

        data = usuario_dto.model_dump()

        data["empresa_nombre"] = usuario.empresa.nombre if usuario.empresa else None

        data["cargo_nombre"] = usuario.cargo.nombre if usuario.cargo else None

        return data

    

    async def crear_usuario(

        self,

        empresa_id: int,

        email: str,

        contrasena: str,

        cargo_id: int = None,

    ) -> Dict[str, Any]:

        usuario_existente = await self.repository.obtener_por_email(email, empresa_id)

        if usuario_existente:

            raise ValueError(f"El email {email} ya está registrado en esta empresa")

        

        nuevo_usuario = await self.repository.crear(

            empresa_id=empresa_id,

            email=email,

            contrasena=contrasena,

            cargo_id=cargo_id,

        )

        if self.rol_repository and cargo_id:
            await self.rol_repository.heredar_roles_desde_cargo(
                nuevo_usuario.id, cargo_id, empresa_id
            )

        

        return {

            "id": nuevo_usuario.id,

            "empresa_id": nuevo_usuario.empresa_id,

            "email": nuevo_usuario.email,

            "cargo_id": nuevo_usuario.cargo_id,

            "activo": nuevo_usuario.activo,

            "fecha_creacion": nuevo_usuario.fecha_creacion

        }

    

    async def actualizar_usuario(

        self,

        usuario_id: int,

        empresa_id: int,

        es_super_admin: bool = False,

        **campos,

    ) -> Dict[str, Any]:

        filtro_empresa = None if es_super_admin else empresa_id

        usuario_actual = await self.repository.obtener_por_id(usuario_id, filtro_empresa)

        if not usuario_actual:

            raise ValueError("Usuario no encontrado")



        target_empresa_id = usuario_actual.empresa_id



        email = campos.get("email")

        if email and email != usuario_actual.email:

            usuario_existente = await self.repository.obtener_por_email(email, target_empresa_id)

            if usuario_existente and usuario_existente.id != usuario_id:

                raise ValueError(f"El email {email} ya está registrado en esta empresa")



        usuario_actualizado = await self.repository.actualizar(

            usuario_id=usuario_id,

            empresa_id=target_empresa_id,

            **campos,

        )

        

        if not usuario_actualizado:

            raise ValueError("Usuario no encontrado")

        nuevo_cargo_id = campos.get("cargo_id")
        if self.rol_repository and nuevo_cargo_id is not None:
            await self.rol_repository.heredar_roles_desde_cargo(
                usuario_id, nuevo_cargo_id, target_empresa_id
            )

        

        return {

            "id": usuario_actualizado.id,

            "empresa_id": usuario_actualizado.empresa_id,

            "email": usuario_actualizado.email,

            "cargo_id": usuario_actualizado.cargo_id,

            "activo": usuario_actualizado.activo,

            "fecha_creacion": usuario_actualizado.fecha_creacion

        }

    

    async def eliminar_usuario(self, usuario_id: int, empresa_id: int) -> Dict[str, Any]:

        resultado = await self.repository.eliminar(usuario_id, empresa_id)

        if not resultado:

            raise ValueError("Usuario no encontrado")

        return {"id": usuario_id, "mensaje": "Usuario desactivado correctamente"}

    

    async def reactivar_usuario(self, usuario_id: int, empresa_id: int) -> Dict[str, Any]:

        usuario_reactivado = await self.repository.reactivar(usuario_id, empresa_id)

        if not usuario_reactivado:

            raise ValueError("Usuario no encontrado")

        return {

            "id": usuario_reactivado.id,

            "email": usuario_reactivado.email,

            "activo": usuario_reactivado.activo,

            "mensaje": "Usuario reactivado correctamente"

        }


