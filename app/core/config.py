"""
Configuración de la aplicación. Variables de entorno y constantes globales.
"""
import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url: str) -> str:
    """Convierte mysql:// (Railway) a mysql+aiomysql:// (SQLAlchemy async)."""
    if url.startswith("mysql://"):
        return f"mysql+aiomysql://{url[len('mysql://'):]}"
    return url


# Base de Datos
DATABASE_URL = _normalize_database_url(
    os.getenv("DATABASE_URL", "mysql+aiomysql://root:password@localhost:3306/wms_esp")
)

# CORS — lista separada por comas (URL pública del frontend en producción)
_cors_raw = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://localhost:8082,http://localhost:8083",
)
CORS_ORIGINS = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]

# JWT y Seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "tu-clave-secreta-super-fuerte-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Aplicación
APP_NAME = os.getenv("APP_NAME", "Khepri Software")
APP_TAGLINE = os.getenv("APP_TAGLINE", "Tu WMS a tu medida")
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Empresa Maestra (SaaS-CORE)
EMPRESA_MAESTRA_ID = 1

# Políticas de autenticación
LOGIN_MAX_ATTEMPTS = int(os.getenv("LOGIN_MAX_ATTEMPTS", "3"))
LOGIN_LOCKOUT_MINUTES = int(os.getenv("LOGIN_LOCKOUT_MINUTES", "15"))
