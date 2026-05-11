"""
Capa de Seguridad: JWT, BCrypt, Autorización.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.schemas.usuario import TokenPayload

# Contexto de cifrado para contraseñas (BCrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#encriptar contraseña para que no arroje error password cannot be longer than 72 bytes
def hash_password(password: str) -> str:
    """Cifra una contraseña usando BCrypt."""
    password = password.encode('utf-8')[:72]  # Limitar a 72 caracteres para evitar errores de bcrypt
    return pwd_context.hash(password)

#verificar contraseña para que no arroje error password cannot be longer than 72 bytes
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # """Verifica si una contraseña coincide con su versión hasheada."""
    # plain_password = plain_password.encode('utf-8')[:72]
    # return pwd_context.verify(plain_password, hashed_password)
    """Verifica la contraseña manejando el límite de 72 bytes."""
    try:
        # Repetimos el proceso de conversión y truncamiento de bytes
        password_bytes = plain_password.encode('utf-8')[:72]
        return pwd_context.verify(password_bytes, hashed_password)
    except ValueError:
        # Si el hash en la DB está mal formado o hay error de valor
        return False

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Crea un JWT access token.
    
    Args:
        data: Diccionario con claims (id, empresa_id, roles, etc.)
        expires_delta: Duración del token. Si es None, usa el default de config.
    
    Returns:
        Token JWT en formato string.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodifica y valida un JWT access token.
    
    Args:
        token: Token JWT a validar.
    
    Returns:
        Diccionario de claims si es válido, None si expira o no es válido.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload).model_dump()
    except JWTError:
        return None
    except ValidationError:
        return None
