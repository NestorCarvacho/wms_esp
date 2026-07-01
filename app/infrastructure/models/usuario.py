"""
Modelos ORM: Entidades de base de datos mapeadas con SQLAlchemy.
"""
from sqlalchemy import Column, Integer, Numeric, String, DateTime, Date, Boolean, Text, DECIMAL, ForeignKey, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


# ---------------------------------------------------------------------------
# Geografía
# ---------------------------------------------------------------------------

class Region(Base):
    __tablename__ = "region"
    id     = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    codigo = Column(String(5), nullable=False, unique=True)
    activo = Column(Boolean, default=True)

    ciudades = relationship("Ciudad", back_populates="region")


class Ciudad(Base):
    __tablename__ = "ciudad"
    id        = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=False, index=True)
    nombre    = Column(String(100), nullable=False)
    activo    = Column(Boolean, default=True)

    region  = relationship("Region", back_populates="ciudades")
    comunas = relationship("Comuna", back_populates="ciudad")


class Comuna(Base):
    __tablename__ = "comuna"
    id        = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=False, index=True)
    ciudad_id = Column(Integer, ForeignKey("ciudad.id"), nullable=False, index=True)
    nombre    = Column(String(100), nullable=False)
    activo    = Column(Boolean, default=True)

    region = relationship("Region")
    ciudad = relationship("Ciudad", back_populates="comunas")


# ---------------------------------------------------------------------------
# Empresa
# ---------------------------------------------------------------------------

class Empresa(Base):
    """Tabla de empresas multi-tenant."""
    __tablename__ = "empresa"
    
    id               = Column(BigInteger, primary_key=True, index=True)
    codigo           = Column(String(50), unique=True, nullable=False, index=True)
    razon_social     = Column(String(255), nullable=False)
    nombre_fantasia  = Column(String(255), nullable=True)
    rut              = Column(String(50), nullable=True)
    giro             = Column(String(255), nullable=True)
    telefono         = Column(String(30), nullable=True)
    correo           = Column(String(255), nullable=True)
    sitio_web        = Column(String(255), nullable=True)
    esta_activa      = Column(Boolean, default=True)
    es_empresa_maestra = Column(Boolean, default=False)
    activo           = Column(Boolean, default=True)
    creado_at        = Column(DateTime, default=datetime.utcnow)
    direccion        = Column(String(255), nullable=True)
    region_id        = Column(Integer, ForeignKey("region.id"), nullable=True)
    ciudad_id        = Column(Integer, ForeignKey("ciudad.id"), nullable=True)
    comuna_id        = Column(Integer, ForeignKey("comuna.id"), nullable=True)
    locale           = Column(String(10), nullable=False, default="es-CL")
    timezone         = Column(String(64), nullable=False, default="America/Santiago")
    moneda_codigo    = Column(String(3), nullable=False, default="CLP")

    usuarios = relationship("Usuario", back_populates="empresa")
    region   = relationship("Region")
    ciudad   = relationship("Ciudad")
    comuna   = relationship("Comuna")

    def __repr__(self):
        return f"<Empresa(id={self.id}, razon_social='{self.razon_social}')>"


class Cargo(Base):
    """Tabla de cargos (roles de trabajo) por empresa."""
    __tablename__ = "cargo"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)

    empresa = relationship("Empresa")
    
    def __repr__(self):
        return f"<Cargo(id={self.id}, nombre='{self.nombre}')>"

