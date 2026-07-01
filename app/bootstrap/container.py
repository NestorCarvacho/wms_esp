"""Composition root — inyección de dependencias por módulo."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.iam.application.handlers.cambiar_contrasena_handler import CambiarContrasenaHandler
from app.modules.iam.application.handlers.login_handler import LoginHandler
from app.modules.iam.application.handlers.restablecer_contrasena_handler import (
    RestablecerContrasenaHandler,
)
from app.modules.iam.application.handlers.resolver_permisos_handler import (
    ResolverPermisosUsuarioQueryHandler,
)
from app.modules.iam.application.handlers.solicitar_recuperacion_handler import (
    SolicitarRecuperacionContrasenaHandler,
)
from app.modules.iam.application.handlers.validar_token_handler import ValidarTokenQueryHandler
from app.modules.iam.infrastructure.security_adapters import (
    BcryptPasswordHasher,
    JwtTokenIssuer,
    ResendEmailNotifier,
)
from app.modules.iam.infrastructure.sqlalchemy_repositories import (
    SqlAlchemyAutorizacionRepository,
    SqlAlchemyUsuarioAuthRepository,
)
from app.modules.iam.infrastructure.unit_of_work import SqlAlchemyAuthUnitOfWork
from app.modules.inventory.application.handlers.config_handlers import (
    ActualizarConfigBodegaHandler,
    ObtenerConfigBodegaHandler,
)
from app.modules.inventory.application.handlers.despachar_handler import DespacharHandler
from app.modules.inventory.application.handlers.query_handlers import (
    DashboardHandler,
    ListarMovimientosHandler,
    ListarStockHandler,
)
from app.modules.inventory.application.handlers.recepcionar_handler import RecepcionarHandler
from app.modules.inventory.application.handlers.trasladar_handler import TrasladarHandler
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter
from app.modules.inventory.infrastructure.sqlalchemy_repository import SqlAlchemyInventarioRepository
from app.modules.inventory.infrastructure.unit_of_work import SqlAlchemyInventoryUnitOfWork
from app.modules.inventory.infrastructure.ws_event_publisher import WebSocketEventPublisher


@dataclass
class IamHandlers:
    login: LoginHandler
    solicitar_recuperacion: SolicitarRecuperacionContrasenaHandler
    restablecer_contrasena: RestablecerContrasenaHandler
    cambiar_contrasena: CambiarContrasenaHandler
    validar_token: ValidarTokenQueryHandler
    resolver_permisos: ResolverPermisosUsuarioQueryHandler


def build_iam_handlers(session: AsyncSession) -> IamHandlers:
    uow = SqlAlchemyAuthUnitOfWork(session)
    usuarios = SqlAlchemyUsuarioAuthRepository(session)
    autorizacion = SqlAlchemyAutorizacionRepository(session)
    token_issuer = JwtTokenIssuer()
    password_hasher = BcryptPasswordHasher()
    email_notifier = ResendEmailNotifier()

    return IamHandlers(
        login=LoginHandler(usuarios, autorizacion, token_issuer, password_hasher),
        solicitar_recuperacion=SolicitarRecuperacionContrasenaHandler(uow, email_notifier),
        restablecer_contrasena=RestablecerContrasenaHandler(
            usuarios, uow.reset, password_hasher
        ),
        cambiar_contrasena=CambiarContrasenaHandler(usuarios, password_hasher),
        validar_token=ValidarTokenQueryHandler(usuarios),
        resolver_permisos=ResolverPermisosUsuarioQueryHandler(autorizacion),
    )


@dataclass
class InventoryHandlers:
    recepcionar: RecepcionarHandler
    trasladar: TrasladarHandler
    despachar: DespacharHandler
    listar_stock: ListarStockHandler
    listar_movimientos: ListarMovimientosHandler
    dashboard: DashboardHandler
    obtener_config_bodega: ObtenerConfigBodegaHandler
    actualizar_config_bodega: ActualizarConfigBodegaHandler


def build_inventory_handlers(session: AsyncSession) -> InventoryHandlers:
    """Factory por request (scoped a la sesión DB)."""
    uow = SqlAlchemyInventoryUnitOfWork(session)
    repo = SqlAlchemyInventarioRepository(session)
    events = WebSocketEventPublisher()
    conversion = PresentacionConverter()

    return InventoryHandlers(
        recepcionar=RecepcionarHandler(uow, events, conversion),
        trasladar=TrasladarHandler(uow, events, conversion),
        despachar=DespacharHandler(uow, events, conversion),
        listar_stock=ListarStockHandler(repo),
        listar_movimientos=ListarMovimientosHandler(repo),
        dashboard=DashboardHandler(repo),
        obtener_config_bodega=ObtenerConfigBodegaHandler(repo),
        actualizar_config_bodega=ActualizarConfigBodegaHandler(uow),
    )
