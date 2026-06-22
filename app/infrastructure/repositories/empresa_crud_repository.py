"""
Repositorio CRUD de Empresas (Capa de Datos).
CRUD para gestión de empresas multi-tenant.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.infrastructure.models.usuario import Empresa
from app.infrastructure.repositories.listado_helpers import aplicar_orden, condicion_buscar


class EmpresaCRUDRepository:
    """Acceso a datos de empresas con aislamiento multi-tenant."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def listar(
        self,
        pagina: int = 1,
        por_pagina: int = 10,
        solo_activas: bool = False,
        buscar: str | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> tuple[list[Empresa], int]:
        """
        Lista empresas con paginación.
        
        Args:
            pagina: Número de página (desde 1)
            por_pagina: Empresas por página
            solo_activas: Si True, solo devuelve empresas activas
            
        Returns:
            Tupla (lista_empresas, total_empresas)
        """
        try:
            buscar_cond = condicion_buscar(Empresa, buscar, "razon_social", "codigo")

            count_stmt = select(func.count(Empresa.id))
            if solo_activas:
                count_stmt = count_stmt.where(Empresa.esta_activa == True)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)
            total = (await self.session.execute(count_stmt)).scalar() or 0

            stmt_base = select(Empresa)
            if solo_activas:
                stmt_base = stmt_base.where(Empresa.esta_activa == True)
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            stmt_base = aplicar_orden(
                stmt_base,
                columnas={
                    "id": Empresa.id,
                    "razon_social": Empresa.razon_social,
                    "codigo": Empresa.codigo,
                    "activo": Empresa.esta_activa,
                },
                ordenar_por=ordenar_por,
                orden=orden,
                default=Empresa.razon_social,
            )

            offset = (pagina - 1) * por_pagina
            stmt = stmt_base.offset(offset).limit(por_pagina)
            
            result = await self.session.execute(stmt)
            empresas = result.scalars().all()
            return empresas, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar empresas: {str(e)}")
    
    async def obtener_por_id(self, id: int) -> Empresa | None:
        """
        Obtiene una empresa por ID.
        """
        try:
            stmt = select(Empresa).where(Empresa.id == id)
            result = await self.session.execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as e:
            raise Exception(f"Error al obtener empresa: {str(e)}")
    
    async def obtener_por_codigo(self, codigo: str) -> Empresa | None:
        """
        Obtiene una empresa por código.
        """
        try:
            stmt = select(Empresa).where(Empresa.codigo == codigo)
            result = await self.session.execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as e:
            raise Exception(f"Error al obtener empresa por código: {str(e)}")
    
    async def crear(self, codigo: str, razon_social: str, **kwargs) -> Empresa:
        try:
            empresa_existente = await self.obtener_por_codigo(codigo)
            if empresa_existente:
                raise ValueError(f"El código de empresa '{codigo}' ya existe")

            campos_permitidos = {
                "nombre_fantasia", "rut", "giro", "telefono", "correo",
                "sitio_web", "direccion", "region_id", "ciudad_id", "comuna_id"
            }
            extras = {k: v for k, v in kwargs.items() if k in campos_permitidos and v is not None}

            nueva_empresa = Empresa(
                codigo=codigo,
                razon_social=razon_social,
                esta_activa=True,
                creado_at=datetime.utcnow(),
                **extras,
            )
            self.session.add(nueva_empresa)
            await self.session.commit()
            await self.session.refresh(nueva_empresa)
            return nueva_empresa
        except ValueError as ve:
            await self.session.rollback()
            raise ve
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear empresa: {str(e)}")
    
    async def actualizar(self, empresa_id: int, **datos) -> Empresa | None:
        """
        Actualiza una empresa existente.
        
        Args:
            empresa_id: ID de la empresa
            **datos: Campos a actualizar (nombre, rut, esta_activa)
            
        Returns:
            Objeto Empresa actualizado o None si no existe
            
        Raises:
            Exception: Si hay error de base de datos
        """
        try:
            # Validar que la empresa existe
            empresa = await self.obtener_por_id(empresa_id)
            if not empresa:
                raise ValueError("Empresa no encontrada")
            
            campos_validos = {
                "razon_social", "nombre_fantasia", "rut", "giro",
                "telefono", "correo", "sitio_web", "esta_activa",
                "direccion", "region_id", "ciudad_id", "comuna_id"
            }
            datos_filtrados = {k: v for k, v in datos.items() if k in campos_validos and v is not None}
            
            if not datos_filtrados:
                return empresa

            if "esta_activa" in datos_filtrados:
                datos_filtrados["activo"] = datos_filtrados["esta_activa"]
            
            # Ejecutar actualización
            stmt = update(Empresa).where(
                Empresa.id == empresa_id
            ).values(**datos_filtrados)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Obtener y retornar empresa actualizada
            empresa_actualizada = await self.obtener_por_id(empresa_id)
            return empresa_actualizada
        except ValueError as ve:
            await self.session.rollback()
            raise ve
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar empresa: {str(e)}")
    
    async def inhabilitar(self, empresa_id: int) -> bool:
        """
        Inhabilita una empresa (soft delete). Los datos permanecen en BD pero
        quedan fuera de listados agregados hasta seleccionar la empresa explícitamente.
        """
        try:
            empresa = await self.obtener_por_id(empresa_id)
            if not empresa:
                raise ValueError("Empresa no encontrada")
            if bool(getattr(empresa, "es_empresa_maestra", False)):
                raise ValueError("No se puede inhabilitar la empresa maestra")

            stmt = update(Empresa).where(Empresa.id == empresa_id).values(
                esta_activa=False,
                activo=False,
            )
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except ValueError as ve:
            await self.session.rollback()
            raise ve
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al inhabilitar empresa: {str(e)}") from e

    async def eliminar(self, empresa_id: int) -> bool:
        """Alias de inhabilitar (compatibilidad DELETE /empresas/{id})."""
        return await self.inhabilitar(empresa_id)
