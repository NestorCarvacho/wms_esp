"""Repositorio de tickets de soporte."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import (
    Empresa,
    EstadoTicket,
    PerfilUsuario,
    Ticket,
    TicketMensaje,
    TipoSolicitud,
    Usuario,
)
from app.infrastructure.repositories.listado_helpers import aplicar_orden, filtro_empresa
from app.shared.locale_formatting import formatear_fecha


def _nombre_persona(nombres: str | None, apellido: str | None, email: str | None) -> str:
    partes = [p.strip() for p in (nombres or "", apellido or "") if p and p.strip()]
    if partes:
        return " ".join(partes)
    return (email or "Usuario").strip()


def _nombre_empresa(fantasia: str | None, razon: str | None) -> str:
    return (fantasia or razon or "Empresa").strip()


def _iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.isoformat()


class TicketCRUDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar_tipos(self) -> list[dict[str, Any]]:
        stmt = (
            select(TipoSolicitud)
            .join(Empresa, TipoSolicitud.empresa_id == Empresa.id)
            .where(TipoSolicitud.activo == True, Empresa.es_empresa_maestra == True)
            .order_by(TipoSolicitud.orden, TipoSolicitud.nombre)
        )
        rows = (await self.session.execute(stmt)).scalars().all()
        return [
            {
                "id": row.id,
                "codigo": row.codigo,
                "nombre": row.nombre,
                "tipo_padre_id": row.tipo_padre_id,
                "orden": row.orden,
            }
            for row in rows
        ]

    async def obtener_tipo_activo(self, tipo_id: int) -> dict[str, Any] | None:
        stmt = (
            select(TipoSolicitud)
            .join(Empresa, TipoSolicitud.empresa_id == Empresa.id)
            .where(
                TipoSolicitud.id == tipo_id,
                TipoSolicitud.activo == True,
                Empresa.es_empresa_maestra == True,
            )
        )
        row = (await self.session.execute(stmt)).scalar_one_or_none()
        if not row:
            return None
        return {"id": row.id, "codigo": row.codigo, "nombre": row.nombre, "tipo_padre_id": row.tipo_padre_id}

    async def tipo_tiene_hijos_activos(self, tipo_id: int) -> bool:
        stmt = select(func.count(TipoSolicitud.id)).where(
            TipoSolicitud.tipo_padre_id == tipo_id,
            TipoSolicitud.activo == True,
        )
        total = (await self.session.execute(stmt)).scalar_one()
        return int(total or 0) > 0

    async def obtener_estado_por_codigo(self, codigo: str) -> dict[str, Any] | None:
        stmt = select(EstadoTicket).where(EstadoTicket.codigo == codigo, EstadoTicket.activo == True)
        row = (await self.session.execute(stmt)).scalar_one_or_none()
        if not row:
            return None
        return {"id": row.id, "codigo": row.codigo, "nombre": row.nombre, "es_abierto": bool(row.es_abierto)}

    async def datos_solicitante(self, usuario_id: int) -> dict[str, Any] | None:
        stmt = (
            select(Usuario, PerfilUsuario, Empresa)
            .outerjoin(PerfilUsuario, PerfilUsuario.usuario_id == Usuario.id)
            .join(Empresa, Empresa.id == Usuario.empresa_id)
            .where(Usuario.id == usuario_id)
        )
        row = (await self.session.execute(stmt)).first()
        if not row:
            return None
        usuario, perfil, empresa = row
        return {
            "empresa_id": usuario.empresa_id,
            "nombre_solicitante": _nombre_persona(
                perfil.nombres if perfil else None,
                perfil.apellido_paterno if perfil else None,
                usuario.email,
            ),
            "nombre_empresa": _nombre_empresa(empresa.nombre_fantasia, empresa.razon_social),
        }

    async def crear(
        self,
        *,
        empresa_id: int,
        usuario_id: int,
        tipo_solicitud_id: int,
        estado_ticket_id: int,
        asunto: str,
        nombre_solicitante: str,
        nombre_empresa: str,
        mensaje: str,
        mensaje_sistema: str,
    ) -> int:
        ahora = datetime.utcnow()
        ticket = Ticket(
            empresa_id=empresa_id,
            usuario_id=usuario_id,
            tipo_solicitud_id=tipo_solicitud_id,
            estado_ticket_id=estado_ticket_id,
            asunto=asunto,
            nombre_solicitante=nombre_solicitante,
            nombre_empresa=nombre_empresa,
            creado_at=ahora,
            actualizado_at=ahora,
        )
        self.session.add(ticket)
        await self.session.flush()
        self.session.add(
            TicketMensaje(
                ticket_id=ticket.id,
                usuario_id=usuario_id,
                es_sistema=False,
                cuerpo=mensaje,
                creado_at=ahora,
            )
        )
        self.session.add(
            TicketMensaje(
                ticket_id=ticket.id,
                usuario_id=None,
                es_sistema=True,
                cuerpo=mensaje_sistema,
                creado_at=ahora,
            )
        )
        await self.session.commit()
        return int(ticket.id)

    async def listar(self, **kwargs: Any) -> tuple[list[dict[str, Any]], int]:
        pagina = max(int(kwargs.get("pagina") or 1), 1)
        por_pagina = min(max(int(kwargs.get("por_pagina") or 10), 1), 100)
        es_mesa = bool(kwargs.get("es_mesa"))
        empresa_id = int(kwargs["empresa_id"])
        usuario_id = int(kwargs["usuario_id"])

        ultimo = (
            select(
                TicketMensaje.ticket_id.label("ticket_id"),
                func.max(TicketMensaje.id).label("mensaje_id"),
            )
            .group_by(TicketMensaje.ticket_id)
            .subquery()
        )

        stmt = (
            select(Ticket, EstadoTicket, TipoSolicitud, TicketMensaje.cuerpo)
            .join(EstadoTicket, EstadoTicket.id == Ticket.estado_ticket_id)
            .join(TipoSolicitud, TipoSolicitud.id == Ticket.tipo_solicitud_id)
            .outerjoin(ultimo, ultimo.c.ticket_id == Ticket.id)
            .outerjoin(TicketMensaje, TicketMensaje.id == ultimo.c.mensaje_id)
        )
        count_stmt = (
            select(func.count(Ticket.id))
            .join(EstadoTicket, EstadoTicket.id == Ticket.estado_ticket_id)
            .join(TipoSolicitud, TipoSolicitud.id == Ticket.tipo_solicitud_id)
        )

        if es_mesa:
            empresa_cond = filtro_empresa(
                Ticket,
                empresa_id,
                True,
                kwargs.get("empresa_id_filtro"),
                kwargs.get("empresas_scope_ids"),
            )
            if empresa_cond is None:
                empresa_cond = Ticket.empresa_id == empresa_id
        else:
            empresa_cond = and_(Ticket.empresa_id == empresa_id, Ticket.usuario_id == usuario_id)

        if empresa_cond is not None:
            stmt = stmt.where(empresa_cond)
            count_stmt = count_stmt.where(empresa_cond)

        es_abierto = kwargs.get("es_abierto")
        if es_abierto is not None:
            stmt = stmt.where(EstadoTicket.es_abierto == bool(es_abierto))
            count_stmt = count_stmt.where(EstadoTicket.es_abierto == bool(es_abierto))

        buscar = (kwargs.get("buscar") or "").strip()
        if buscar:
            pattern = f"%{buscar}%"
            buscar_cond = or_(
                Ticket.asunto.like(pattern),
                Ticket.nombre_solicitante.like(pattern),
                Ticket.nombre_empresa.like(pattern),
                TipoSolicitud.nombre.like(pattern),
            )
            stmt = stmt.where(buscar_cond)
            count_stmt = count_stmt.where(buscar_cond)

        stmt = aplicar_orden(
            stmt,
            columnas={
                "id": Ticket.id,
                "asunto": Ticket.asunto,
                "creado_at": Ticket.creado_at,
                "nombre_solicitante": Ticket.nombre_solicitante,
                "nombre_empresa": Ticket.nombre_empresa,
            },
            ordenar_por=kwargs.get("ordenar_por"),
            orden=kwargs.get("orden"),
            default=Ticket.creado_at,
            default_orden="desc",
        )
        stmt = stmt.offset((pagina - 1) * por_pagina).limit(por_pagina)

        total = int((await self.session.execute(count_stmt)).scalar_one() or 0)
        rows = (await self.session.execute(stmt)).all()
        items = [
            self._serializar_lista(ticket, estado, tipo, ultimo_mensaje)
            for ticket, estado, tipo, ultimo_mensaje in rows
        ]
        return items, total

    async def obtener(self, ticket_id: int) -> dict[str, Any] | None:
        stmt = (
            select(Ticket, EstadoTicket, TipoSolicitud)
            .join(EstadoTicket, EstadoTicket.id == Ticket.estado_ticket_id)
            .join(TipoSolicitud, TipoSolicitud.id == Ticket.tipo_solicitud_id)
            .where(Ticket.id == ticket_id)
        )
        row = (await self.session.execute(stmt)).first()
        if not row:
            return None
        ticket, estado, tipo = row
        mensajes = await self._mensajes(ticket.id)
        data = self._serializar_lista(ticket, estado, tipo, mensajes[-1]["cuerpo"] if mensajes else None)
        data["mensajes"] = mensajes
        return data

    async def agregar_mensaje(
        self,
        ticket_id: int,
        cuerpo: str,
        usuario_id: int | None = None,
        es_sistema: bool = False,
    ) -> None:
        ahora = datetime.utcnow()
        self.session.add(
            TicketMensaje(
                ticket_id=ticket_id,
                usuario_id=usuario_id,
                es_sistema=es_sistema,
                cuerpo=cuerpo,
                creado_at=ahora,
            )
        )
        ticket = await self.session.get(Ticket, ticket_id)
        if ticket:
            ticket.actualizado_at = ahora
        await self.session.commit()

    async def cambiar_estado(self, ticket_id: int, estado_ticket_id: int, cerrado: bool) -> None:
        ticket = await self.session.get(Ticket, ticket_id)
        if not ticket:
            return
        ticket.estado_ticket_id = estado_ticket_id
        ticket.actualizado_at = datetime.utcnow()
        ticket.cerrado_at = datetime.utcnow() if cerrado else None
        await self.session.commit()

    async def tomar(self, ticket_id: int, usuario_id: int) -> None:
        ticket = await self.session.get(Ticket, ticket_id)
        if not ticket:
            return
        ticket.asignado_usuario_id = usuario_id
        ticket.actualizado_at = datetime.utcnow()
        await self.session.commit()

    async def _mensajes(self, ticket_id: int) -> list[dict[str, Any]]:
        stmt = (
            select(TicketMensaje, Usuario.email, PerfilUsuario.nombres, PerfilUsuario.apellido_paterno)
            .outerjoin(Usuario, Usuario.id == TicketMensaje.usuario_id)
            .outerjoin(PerfilUsuario, PerfilUsuario.usuario_id == TicketMensaje.usuario_id)
            .where(TicketMensaje.ticket_id == ticket_id)
            .order_by(TicketMensaje.creado_at.asc(), TicketMensaje.id.asc())
        )
        rows = (await self.session.execute(stmt)).all()
        mensajes = []
        for mensaje, email, nombres, apellido in rows:
            if mensaje.es_sistema:
                autor = "Sistema"
            else:
                autor = _nombre_persona(nombres, apellido, email)
            mensajes.append(
                {
                    "id": mensaje.id,
                    "usuario_id": mensaje.usuario_id,
                    "es_sistema": bool(mensaje.es_sistema),
                    "autor_nombre": autor,
                    "cuerpo": mensaje.cuerpo,
                    "creado_at": _iso(mensaje.creado_at),
                    "creado_at_local": formatear_fecha(mensaje.creado_at),
                }
            )
        return mensajes

    def _serializar_lista(
        self,
        ticket: Ticket,
        estado: EstadoTicket,
        tipo: TipoSolicitud,
        ultimo_mensaje: str | None,
    ) -> dict[str, Any]:
        return {
            "id": ticket.id,
            "empresa_id": ticket.empresa_id,
            "usuario_id": ticket.usuario_id,
            "nombre_solicitante": ticket.nombre_solicitante,
            "nombre_empresa": ticket.nombre_empresa,
            "tipo_solicitud_id": ticket.tipo_solicitud_id,
            "tipo_solicitud_nombre": tipo.nombre,
            "estado_ticket_id": ticket.estado_ticket_id,
            "estado_codigo": estado.codigo,
            "estado_nombre": estado.nombre,
            "es_abierto": bool(estado.es_abierto),
            "asunto": ticket.asunto,
            "asignado_usuario_id": ticket.asignado_usuario_id,
            "creado_at": _iso(ticket.creado_at),
            "creado_at_local": formatear_fecha(ticket.creado_at),
            "actualizado_at": _iso(ticket.actualizado_at),
            "cerrado_at": _iso(ticket.cerrado_at),
            "ultimo_mensaje": ultimo_mensaje,
        }
