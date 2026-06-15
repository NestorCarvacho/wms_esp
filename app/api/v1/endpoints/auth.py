"""
Endpoints de Autenticación (Capa de Presentación).
Login, registro, refresh token.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.usuario_repository import UsuarioRepository
from app.domain.services.auth_service import AuthService
from app.schemas.usuario import (
    LoginRequestDTO,
    TokenResponseDTO,
    UsuarioRespuestaDTO,
    RespuestaAPIDTO,
    UsuarioCrearDTO,
    ForgotPasswordDTO,
    ResetPasswordDTO,
    ChangePasswordDTO,
)
from app.core.security import decode_access_token
from app.core.config import PASSWORD_RESET_IP_LIMIT, PASSWORD_RESET_IP_WINDOW_MINUTES
from app.core.rate_limit import enforce_rate_limit
from app.api.v1.dependencies import obtener_empresa_id, obtener_usuario_autenticado, obtener_id

#revisar error "detail": "Error interno: 'nombre_completo'"
# TODO: Implementar validación para email único por empresa

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticación"],
    responses={
        400: {
            "description": "Solicitud inválida",
            "content": {
                "application/json": {
                    "example": {
                        "exito": False,
                        "datos": None,
                        "mensaje": "Validación fallida",
                        "errores": ["Campo requerido faltante"]
                    }
                }
            }
        },
        401: {
            "description": "No autorizado - Credenciales inválidas",
            "content": {
                "application/json": {
                    "example": {
                        "exito": False,
                        "datos": None,
                        "mensaje": "email o contraseña incorrectos",
                        "errores": None
                    }
                }
            }
        },
        500: {
            "description": "Error interno del servidor",
            "content": {
                "application/json": {
                    "example": {
                        "exito": False,
                        "datos": None,
                        "mensaje": "Error al procesar la solicitud",
                        "errores": None
                    }
                }
            }
        }
    }
)


# TODO: Implementar dependencia para extraer empresa_id del JWT
async def obtener_empresa_id_del_token(authorization: str = None) -> int:
    """
    Extrae el empresa_id del JWT del header Authorization.
    TEMPORAL: Por ahora devuelve 1. Debe mejorar con middleware.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header requerido"
        )
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_access_token(token)
        if not payload or "empresa_id" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return payload["empresa_id"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"No autorizado: {str(e)}"
        )


@router.post(
    "/login",
    response_model=RespuestaAPIDTO,
    status_code=200,
    summary="Autenticar usuario",
    description="""
    Autentica un usuario con email y contraseña.
    
    **Flujo:**
    1. Valida credenciales en BD (filtrado por empresa)
    2. Genera JWT con claims (id, empresa_id, roles)
    3. Actualiza último_login para auditoría
    4. Retorna token y datos básicos del usuario
    
    **Seguridad:**
    - La contraseña se verifica contra su hash BCrypt
    - El token expira en 30 minutos
    - Cada usuario está limitado a su empresa_id
    """,
    responses={
        200: {
            "description": "Login exitoso",
            "content": {
                "application/json": {
                    "example": {
                        "exito": True,
                        "datos": {
                            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "token_type": "bearer",
                            "usuario": {
                                "id": 1,
                                "empresa_id": 1,
                                "cargo_id": 1,
                                "email": "admin@wmscode.cl",
                                "activo": True,
                                "fecha_creacion": "2026-05-10T12:30:00"
                            }
                        },
                        "mensaje": "Login exitoso",
                        "errores": None
                    }
                }
            }
        }
    }
)
@router.post("/login", response_model=RespuestaAPIDTO)
async def login(
    credenciales: LoginRequestDTO,
    session: AsyncSession = Depends(get_db_session)
):

    try:

        usuario_repo = UsuarioRepository(session)
        auth_service = AuthService(usuario_repo, session)

        resultado = await auth_service.login(
            email=credenciales.email,
            contrasena=credenciales.contrasena
        )

        return RespuestaAPIDTO(
            exito=True,
            datos={
                "acceso_token": resultado["acceso_token"],
                "token_type": resultado["token_type"],
                "usuario": resultado["usuario"],
            },
            mensaje="Login exitoso"
        ).model_dump()

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


