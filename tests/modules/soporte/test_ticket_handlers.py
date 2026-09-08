"""Casos de uso de tickets con repositorio falso."""
import pytest

from app.modules.soporte.application.commands import ActorTicket, CrearTicketCommand
from app.modules.soporte.application.handlers.ticket_handlers import (
    MENSAJE_PROCESADA,
    CrearTicketHandler,
    ObtenerTicketQueryHandler,
)


class RepoFalso:
    def __init__(self):
        self.creado = None

    async def obtener_tipo_activo(self, tipo_id: int):
        if tipo_id == 5:
            return {"id": 5, "codigo": "error_acceso", "nombre": "Acceso", "tipo_padre_id": 2}
        return None

    async def tipo_tiene_hijos_activos(self, tipo_id: int):
        return tipo_id == 2

    async def obtener_estado_por_codigo(self, codigo: str):
        return {"id": 1, "codigo": codigo, "nombre": "En proceso", "es_abierto": True}

    async def datos_solicitante(self, usuario_id: int):
        return {
            "empresa_id": 2,
            "nombre_solicitante": "Ana Pérez",
            "nombre_empresa": "Hija SA",
        }

    async def crear(self, **kwargs):
        self.creado = kwargs
        return 77

    async def obtener(self, ticket_id: int):
        return {
            "id": ticket_id,
            "empresa_id": 2,
            "usuario_id": 10,
            "es_abierto": True,
            "estado_codigo": "en_proceso",
            "mensajes": [
                {"id": 1, "usuario_id": 10, "es_sistema": False, "cuerpo": "falla"},
                {"id": 2, "usuario_id": None, "es_sistema": True, "cuerpo": MENSAJE_PROCESADA},
            ],
        }


def _actor(**overrides):
    base = dict(
        usuario_id=10,
        empresa_id=2,
        es_empresa_maestra=False,
        puede_gestionar=False,
        empresas_scope_ids=None,
        empresa_id_filtro=None,
    )
    base.update(overrides)
    return ActorTicket(**base)


@pytest.mark.asyncio
async def test_crear_ticket_guarda_mensaje_y_aviso_de_sistema():
    repo = RepoFalso()
    handler = CrearTicketHandler(repo)
    datos = await handler.handle(
        CrearTicketCommand(actor=_actor(), tipo_solicitud_id=5, mensaje="No puedo entrar", asunto=None)
    )
    assert repo.creado["empresa_id"] == 2
    assert repo.creado["usuario_id"] == 10
    assert repo.creado["nombre_solicitante"] == "Ana Pérez"
    assert repo.creado["mensaje_sistema"] == MENSAJE_PROCESADA
    assert datos["mensajes"][0]["es_propio"] is True


@pytest.mark.asyncio
async def test_crear_exige_subtipo_si_el_tipo_tiene_hijos():
    repo = RepoFalso()
    handler = CrearTicketHandler(repo)

    async def tipo_padre(_tipo_id: int):
        return {"id": 2, "codigo": "error", "nombre": "Error", "tipo_padre_id": None}

    repo.obtener_tipo_activo = tipo_padre
    with pytest.raises(ValueError, match="subtipo"):
        await handler.handle(
            CrearTicketCommand(actor=_actor(), tipo_solicitud_id=2, mensaje="error", asunto=None)
        )


@pytest.mark.asyncio
async def test_hijo_no_obtiene_ticket_ajeno():
    repo = RepoFalso()
    handler = ObtenerTicketQueryHandler(repo)
    with pytest.raises(ValueError, match="no encontrado"):
        await handler.handle(77, _actor(usuario_id=99))