class Usuario(Base):
    """Tabla de usuarios con asociación a empresa."""
    __tablename__ = "usuario"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    cargo_id = Column(BigInteger, ForeignKey("cargo.id"), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)
    ultimo_login = Column(DateTime, nullable=True)
    intentos_fallidos = Column(Integer, default=0, nullable=False)
    bloqueado_hasta = Column(DateTime, nullable=True)
    bloqueos_temporales = Column(Integer, default=0, nullable=False)
    bloqueado_permanente = Column(Boolean, default=False, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    empresa = relationship("Empresa", back_populates="usuarios")
    cargo = relationship("Cargo")
    roles = relationship("Rol", secondary="usuario_rol", viewonly=True)
    perfil = relationship("PerfilUsuario", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Usuario(id={self.id}, email='{self.email}', empresa_id={self.empresa_id})>"


class PasswordResetToken(Base):
    """Token de un solo uso para recuperación de contraseña."""
    __tablename__ = "password_reset_token"

    id = Column(BigInteger, primary_key=True, index=True)
    usuario_id = Column(BigInteger, ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), nullable=False, index=True)
    expira_at = Column(DateTime, nullable=False)
    usado_at = Column(DateTime, nullable=True)
    creado_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario")

    def __repr__(self):
        return f"<PasswordResetToken(usuario_id={self.usuario_id}, expira_at={self.expira_at})>"


class PerfilUsuario(Base):
    """Tabla de perfil de usuario con datos personales."""
    __tablename__ = "perfil_usuario"
    
    usuario_id = Column(BigInteger, ForeignKey("usuario.id", ondelete="CASCADE"), primary_key=True)
    rut = Column(String(20), nullable=True, unique=True, index=True)
    nombres = Column(String(100), nullable=True)
    apellido_paterno = Column(String(100), nullable=True)
    apellido_materno = Column(String(100), nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    genero = Column(String(20), nullable=True)
    telefono = Column(String(30), nullable=True)
    direccion = Column(String(255), nullable=True)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=True)
    ciudad_id = Column(Integer, ForeignKey("ciudad.id"), nullable=True)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=True)
    pais              = Column(String(100), nullable=True)
    locale_override   = Column(String(10), nullable=True)
    timezone_override = Column(String(64), nullable=True)
    foto_url  = Column(String(500), nullable=True)
    biografia = Column(Text, nullable=True)

    usuario = relationship("Usuario", back_populates="perfil")
    region  = relationship("Region")
    ciudad  = relationship("Ciudad")
    comuna  = relationship("Comuna")
    
    def __repr__(self):
        return f"<PerfilUsuario(usuario_id={self.usuario_id}, rut='{self.rut}')>"


class Rol(Base):
    """Catálogo de roles reutilizables por empresa."""
    __tablename__ = "rol"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True)
    creado_at = Column(DateTime, default=datetime.utcnow)
    empresa = relationship("Empresa")
    permisos = relationship("Permiso", secondary="rol_permiso", viewonly=True)
    
    def __repr__(self):
        return f"<Rol(id={self.id}, nombre='{self.nombre}')>"


class Permiso(Base):
    """Permisos atómicos del sistema (ej. inventario.ver)."""
    __tablename__ = "permiso"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    codigo = Column(String(100), nullable=False)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True)
    empresa = relationship("Empresa")
    
    def __repr__(self):
        return f"<Permiso(id={self.id}, codigo='{self.codigo}')>"


class RolPermiso(Base):
    """Relación N:N entre roles y permisos."""
    __tablename__ = "rol_permiso"
    
    rol_id = Column(BigInteger, ForeignKey("rol.id"), primary_key=True)
    permiso_id = Column(BigInteger, ForeignKey("permiso.id"), primary_key=True)
    activo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<RolPermiso(rol_id={self.rol_id}, permiso_id={self.permiso_id})>"


class PermisoCargo(Base):
    """Relación N:N cargo ↔ rol (legacy; la seguridad usa usuario_rol)."""
    __tablename__ = "permisos_cargo"
    
    cargo_id = Column(BigInteger, ForeignKey("cargo.id"), primary_key=True)
    rol_id = Column(BigInteger, ForeignKey("rol.id"), primary_key=True)
    activo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<PermisoCargo(cargo_id={self.cargo_id}, rol_id={self.rol_id})>"


class UsuarioRol(Base):
    """Asignación directa de roles de seguridad al usuario."""
    __tablename__ = "usuario_rol"

    usuario_id = Column(BigInteger, ForeignKey("usuario.id", ondelete="CASCADE"), primary_key=True)
    rol_id = Column(BigInteger, ForeignKey("rol.id"), primary_key=True)
    activo = Column(Boolean, default=True)

    def __repr__(self):
        return f"<UsuarioRol(usuario_id={self.usuario_id}, rol_id={self.rol_id})>"
    
