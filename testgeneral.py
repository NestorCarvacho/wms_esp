#test poara saber de doinde ocurre el error "detail": "Error interno: 'nombre_completo'"

import argparse
import asyncio
import tracemalloc
from app.core.security import hash_password

tracemalloc.start()

DEFAULT_EMAIL = "nestor.carvacho@wms.com"
DEFAULT_PASSWORD = "Test1234"


def sql_literal(value: str) -> str:
    """Return a MySQL string literal."""
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def escape_for_bash_double_quotes(value: str) -> str:
    """Escape characters that Bash expands inside double quotes."""
    return (
        value
        .replace("\\", "\\\\")
        .replace("$", "\\$")
        .replace("`", "\\`")
        .replace('"', '\\"')
    )


def escape_for_bash_single_quotes(value: str) -> str:
    """Escape a string so it can be wrapped in single quotes in Bash."""
    return "'" + value.replace("'", "'\"'\"'") + "'"


def mostrar_password_hash(contrasena: str, email: str) -> str:
    password_hash = hash_password(contrasena)
    password_hash_hex = password_hash.encode("ascii").hex()
    railway_sql = (
        f"UPDATE usuario SET password_hash = {sql_literal(password_hash)} "
        f"WHERE email = {sql_literal(email)};"
    )
    railway_sql_hex = (
        f"UPDATE usuario SET password_hash = CAST(UNHEX('{password_hash_hex}') AS CHAR) "
        f"WHERE email = {sql_literal(email)};"
    )
    mysql_e_sql = (
        f'UPDATE usuario SET password_hash = "{password_hash}" '
        f'WHERE email = "{email}";'
    )

    print("\n=== Password hash generado ===")
    print("Contrasena plana:", contrasena)
    print("Hash bcrypt:")
    print(password_hash)
    print("Largo del hash:", len(password_hash))

    print("\nValor para pegar en Railway Query/MySQL:")
    print(sql_literal(password_hash))

    print("\nQuery para pegar en Railway Query/MySQL:")
    print(railway_sql)

    print("\nQuery recomendada para Railway usando UNHEX:")
    print(railway_sql_hex)

    print("\nQuery para ejecutar con mysql -e desde Bash/Railway CLI:")
    print(f"mysql -e {escape_for_bash_single_quotes(mysql_e_sql)}")

    print("\nAlternativa para mysql -e con comillas dobles:")
    print(f'mysql -e "{escape_for_bash_double_quotes(railway_sql)}"')

    return password_hash


async def test_login(contrasena: str = DEFAULT_PASSWORD, email: str = DEFAULT_EMAIL):
    print("Login mock deshabilitado: use pytest tests/modules/iam/test_login_handler.py")
    print(f"  email={email!r} contrasena=<redacted>")

def parse_args():
    parser = argparse.ArgumentParser(
        description="Genera un hash bcrypt y muestra formatos seguros para Railway/MySQL."
    )
    parser.add_argument(
        "-p",
        "--password",
        default=DEFAULT_PASSWORD,
        help=f"Contrasena en texto plano. Default: {DEFAULT_PASSWORD}",
    )
    parser.add_argument(
        "-e",
        "--email",
        default=DEFAULT_EMAIL,
        help=f"Email usado para armar el UPDATE. Default: {DEFAULT_EMAIL}",
    )
    parser.add_argument(
        "--probar-login",
        action="store_true",
        help="Ademas ejecuta el test de login con mocks.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    mostrar_password_hash(args.password, args.email)

    if args.probar_login:
        asyncio.run(test_login(args.password, args.email))



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
