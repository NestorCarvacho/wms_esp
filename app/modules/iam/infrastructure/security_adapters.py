"""Adaptadores de infraestructura transversal (JWT, bcrypt)."""
from __future__ import annotations

from typing import Any

from app.core.security import create_access_token, hash_password, verify_password


class JwtTokenIssuer:
    def emitir(self, claims: dict[str, Any]) -> str:
        return create_access_token(data=claims)


class BcryptPasswordHasher:
    def verificar(self, contrasena_plana: str, password_hash: str) -> bool:
        return verify_password(contrasena_plana, password_hash)

    def hashear(self, contrasena: str) -> str:
        return hash_password(contrasena)
