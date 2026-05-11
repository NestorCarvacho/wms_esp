"""
Configuración de la aplicación. Variables de entorno y constantes globales.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Base de Datos
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:password@localhost:3306/wms_esp")

# JWT y Seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "tu-clave-secreta-super-fuerte-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Aplicación
APP_NAME = "WMS Multi-Tenant"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Empresa Maestra (SaaS-CORE)
EMPRESA_MAESTRA_ID = 1
