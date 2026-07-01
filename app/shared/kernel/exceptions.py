"""Excepciones de dominio compartidas."""


class DomainError(Exception):
    """Error de regla de negocio (400)."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message
