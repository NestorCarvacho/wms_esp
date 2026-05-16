"""
Configuración de la conexión a base de datos y sesiones SQLAlchemy.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import DATABASE_URL

# Motor asincrónico
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Cambiar a True para debug SQL
    poolclass=NullPool,  # Para conexiones de corta duración
    pool_pre_ping=True
)

# Factory de sesiones asincrónicas
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db_session():
    """
    Inyecta sesión de BD en endpoints.
    Uso en FastAPI con Depends(get_db_session)
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