class Bodega(Base):
    """Tabla de bodegas por empresa."""
    __tablename__ = "bodega"
    
    id         = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    codigo     = Column(String(50), nullable=False)
    nombre     = Column(String(255), nullable=False)
    activo     = Column(Boolean, default=True)
    direccion  = Column(String(255), nullable=True)
    region_id  = Column(Integer, ForeignKey("region.id"), nullable=True)
    ciudad_id  = Column(Integer, ForeignKey("ciudad.id"), nullable=True)
    comuna_id  = Column(Integer, ForeignKey("comuna.id"), nullable=True)

    empresa = relationship("Empresa")
    region  = relationship("Region")
    ciudad  = relationship("Ciudad")
    comuna  = relationship("Comuna")

    def __repr__(self):
        return f"<Bodega(id={self.id}, nombre='{self.nombre}', empresa_id={self.empresa_id})>"

    zonas = relationship("ZonaBodega", back_populates="bodega")


class TipoZona(Base):
    """Tipos de zona por empresa (ej. picking, recepción)."""
    __tablename__ = "tipo_zona"

    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    nombre = Column(String(50), nullable=False)
    activo = Column(Boolean, default=True)

    empresa = relationship("Empresa")
    zonas = relationship("ZonaBodega", back_populates="tipo_zona")

    def __repr__(self):
        return f"<TipoZona(id={self.id}, nombre='{self.nombre}')>"


class ZonaBodega(Base):
    """Zonas dentro de una bodega."""
    __tablename__ = "zona_bodega"

    id = Column(BigInteger, primary_key=True, index=True)
    bodega_id = Column(BigInteger, ForeignKey("bodega.id"), nullable=False, index=True)
    tipo_zona_id = Column(BigInteger, ForeignKey("tipo_zona.id"), nullable=False, index=True)
    nombre = Column(String(100), nullable=True)
    activo = Column(Boolean, default=True)

    bodega = relationship("Bodega", back_populates="zonas")
    tipo_zona = relationship("TipoZona", back_populates="zonas")

    def __repr__(self):
        return f"<ZonaBodega(id={self.id}, nombre='{self.nombre}', bodega_id={self.bodega_id})>"

class TipoProducto(Base):
    """Clasificación de productos por empresa (clavos, tornillos, etc.)."""
    __tablename__ = "tipo_producto"

    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)

    empresa = relationship("Empresa")
    productos = relationship("Producto", back_populates="tipo_producto")

    def __repr__(self):
        return f"<TipoProducto(id={self.id}, nombre='{self.nombre}')>"


class Producto(Base):
    """Tabla de productos por empresa."""
    __tablename__ = "producto"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    sku = Column(String(100), nullable=False)
    nombre = Column(String(255), nullable=False)
    unidad_medida_id = Column(BigInteger, ForeignKey("unidad_medida.id"), nullable=False)
    tipo_producto_id = Column(BigInteger, ForeignKey("tipo_producto.id"), nullable=True)
    precio_costo = Column(Numeric(12, 2), nullable=True)
    activo = Column(Boolean, default=True)
    serializado = Column(Boolean, default=False)
    empresa = relationship("Empresa")
    unidad_medida = relationship("UnidadMedida")
    tipo_producto = relationship("TipoProducto", back_populates="productos")
    presentaciones = relationship("ProductoPresentacion", back_populates="producto")

    def __repr__(self):
        return f"<Producto(id={self.id}, nombre='{self.nombre}', empresa_id={self.empresa_id}, sku='{self.sku}')>"


