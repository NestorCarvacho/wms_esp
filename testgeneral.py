#test poara saber de doinde ocurre el error "detail": "Error interno: 'nombre_completo'"

import asyncio
import tracemalloc
from unittest.mock import AsyncMock, MagicMock
from app.core.security import hash_password
from app.domain.services.auth_service import AuthService
from app.infrastructure.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.models.usuario import Usuario # Asegúrate de importar tu modelo

tracemalloc.start()

async def test_login():
    print("Iniciando prueba de login con Mock...")

    # evitar "Error inesperado: TypeError - AuthService.login() takes 3 positional arguments but 4 were given"

    #base para usuario
    # id = Column(BigInteger, primary_key=True, index=True)
    # empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    # cargo_id = Column(BigInteger, ForeignKey("cargo.id"), nullable=True)
    # email = Column(String(255), unique=True, nullable=False, index=True)
    # password_hash = Column(String(255), nullable=False)
    # nombre_completo = Column(String(255), nullable=True)
    # rut = Column(String(20), nullable=True, index=True)
    # esta_activo = Column(Boolean, default=True)
    # activo = Column(Boolean, default=True)
    # fecha_creacion = Column(DateTime, default=datetime.utcnow)
    # ultimo_login = Column(DateTime, nullable=True)
    # fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # # Relaciones
    # empresa = relationship("Empresa", back_populates="usuarios")

    # 1. Creamos un "Usuario" falso que represente lo que hay en tu BD
    usuario_falso = MagicMock(spec=Usuario)
    usuario_falso.id = 1
    usuario_falso.cargo_id = 1
    usuario_falso.email = "tu_usuario@wms.com"
    usuario_falso.empresa_id = 1
    usuario_falso.nombre_completo = "Usuario de Prueba"
    usuario_falso.rut = "12.345.678-9"
    usuario_falso.esta_activo = True
    usuario_falso.fecha_creacion = "2026-01-01"
    usuario_falso.activo = True
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
    
    # "usuario_id": usuario.id,
            # "empresa_id": usuario.empresa_id,
            # "email": usuario.email,
            # "cargo_id": usuario.cargo_id


    email = "tu_usuario@wms.com"
    contrasena = "Test1234"
    
    try:
        # Ahora sí funcionará porque el repo no intentará usar 'execute' en None
        print(f"Intentando login con email: {email}, contraseña: {contrasena}")
        # MagicMock no tiene el método 'execute', pero como no lo llamamos directamente, no causará error. El método 'obtener_por_email' devolverá nuestro 'usuario_falso'.

        resultado = await auth_service.login(email, contrasena)
        print("\n✅ Login exitoso!")
        # print("Resultado del login:", resultado)
        print("Hash de la contraseña:", hash_password("Test1234"))

    except ValueError as e:
        print("\n❌ Error de autenticación esperado:", str(e))
    except Exception as e:
        print(f"\n🔥 Error inesperado: {type(e).__name__} - {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_login())



# este es el metodo login del auth_service.py
# para tenerlo de ejemplo y no olvidar que el error no es por el repo, sino por el intento de serializar el resultado del login (que incluye un MagicMock) a JSON. Esto ocurre porque el método 'login' devuelve un diccionario que contiene el usuario (que es un MagicMock) y el token (que es una cadena). Cuando FastAPI intenta convertir esto a JSON para la respuesta, falla porque no puede serializar el MagicMock.
# async def login(
#                 self,
#                 email: str,
#                 contrasena: str
#             ) -> Dict[str, Any]:
#         """
#         Autentica un usuario y genera token JWT.
        
#         Args:
#             email: Email del usuario
#             contrasena: Contraseña en texto plano
#             empresa_id: ID de la empresa (multi-tenant)
            
#         Returns:
#             Dict con acceso_token, token_type y datos del usuario
            
#         Raises:
#             ValueError: Si el usuario no existe, está inactivo o contraseña es incorrecta
#         """
#         # 1. Buscar usuario por email y empresa (multi-tenant)
#         usuario = await self.repository.obtener_por_email(email)
#         if not usuario:
#             raise ValueError("Usuario no encontrado")
        
#         # 2. Validar que el usuario esté activo
#         if not usuario.esta_activo:
#             raise ValueError("Usuario inactivo")
        
#         # 3. Verificar contraseña
#         if not verify_password(contrasena, usuario.password_hash):
#             raise ValueError("Contraseña incorrecta")
        
#         # 4. Actualizar último login
#         usuario.ultimo_login = datetime.utcnow()
#         await self.repository.actualizar(usuario)
        
#         # 5. Generar token JWT con claims de la empresa
#         token_data = {
#             "usuario_id": usuario.id,
#             "empresa_id": usuario.empresa_id,
#             "email": usuario.email,
#             "cargo_id": usuario.cargo_id
#         }
#         access_token = create_access_token(data=token_data)
        
#         # 6. Construir respuesta con DTO
#         usuario_dto = UsuarioRespuestaDTO.from_orm(usuario)
        
#         return {
#             "acceso_token": access_token,
#             "token_type": "bearer",
#             "usuario": usuario_dto
#         }