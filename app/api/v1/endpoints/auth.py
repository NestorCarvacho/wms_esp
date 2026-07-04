"""
Endpoints de Autenticación (Capa de Presentación).
Login y cambio de contraseña autenticado.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.bootstrap.container import IamHandlers
from app.modules.iam.application.commands import CambiarContrasenaCommand, LoginCommand
from app.modules.iam.application.commands_rbac import CrearUsuarioCommand
from app.modules.iam.presentation.http.dependencies import obtener_iam_handlers
from app.schemas.usuario import (
    LoginRequestDTO,
    RespuestaAPIDTO,
    UsuarioCrearDTO,
    ChangePasswordDTO,
)
from app.api.v1.dependencies import obtener_empresa_id, obtener_id
from app.shared.presentation.result_http import unwrap_result

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticación"],
)


@router.post("/login", response_model=RespuestaAPIDTO)
async def login(
    credenciales: LoginRequestDTO,
    handlers: IamHandlers = Depends(obtener_iam_handlers),
):
    try:
        resultado = unwrap_result(
            await handlers.login.handle(
                LoginCommand(email=credenciales.email, contrasena=credenciales.contrasena)
            ),
            use_unauthorized=True,
        )
        return RespuestaAPIDTO(
            exito=True,
            datos={
                "acceso_token": resultado["acceso_token"],
                "token_type": resultado["token_type"],
                "usuario": resultado["usuario"],
            },
            mensaje="Login exitoso",
        ).model_dump()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}",
        )


@router.post("/cambiar-contrasena", response_model=RespuestaAPIDTO)
async def cambiar_contrasena(
    dto: ChangePasswordDTO,
    usuario_id: int = Depends(obtener_id),
    empresa_id: int = Depends(obtener_empresa_id),
    handlers: IamHandlers = Depends(obtener_iam_handlers),
):
    try:
        unwrap_result(
            await handlers.cambiar_contrasena.handle(
                CambiarContrasenaCommand(
                    usuario_id=usuario_id,
                    empresa_id=empresa_id,
                    contrasena_actual=dto.contrasena_actual,
                    contrasena_nueva=dto.contrasena_nueva,
                )
            )
        )
        return RespuestaAPIDTO(
            exito=True,
            mensaje="Contraseña cambiada correctamente.",
        ).model_dump()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}",
        )


@router.post("/registrar", response_model=RespuestaAPIDTO, status_code=201)
async def registrar(
    datos_usuario: UsuarioCrearDTO,
    empresa_id: int = Depends(obtener_empresa_id),
    handlers: IamHandlers = Depends(obtener_iam_handlers),
) -> dict:
    try:
        resultado = await handlers.crear_usuario.handle(
            CrearUsuarioCommand(
                empresa_id=empresa_id,
                email=datos_usuario.email,
                contrasena=datos_usuario.contrasena,
                cargo_id=datos_usuario.cargo_id,
            )
        )
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Usuario registrado exitosamente",
        ).dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}",
        )
