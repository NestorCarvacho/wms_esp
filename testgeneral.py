#test poara saber de doinde ocurre el error "detail": "Error interno: 'nombre_completo'"

import asyncio
import tracemalloc
from unittest.mock import AsyncMock, MagicMock
from app.domain.services.auth_service import AuthService
from app.infrastructure.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.models.usuario import Usuario # Asegúrate de importar tu modelo

tracemalloc.start()

async def test_login():
    print("Iniciando prueba de login con Mock...")

    # 1. Creamos un "Usuario" falso que represente lo que hay en tu BD
    usuario_falso = MagicMock(spec=Usuario)
    usuario_falso.id = 1
    usuario_falso.email = "tu_usuario@wms.com"
    usuario_falso.empresa_id = 1
    usuario_falso.nombre_completo = "Usuario de Prueba"
    usuario_falso.rut = "12.345.678-9"
    usuario_falso.esta_activo = True
    usuario_falso.fecha_creacion = "2026-01-01"
    # IMPORTANTE: Este hash debe ser válido para la contraseña "Test1234"
    # Si usas passlib, puedes generar uno real aquí para la prueba
    from app.core.security import hash_password
    usuario_falso.password_hash = hash_password("Test1234")

    # 2. Creamos un Repositorio falso (Mock)
    # En lugar de session=None, simulamos el método que busca al usuario
    usuario_repository = MagicMock(spec=UsuarioRepository)
    usuario_repository.obtener_por_email = AsyncMock(return_value=usuario_falso)

    # 3. Instanciamos el servicio con nuestro repo falso
    auth_service = AuthService(usuario_repository)
    
    email = "tu_usuario@wms.com"
    contrasena = "Test1234"
    empresa_id = 1
    
    try:
        # Ahora sí funcionará porque el repo no intentará usar 'execute' en None
        resultado = await auth_service.login(email, contrasena, empresa_id)
        print("\n✅ Login exitoso!")
        print(f"Token generado: {resultado['access_token'][:50]}...")
        print(f"Usuario: {resultado['usuario'].nombre_completo}")
        
    except ValueError as e:
        print("\n❌ Error de autenticación esperado:", str(e))
    except Exception as e:
        print(f"\n🔥 Error inesperado: {type(e).__name__} - {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_login())