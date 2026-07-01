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

# Email (Resend) — https://resend.com/
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
# Sandbox Resend (sin dominio propio): onboarding@resend.dev
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
# True = no envía correo; imprime el enlace en la consola del backend (ideal en local)
_email_dev_log = os.getenv("EMAIL_DEV_LOG_ONLY")
EMAIL_DEV_LOG_ONLY = DEBUG if _email_dev_log is None else _email_dev_log.lower() == "true"

# Políticas de autenticación
LOGIN_MAX_ATTEMPTS = int(os.getenv("LOGIN_MAX_ATTEMPTS", "3"))
LOGIN_LOCKOUT_MINUTES = int(os.getenv("LOGIN_LOCKOUT_MINUTES", "15"))
PASSWORD_RESET_EXPIRE_MINUTES = int(os.getenv("PASSWORD_RESET_EXPIRE_MINUTES", "10"))
# Anti-abuso: no reenviar al mismo usuario antes de X min; límite por IP
PASSWORD_RESET_COOLDOWN_MINUTES = int(os.getenv("PASSWORD_RESET_COOLDOWN_MINUTES", "5"))
PASSWORD_RESET_IP_LIMIT = int(os.getenv("PASSWORD_RESET_IP_LIMIT", "5"))
PASSWORD_RESET_IP_WINDOW_MINUTES = int(os.getenv("PASSWORD_RESET_IP_WINDOW_MINUTES", "15"))

# Notificaciones — local (monolito) | remote (Redis → notification-service)
NOTIFICATIONS_MODE = os.getenv("NOTIFICATIONS_MODE", "local").lower()
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
STOCK_EVENTS_CHANNEL = os.getenv("STOCK_EVENTS_CHANNEL", "wms:stock-events")