class ProductoPresentacion(Base):
    """Presentación comercial de un producto (caja, pack, etc.)."""
    __tablename__ = "producto_presentacion"

    id = Column(BigInteger, primary_key=True, index=True)
    producto_id = Column(BigInteger, ForeignKey("producto.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    codigo_barras = Column(String(100), nullable=True, index=True)
    cantidad_contenida = Column(Numeric(18, 6), nullable=False)
    unidad_medida_id = Column(BigInteger, ForeignKey("unidad_medida.id"), nullable=False)
    precio_costo = Column(Numeric(12, 2), nullable=True)
    precio_venta = Column(Numeric(12, 2), nullable=True)
    permite_venta_unidad = Column(Boolean, default=True)
    permite_venta_presentacion = Column(Boolean, default=True)
    activo = Column(Boolean, default=True)

    producto = relationship("Producto", back_populates="presentaciones")
    unidad_medida = relationship("UnidadMedida")

    def __repr__(self):
        return f"<ProductoPresentacion(id={self.id}, nombre='{self.nombre}', producto_id={self.producto_id})>"
    
class UnidadMedida(Base):
    """Tabla de unidades de medida por empresa."""
    __tablename__ = "unidad_medida"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    codigo = Column(String(50), nullable=False)
    activo = Column(Boolean, default=True)
    empresa = relationship("Empresa")

    def __repr__(self):
        return f"<UnidadMedida(id={self.id}, nombre='{self.nombre}', empresa_id={self.empresa_id}, codigo='{self.codigo}')>"


class StockZona(Base):
    """Cantidad de producto en una zona (ubicación física)."""
    __tablename__ = "stock_zona"

    id = Column(BigInteger, primary_key=True, index=True)
    zona_bodega_id = Column(BigInteger, ForeignKey("zona_bodega.id"), nullable=False, index=True)
    producto_id = Column(BigInteger, ForeignKey("producto.id"), nullable=False, index=True)
    cantidad = Column(Numeric(18, 6), nullable=False, default=0)
    actualizado_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zona_bodega = relationship("ZonaBodega")
    producto = relationship("Producto")


class MovimientoInventario(Base):
    """Historial de recepciones, traslados y despachos."""
    __tablename__ = "movimiento_inventario"

    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    usuario_id = Column(BigInteger, ForeignKey("usuario.id"), nullable=False)
    tipo = Column(String(30), nullable=False)
    producto_id = Column(BigInteger, ForeignKey("producto.id"), nullable=False)
    cantidad = Column(Numeric(18, 6), nullable=False)
    presentacion_id = Column(BigInteger, ForeignKey("producto_presentacion.id"), nullable=True)
    venta_por_presentacion = Column(Boolean, default=False)
    serie_id = Column(BigInteger, ForeignKey("serie_producto.id"), nullable=True)
    zona_origen_id = Column(BigInteger, ForeignKey("zona_bodega.id"), nullable=True)
    zona_destino_id = Column(BigInteger, ForeignKey("zona_bodega.id"), nullable=True)
    documento_tipo = Column(String(50), nullable=True)
    documento_folio = Column(String(100), nullable=True)
    observaciones = Column(Text, nullable=True)
    creado_at = Column(DateTime, default=datetime.utcnow)
    activo = Column(Boolean, default=True)

    usuario = relationship("Usuario")
    producto = relationship("Producto")
    zona_origen = relationship("ZonaBodega", foreign_keys=[zona_origen_id])
    zona_destino = relationship("ZonaBodega", foreign_keys=[zona_destino_id])


class SerieProducto(Base):
    """Número de serie individual de una unidad (inventario serializado)."""
    __tablename__ = "serie_producto"

    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    producto_id = Column(BigInteger, ForeignKey("producto.id"), nullable=False, index=True)
    numero_serie = Column(String(100), nullable=False)
    zona_bodega_id = Column(BigInteger, ForeignKey("zona_bodega.id"), nullable=True, index=True)
    estado = Column(String(30), nullable=False, default="EN_BODEGA")
    creado_at = Column(DateTime, default=datetime.utcnow)
    actualizado_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    empresa = relationship("Empresa")
    producto = relationship("Producto")
    zona_bodega = relationship("ZonaBodega")


class BodegaConfig(Base):
    """Parámetros operativos de bodega (zona de recepción por defecto)."""
    __tablename__ = "bodega_config"

    bodega_id = Column(BigInteger, ForeignKey("bodega.id"), primary_key=True)
    zona_recepcion_default_id = Column(BigInteger, ForeignKey("zona_bodega.id"), nullable=True)
    actualizado_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bodega = relationship("Bodega")
    zona_recepcion = relationship("ZonaBodega")


class Moneda(Base):
    """Catálogo ISO de monedas soportadas."""
    __tablename__ = "moneda"

    codigo = Column(String(3), primary_key=True)
    nombre = Column(String(100), nullable=False)
    simbolo = Column(String(10), nullable=True)
    decimales = Column(Integer, nullable=False, default=2)
    activo = Column(Boolean, default=True)


class TipoCambioHistorico(Base):
    """Snapshot de tipo de cambio para cuadre contable de órdenes cross-border."""
    __tablename__ = "tipo_cambio_historico"

    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    moneda_origen = Column(String(3), nullable=False)
    moneda_destino = Column(String(3), nullable=False)
    tasa = Column(Numeric(18, 8), nullable=False)
    vigente_desde = Column(DateTime, nullable=False)
    vigente_hasta = Column(DateTime, nullable=True)
    documento_tipo = Column(String(50), nullable=True)
    documento_id = Column(BigInteger, nullable=True)
    creado_at = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa")