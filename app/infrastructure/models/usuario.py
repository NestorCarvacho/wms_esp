"""
Modelos ORM: Entidades de base de datos mapeadas con SQLAlchemy.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, DECIMAL, ForeignKey, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Empresa(Base):
    """Tabla de empresas multi-tenant."""
    __tablename__ = "empresa"
    
    id = Column(BigInteger, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    rut = Column(String(50), nullable=True)
    esta_activa = Column(Boolean, default=True)
    activo = Column(Boolean, default=True)
    creado_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    usuarios = relationship("Usuario", back_populates="empresa")
    
    def __repr__(self):
        return f"<Empresa(id={self.id}, nombre='{self.nombre}')>"


class Cargo(Base):
    """Tabla de cargos (roles de trabajo) por empresa."""
    __tablename__ = "cargo"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)

    roles = relationship("Rol", back_populates="cargo")
    
    def __repr__(self):
        return f"<Cargo(id={self.id}, nombre='{self.nombre}')>"

class Usuario(Base):
    """Tabla de usuarios con asociación a empresa."""
    __tablename__ = "usuario"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False, index=True)
    cargo_id = Column(BigInteger, ForeignKey("cargo.id"), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(255), nullable=True)
    rut = Column(String(20), nullable=True, index=True)
    esta_activo = Column(Boolean, default=True)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    ultimo_login = Column(DateTime, nullable=True)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relaciones
    empresa = relationship("Empresa", back_populates="usuarios")
    
    def __repr__(self):
        return f"<Usuario(id={self.id}, email='{self.email}', empresa_id={self.empresa_id})>"


class PerfilUsuario(Base):
    """Tabla de perfil de usuario con datos personales."""
    __tablename__ = "perfil_usuario"
    
    id = Column(BigInteger, ForeignKey("usuario.id"), primary_key=True)
    rut = Column(String(20), nullable=True, index=True)
    nombre_completo = Column(String(255), nullable=True)
    genero = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<PerfilUsuario(id={self.id}, rut='{self.rut}')>"


class Rol(Base):
    """Tabla de roles por empresa y cargo."""
    __tablename__ = "rol"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresa.id"), nullable=False)
    cargo_id = Column(BigInteger, ForeignKey("cargo.id"), nullable=False)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True)
    creado_at = Column(DateTime, default=datetime.utcnow)
    cargo_id = Column(Integer, ForeignKey("cargo.id"))
    cargo = relationship("Cargo", back_populates="roles")
    
    def __repr__(self):
        return f"<Rol(id={self.id}, nombre='{self.nombre}', cargo_id={self.cargo_id})>"


class PermisoCargo(Base):
    """Tabla de relación N:N entre Cargos y Roles."""
    __tablename__ = "permiso_cargo"
    
    cargo_id = Column(BigInteger, ForeignKey("cargo.id"), primary_key=True)
    rol_id = Column(BigInteger, ForeignKey("rol.id"), primary_key=True)
    activo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<PermisoCargo(cargo_id={self.cargo_id}, rol_id={self.rol_id})>"
