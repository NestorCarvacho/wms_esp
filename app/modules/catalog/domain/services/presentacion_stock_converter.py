"""Re-export de compatibilidad — lógica movida al módulo hexagonal."""
from app.modules.inventory.domain.services.presentacion_converter import PresentacionConverter

InventarioPresentacionService = PresentacionConverter

__all__ = ["InventarioPresentacionService", "PresentacionConverter"]
