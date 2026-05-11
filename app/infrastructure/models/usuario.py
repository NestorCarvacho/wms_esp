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
    __tablename__ = "empresas"
    
    id = Column(BigInteger, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    rut = Column(String(50), nullable=True)
    esta_activa = Column(Boolean, default=True)
    creado_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    usuarios = relationship("Usuario", back_populates="empresa")
    
    def __repr__(self):
        return f"<Empresa(id={self.id}, nombre='{self.nombre}')>"


class Cargo(Base):
    """Tabla de cargos (roles de trabajo) por empresa."""
    __tablename__ = "cargos"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresas.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    
    def __repr__(self):
        return f"<Cargo(id={self.id}, nombre='{self.nombre}')>"

#base para Ususario
# CREATE TABLE `usuarios` (
#   `id` bigint NOT NULL AUTO_INCREMENT,
#   `empresa_id` bigint NOT NULL,
#   `cargo_id` bigint DEFAULT NULL,
#   `email` varchar(255) NOT NULL,
#   `password_hash` varchar(255) NOT NULL,
#   `nombre_completo` varchar(255) NOT NULL,
#   `rut` varchar(20) DEFAULT NULL,
#   `esta_activo` tinyint(1) DEFAULT '1',
#   `ultimo_login` datetime DEFAULT NULL,
#   `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
#   `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#   PRIMARY KEY (`id`),
#   UNIQUE KEY `uk_email_empresa` (`email`,`empresa_id`),
#   KEY `empresa_id` (`empresa_id`),
#   KEY `cargo_id` (`cargo_id`),
#   CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
#   CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON DELETE SET NULL
# ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

class Usuario(Base):
    """Tabla de usuarios con asociación a empresa."""
    __tablename__ = "usuarios"
    
    id = Column(BigInteger, primary_key=True, index=True)
    empresa_id = Column(BigInteger, ForeignKey("empresas.id"), nullable=False, index=True)
    cargo_id = Column(BigInteger, ForeignKey("cargos.id"), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(255), nullable=True)
    esta_activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    rut = Column(String(20), unique=True, nullable=True, index=True)
    ultimo_login = Column(DateTime, nullable=True)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relaciones
    empresa = relationship("Empresa", back_populates="usuarios")
    
    def __repr__(self):
        return f"<Usuario(id={self.id}, email='{self.email}', empresa_id={self.empresa_id})>"


class PerfilUsuario(Base):
    """Tabla de perfil de usuario con datos personales."""
    __tablename__ = "perfiles_usuario"
    
    id = Column(BigInteger, ForeignKey("usuarios.id"), primary_key=True)
    rut = Column(String(20), unique=True, nullable=True, index=True)
    nombre_completo = Column(String(255), nullable=True)
    genero = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<PerfilUsuario(id={self.id}, rut='{self.rut}')>"


class Rol(Base):
    """Tabla de roles globales."""
    __tablename__ = "roles"
    
    id = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    
    def __repr__(self):
        return f"<Rol(id={self.id}, nombre='{self.nombre}')>"


class PermisoCargo(Base):
    """Tabla de relación N:N entre Cargos y Roles."""
    __tablename__ = "permisos_cargo"
    
    cargo_id = Column(BigInteger, ForeignKey("cargos.id"), primary_key=True)
    rol_id = Column(BigInteger, ForeignKey("roles.id"), primary_key=True)
    
    def __repr__(self):
        return f"<PermisoCargo(cargo_id={self.cargo_id}, rol_id={self.rol_id})>"
