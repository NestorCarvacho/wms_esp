"""
Servicio CRUD de Empresas (Capa de Negocio).
Orquesta la lógica de negocio para operaciones CRUD de empresas.
"""
from typing import Dict, Any, List
from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository


class EmpresaService:
    """Servicio CRUD de empresas con validaciones de negocio."""
    
    def __init__(self, repository: EmpresaCRUDRepository):
        self.repository = repository
    
    async def listar_empresas(
        self,
        pagina: int = 1,
        por_pagina: int = 10,
        solo_activas: bool = False,
        buscar: str | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> Dict[str, Any]:
        """
        Lista empresas con paginación.
        
        Args:
            pagina: Número de página (desde 1)
            por_pagina: Empresas por página
            solo_activas: Si True, solo lista empresas activas
            
        Returns:
            Dict con total, página actual, empresas por página y lista de empresas
        """
        try:
            empresas, total = await self.repository.listar(
                pagina=pagina,
                por_pagina=por_pagina,
                solo_activas=solo_activas,
                buscar=buscar,
                ordenar_por=ordenar_por,
                orden=orden,
            )
            
            return {
                "total": total,
                "pagina": pagina,
                "por_pagina": por_pagina,
                "empresas": [
                    {
                        "id": e.id,
                        "codigo": e.codigo,
                        "nombre": e.nombre,
                        "rut": e.rut,
                        "esta_activa": e.esta_activa,
                        "es_empresa_maestra": bool(getattr(e, "es_empresa_maestra", False)),
                        "creado_at": e.creado_at
                    }
                    for e in empresas
                ]
            }
        except Exception as e:
            raise Exception(f"Error al listar empresas: {str(e)}")
    
    async def obtener_empresa(self, empresa_id: int) -> Dict[str, Any]:
        """
        Obtiene una empresa específica.
        
        Args:
            empresa_id: ID de la empresa
            
        Returns:
            Dict con datos de la empresa
            
        Raises:
            ValueError: Si la empresa no existe
        """
        try:
            empresa = await self.repository.obtener_por_id(empresa_id)
            if not empresa:
                raise ValueError("Empresa no encontrada")
            
            return {
                "id": empresa.id,
                "codigo": empresa.codigo,
                "nombre": empresa.nombre,
                "rut": empresa.rut,
                "esta_activa": empresa.esta_activa,
                "creado_at": empresa.creado_at
            }
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al obtener empresa: {str(e)}")
    
    async def crear_empresa(
        self,
        codigo: str,
        nombre: str,
        rut: str = None
    ) -> Dict[str, Any]:
        """
        Crea una nueva empresa.
        
        Args:
            codigo: Código único de la empresa
            nombre: Nombre de la empresa
            rut: RUT de la empresa (opcional)
            
        Returns:
            Dict con datos de la empresa creada
            
        Raises:
            ValueError: Si el código ya existe
        """
        try:
            # Validar que el código sea único
            empresa_existente = await self.repository.obtener_por_codigo(codigo)
            if empresa_existente:
                raise ValueError(f"El código de empresa '{codigo}' ya existe")
            
            # Crear empresa
            empresa = await self.repository.crear(
                codigo=codigo,
                nombre=nombre,
                rut=rut
            )
            
            return {
                "id": empresa.id,
                "codigo": empresa.codigo,
                "nombre": empresa.nombre,
                "rut": empresa.rut,
                "esta_activa": empresa.esta_activa,
                "creado_at": empresa.creado_at
            }
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al crear empresa: {str(e)}")
    
    async def actualizar_empresa(
        self,
        empresa_id: int,
        nombre: str = None,
        rut: str = None,
        esta_activa: bool = None
    ) -> Dict[str, Any]:
        """
        Actualiza una empresa existente.
        
        Args:
            empresa_id: ID de la empresa
            nombre: Nuevo nombre (opcional)
            rut: Nuevo RUT (opcional)
            esta_activa: Nuevo estado (opcional)
            
        Returns:
            Dict con datos de la empresa actualizada
            
        Raises:
            ValueError: Si la empresa no existe
        """
        try:
            datos_actualizacion = {}
            if nombre is not None:
                datos_actualizacion["nombre"] = nombre
            if rut is not None:
                datos_actualizacion["rut"] = rut
            if esta_activa is not None:
                datos_actualizacion["esta_activa"] = esta_activa
            
            empresa = await self.repository.actualizar(empresa_id, **datos_actualizacion)
            
            return {
                "id": empresa.id,
                "codigo": empresa.codigo,
                "nombre": empresa.nombre,
                "rut": empresa.rut,
                "esta_activa": empresa.esta_activa,
                "creado_at": empresa.creado_at
            }
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al actualizar empresa: {str(e)}")
    
    async def eliminar_empresa(self, empresa_id: int) -> Dict[str, str]:
        """
        Elimina (desactiva) una empresa.
        
        Args:
            empresa_id: ID de la empresa
            
        Returns:
            Dict con mensaje de confirmación
            
        Raises:
            ValueError: Si la empresa no existe
        """
        try:
            await self.repository.eliminar(empresa_id)
            return {
                "mensaje": f"Empresa con ID {empresa_id} inhabilitada correctamente"
            }
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al eliminar empresa: {str(e)}")
