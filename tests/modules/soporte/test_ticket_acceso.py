"""Aislamiento de tickets: empresa hija vs mesa de ayuda."""
from app.modules.soporte.domain.acceso import puede_ver_ticket


def test_hijo_solo_ve_sus_tickets():
    assert puede_ver_ticket(
        ticket_usuario_id=10,
        ticket_empresa_id=2,
        usuario_id=10,
        empresa_id=2,
        es_empresa_maestra=False,
        puede_gestionar=False,
        empresas_scope_ids=None,
    )
    assert not puede_ver_ticket(
        ticket_usuario_id=11,
        ticket_empresa_id=2,
        usuario_id=10,
        empresa_id=2,
        es_empresa_maestra=False,
        puede_gestionar=False,
        empresas_scope_ids=None,
    )
    assert not puede_ver_ticket(
        ticket_usuario_id=10,
        ticket_empresa_id=3,
        usuario_id=10,
        empresa_id=2,
        es_empresa_maestra=False,
        puede_gestionar=True,
        empresas_scope_ids=None,
    )


def test_mesa_ve_empresas_administradas():
    assert puede_ver_ticket(
        ticket_usuario_id=10,
        ticket_empresa_id=2,
        usuario_id=1,
        empresa_id=1,
        es_empresa_maestra=True,
        puede_gestionar=True,
        empresas_scope_ids=[1, 2],
    )
    assert not puede_ver_ticket(
        ticket_usuario_id=10,
        ticket_empresa_id=9,
        usuario_id=1,
        empresa_id=1,
        es_empresa_maestra=True,
        puede_gestionar=True,
        empresas_scope_ids=[1, 2],
    )


def test_maestra_sin_gestionar_no_ve_tickets_ajenos():
    assert not puede_ver_ticket(
        ticket_usuario_id=10,
        ticket_empresa_id=2,
        usuario_id=1,
        empresa_id=1,
        es_empresa_maestra=True,
        puede_gestionar=False,
        empresas_scope_ids=[1, 2],
    )