@router.post("/olvido-contrasena", response_model=RespuestaAPIDTO)
async def olvido_contrasena(
    dto: ForgotPasswordDTO,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
):
    """Solicita enlace de recuperación (siempre responde igual por seguridad)."""
    enforce_rate_limit(
        request,
        scope="olvido-contrasena",
        max_requests=PASSWORD_RESET_IP_LIMIT,
        window_minutes=PASSWORD_RESET_IP_WINDOW_MINUTES,
    )
    try:
        auth_service = AuthService(UsuarioRepository(session), session)
        await auth_service.solicitar_recuperacion(dto.email)
        return RespuestaAPIDTO(
            exito=True,
            mensaje="Si el email está registrado, recibirá instrucciones en los próximos minutos.",
        ).model_dump()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}",
        )


@router.post("/restablecer-contrasena", response_model=RespuestaAPIDTO)
async def restablecer_contrasena(
    dto: ResetPasswordDTO,
    session: AsyncSession = Depends(get_db_session),
):
    try:
        auth_service = AuthService(UsuarioRepository(session), session)
        await auth_service.restablecer_contrasena(dto.token, dto.contrasena)
        return RespuestaAPIDTO(
            exito=True,
            mensaje="Contraseña actualizada correctamente. Ya puede iniciar sesión.",
        ).model_dump()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
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
    session: AsyncSession = Depends(get_db_session),
):
    try:
        auth_service = AuthService(UsuarioRepository(session), session)
        await auth_service.cambiar_contrasena(
            usuario_id,
            empresa_id,
            dto.contrasena_actual,
            dto.contrasena_nueva,
        )
        return RespuestaAPIDTO(
            exito=True,
            mensaje="Contraseña cambiada correctamente.",
        ).model_dump()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}",
        )


@router.post(
    "/registrar",
    response_model=RespuestaAPIDTO,
    status_code=201,
    summary="Registrar nuevo usuario",
    description="""
    Registra un nuevo usuario en la empresa.
    
    **Validaciones:**
    - email único por empresa (no puede existir otro usuario con el mismo email)
    - Contraseña fuerte: mínimo 8 caracteres, con mayúscula y número
    - Todos los campos requeridos deben estar presentes
    - Email debe tener formato válido
    
    **Datos Generados Automáticamente:**
    - id: auto-incrementado
    - empresa_id: extraído del JWT (no del body)
    - fecha_creacion: timestamp actual
    - activo: true por defecto
    - contraseña: hasheada con BCrypt
    
    **Respuesta (201 Created):**
    - Retorna datos básicos del usuario creado (sin contraseña)
    """,
    responses={
        201: {
            "description": "Usuario registrado exitosamente",
            "content": {
                "application/json": {
                    "example": {
                        "exito": True,
                        "datos": {
                            "id": 3,
                            "empresa_id": 1,
                            "cargo_id": None,
                            "email": "nuevo@empresa.cl",
                            "activo": True,
                            "fecha_creacion": "2026-05-10T14:45:00"
                        },
                        "mensaje": "Usuario registrado exitosamente",
                        "errores": None
                    }
                }
            }
        }
    }
)
async def registrar(
    datos_usuario: UsuarioCrearDTO,
    empresa_id: int = Depends(obtener_empresa_id),
    session: AsyncSession = Depends(get_db_session)
) -> dict:
    """
    Endpoint para registrar un nuevo usuario en la empresa.
    
    **Validaciones:**
    - email único por empresa
    - Contraseña con mínimo 8 caracteres, mayúscula y número
    - Datos requeridos presentes
    """
    try:
        # TODO: Obtener empresa_id del JWT
        # empresa_id = obtener_empresa_id()
        
        usuario_repo = UsuarioRepository(session)
        auth_service = AuthService(usuario_repo, session)
        
        resultado = await auth_service.registrar_usuario(
            email=datos_usuario.email,
            contrasena=datos_usuario.contrasena,
            empresa_id=empresa_id,
            cargo_id=datos_usuario.cargo_id
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje="Usuario registrado exitosamente"
        ).dict()
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )
