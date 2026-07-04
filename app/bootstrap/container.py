"""Composition root — inyección de dependencias por módulo."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.iam.application.handlers.bootstrap_handler import ProvisionarRbacEmpresaHandler
from app.modules.iam.application.handlers.catalog_handlers import (
    ActualizarCargoHandler,
    ActualizarPermisoHandler,
    ActualizarRolHandler,
    CrearCargoHandler,
    CrearPermisoHandler,
    CrearRolHandler,
    EliminarCargoHandler,
    EliminarPermisoHandler,
    EliminarRolHandler,
    ListarCargosQueryHandler,
    ListarPermisosQueryHandler,
    ListarRolesQueryHandler,
    ObtenerCargoQueryHandler,
    ObtenerRolQueryHandler,
)
from app.modules.iam.application.handlers.cambiar_contrasena_handler import CambiarContrasenaHandler
from app.modules.iam.application.handlers.perfil_handlers import (
    ActualizarPerfilHandler,
    ObtenerPerfilQueryHandler,
)
from app.modules.iam.application.handlers.permiso_cargo_handlers import (
    ActualizarPermisoCargoHandler,
    CrearPermisoCargoHandler,
    EliminarPermisoCargoHandler,
    ListarPermisosCargoQueryHandler,
)
from app.modules.iam.application.handlers.login_handler import LoginHandler
from app.modules.iam.application.handlers.resolver_permisos_handler import (
    ResolverPermisosUsuarioQueryHandler,
)
from app.modules.iam.application.handlers.rbac_handlers import (
    ListarPermisosRolQueryHandler,
    ListarRolesCargoQueryHandler,
    ListarRolesUsuarioQueryHandler,
    SincronizarPermisosRolHandler,
    SincronizarRolesCargoHandler,
    SincronizarRolesUsuarioHandler,
)
from app.modules.iam.application.handlers.usuario_handlers import (
    ActualizarUsuarioHandler,
    CrearUsuarioHandler,
    DesactivarUsuarioHandler,
    ListarUsuariosQueryHandler,
    ObtenerUsuarioQueryHandler,
    ReactivarUsuarioHandler,
)
from app.modules.iam.infrastructure.security_adapters import (
    BcryptPasswordHasher,
    JwtTokenIssuer,
)
from app.modules.iam.infrastructure.crud_repositories import (
    SqlAlchemyCargoRepository,
    SqlAlchemyEmpresaReadRepository,
    SqlAlchemyPermisoCargoRepository,
    SqlAlchemyPermisoRepository,
    SqlAlchemyRbacBootstrapRepository,
    SqlAlchemyRolPermisoRepository,
    SqlAlchemyRolRepository,
    SqlAlchemyTenantAccessValidator,
    SqlAlchemyUsuarioCrudRepository,
    SqlAlchemyUsuarioRolRepository,
)
from app.modules.iam.infrastructure.perfil_repository import SqlAlchemyPerfilUsuarioRepository
from app.modules.iam.infrastructure.sqlalchemy_repositories import (
    SqlAlchemyAutorizacionRepository,
    SqlAlchemyUsuarioAuthRepository,
)
from app.modules.iam.application.handlers.validar_token_handler import ValidarTokenQueryHandler
from app.modules.inventory.application.handlers.config_handlers import (
    ActualizarConfigBodegaHandler,
    ObtenerConfigBodegaHandler,
)
from app.modules.inventory.application.handlers.despachar_handler import DespacharHandler
from app.modules.inventory.application.handlers.query_handlers import (
    ListarMovimientosHandler,
    ListarStockHandler,
)
from app.modules.inventory.application.handlers.recepcionar_handler import RecepcionarHandler
from app.modules.inventory.application.handlers.serie_handlers import (
    DespacharSerieHandler,
    ListarSeriesProductoQueryHandler,
    RecepcionarSerieHandler,
    TrasladarSerieHandler,
    UbicarSerieQueryHandler,
)
from app.modules.inventory.application.handlers.trasladar_handler import TrasladarHandler
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter
from app.modules.inventory.infrastructure.sqlalchemy_repository import SqlAlchemyInventarioRepository
from app.modules.inventory.infrastructure.serie_producto_service import SerieProductoService
from app.modules.inventory.infrastructure.unit_of_work import SqlAlchemyInventoryUnitOfWork
from app.infrastructure.repositories.inventario_crud_repository import InventarioCRUDRepository
from app.infrastructure.repositories.serie_producto_crud_repository import SerieProductoCRUDRepository


@dataclass
class IamHandlers:
    login: LoginHandler
    cambiar_contrasena: CambiarContrasenaHandler
    validar_token: ValidarTokenQueryHandler
    resolver_permisos: ResolverPermisosUsuarioQueryHandler
    listar_usuarios: ListarUsuariosQueryHandler
    obtener_usuario: ObtenerUsuarioQueryHandler
    crear_usuario: CrearUsuarioHandler
    actualizar_usuario: ActualizarUsuarioHandler
    desactivar_usuario: DesactivarUsuarioHandler
    reactivar_usuario: ReactivarUsuarioHandler
    listar_roles_usuario: ListarRolesUsuarioQueryHandler
    sincronizar_roles_usuario: SincronizarRolesUsuarioHandler
    listar_permisos_rol: ListarPermisosRolQueryHandler
    sincronizar_permisos_rol: SincronizarPermisosRolHandler
    listar_roles_cargo: ListarRolesCargoQueryHandler
    sincronizar_roles_cargo: SincronizarRolesCargoHandler
    listar_roles: ListarRolesQueryHandler
    obtener_rol: ObtenerRolQueryHandler
    crear_rol: CrearRolHandler
    actualizar_rol: ActualizarRolHandler
    eliminar_rol: EliminarRolHandler
    listar_permisos: ListarPermisosQueryHandler
    crear_permiso: CrearPermisoHandler
    actualizar_permiso: ActualizarPermisoHandler
    eliminar_permiso: EliminarPermisoHandler
    listar_cargos: ListarCargosQueryHandler
    obtener_cargo: ObtenerCargoQueryHandler
    crear_cargo: CrearCargoHandler
    actualizar_cargo: ActualizarCargoHandler
    eliminar_cargo: EliminarCargoHandler
    provisionar_rbac: ProvisionarRbacEmpresaHandler
    obtener_perfil: ObtenerPerfilQueryHandler
    actualizar_perfil: ActualizarPerfilHandler
    listar_permisos_cargo: ListarPermisosCargoQueryHandler
    crear_permiso_cargo: CrearPermisoCargoHandler
    actualizar_permiso_cargo: ActualizarPermisoCargoHandler
    eliminar_permiso_cargo: EliminarPermisoCargoHandler


def build_iam_handlers(session: AsyncSession) -> IamHandlers:
    usuarios_auth = SqlAlchemyUsuarioAuthRepository(session)
    usuarios_crud = SqlAlchemyUsuarioCrudRepository(session)
    usuario_rol = SqlAlchemyUsuarioRolRepository(session)
    rol_permiso = SqlAlchemyRolPermisoRepository(session)
    permiso_cargo = SqlAlchemyPermisoCargoRepository(session)
    permiso = SqlAlchemyPermisoRepository(session)
    rol = SqlAlchemyRolRepository(session)
    cargo = SqlAlchemyCargoRepository(session)
    bootstrap = SqlAlchemyRbacBootstrapRepository(session)
    empresas = SqlAlchemyEmpresaReadRepository(session)
    tenant = SqlAlchemyTenantAccessValidator(session)
    autorizacion = SqlAlchemyAutorizacionRepository(session)
    token_issuer = JwtTokenIssuer()
    password_hasher = BcryptPasswordHasher()
    perfiles = SqlAlchemyPerfilUsuarioRepository(session)

    return IamHandlers(
        login=LoginHandler(usuarios_auth, autorizacion, token_issuer, password_hasher),
        cambiar_contrasena=CambiarContrasenaHandler(usuarios_auth, password_hasher),
        validar_token=ValidarTokenQueryHandler(usuarios_auth),
        resolver_permisos=ResolverPermisosUsuarioQueryHandler(autorizacion),
        listar_usuarios=ListarUsuariosQueryHandler(usuarios_crud),
        obtener_usuario=ObtenerUsuarioQueryHandler(usuarios_crud),
        crear_usuario=CrearUsuarioHandler(usuarios_crud, usuario_rol),
        actualizar_usuario=ActualizarUsuarioHandler(usuarios_crud, usuario_rol),
        desactivar_usuario=DesactivarUsuarioHandler(usuarios_crud),
        reactivar_usuario=ReactivarUsuarioHandler(usuarios_crud),
        listar_roles_usuario=ListarRolesUsuarioQueryHandler(usuario_rol),
        sincronizar_roles_usuario=SincronizarRolesUsuarioHandler(usuario_rol),
        listar_permisos_rol=ListarPermisosRolQueryHandler(rol_permiso, tenant),
        sincronizar_permisos_rol=SincronizarPermisosRolHandler(rol_permiso, tenant),
        listar_roles_cargo=ListarRolesCargoQueryHandler(permiso_cargo),
        sincronizar_roles_cargo=SincronizarRolesCargoHandler(permiso_cargo),
        listar_roles=ListarRolesQueryHandler(rol),
        obtener_rol=ObtenerRolQueryHandler(rol),
        crear_rol=CrearRolHandler(rol),
        actualizar_rol=ActualizarRolHandler(rol),
        eliminar_rol=EliminarRolHandler(rol),
        listar_permisos=ListarPermisosQueryHandler(permiso),
        crear_permiso=CrearPermisoHandler(permiso),
        actualizar_permiso=ActualizarPermisoHandler(permiso),
        eliminar_permiso=EliminarPermisoHandler(permiso),
        listar_cargos=ListarCargosQueryHandler(cargo),
        obtener_cargo=ObtenerCargoQueryHandler(cargo),
        crear_cargo=CrearCargoHandler(cargo),
        actualizar_cargo=ActualizarCargoHandler(cargo),
        eliminar_cargo=EliminarCargoHandler(cargo),
        provisionar_rbac=ProvisionarRbacEmpresaHandler(
            bootstrap, empresas, tenant, password_hasher
        ),
        obtener_perfil=ObtenerPerfilQueryHandler(usuarios_crud, perfiles),
        actualizar_perfil=ActualizarPerfilHandler(usuarios_crud, perfiles),
        listar_permisos_cargo=ListarPermisosCargoQueryHandler(permiso_cargo),
        crear_permiso_cargo=CrearPermisoCargoHandler(permiso_cargo),
        actualizar_permiso_cargo=ActualizarPermisoCargoHandler(permiso_cargo),
        eliminar_permiso_cargo=EliminarPermisoCargoHandler(permiso_cargo),
    )


@dataclass
class InventoryHandlers:
    recepcionar: RecepcionarHandler
    trasladar: TrasladarHandler
    despachar: DespacharHandler
    listar_stock: ListarStockHandler
    listar_movimientos: ListarMovimientosHandler
    obtener_config_bodega: ObtenerConfigBodegaHandler
    actualizar_config_bodega: ActualizarConfigBodegaHandler
    recepcionar_serie: RecepcionarSerieHandler
    trasladar_serie: TrasladarSerieHandler
    despachar_serie: DespacharSerieHandler
    ubicar_serie: UbicarSerieQueryHandler
    listar_series_producto: ListarSeriesProductoQueryHandler


def build_inventory_handlers(session: AsyncSession) -> InventoryHandlers:
    """Factory por request (scoped a la sesión DB)."""
    uow = SqlAlchemyInventoryUnitOfWork(session)
    repo = SqlAlchemyInventarioRepository(session)
    conversion = PresentacionConverter()
    series = SerieProductoService(
        SerieProductoCRUDRepository(session),
        InventarioCRUDRepository(session),
    )

    return InventoryHandlers(
        recepcionar=RecepcionarHandler(uow, conversion),
        trasladar=TrasladarHandler(uow, conversion),
        despachar=DespacharHandler(uow, conversion),
        listar_stock=ListarStockHandler(repo),
        listar_movimientos=ListarMovimientosHandler(repo),
        obtener_config_bodega=ObtenerConfigBodegaHandler(repo),
        actualizar_config_bodega=ActualizarConfigBodegaHandler(uow),
        recepcionar_serie=RecepcionarSerieHandler(series),
        trasladar_serie=TrasladarSerieHandler(series),
        despachar_serie=DespacharSerieHandler(series),
        ubicar_serie=UbicarSerieQueryHandler(series),
        listar_series_producto=ListarSeriesProductoQueryHandler(series),
    )
