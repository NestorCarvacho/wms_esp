"""Mapeo Result → HTTP."""
from __future__ import annotations

from fastapi import HTTPException, status

from app.shared.kernel.result import Result


def unwrap_result(
    result: Result,
    *,
    bad_request: int = status.HTTP_400_BAD_REQUEST,
    unauthorized: int = status.HTTP_401_UNAUTHORIZED,
    not_found: int = status.HTTP_404_NOT_FOUND,
    use_unauthorized: bool = False,
    use_not_found: bool = False,
):
    if result.ok:
        return result.value
    code = unauthorized if use_unauthorized else (not_found if use_not_found else bad_request)
    raise HTTPException(status_code=code, detail=result.error or "Error")
