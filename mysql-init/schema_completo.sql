-- =============================================================================
-- WMS ESP — Schema completo v1.0
-- Instalación desde cero: crea todas las tablas e inserta datos base (RBAC).
--
-- ⚠  ATENCIÓN: este script ELIMINA y RECREA todas las tablas.
--    NO ejecutar sobre una BD con datos de producción sin respaldo previo.
--
-- Uso:
--   mysql -u root -p <password> wms_esp < schema_completo.sql
--
-- Tablas incluidas:
--   empresa, cargo, rol, permiso, rol_permiso, permisos_cargo,
--   unidad_medida, tipo_zona, tipo_producto, usuario, perfil_usuario, usuario_rol,
--   bodega, zona_bodega, bodega_config, empresa_administrada,
--   producto, producto_presentacion, stock_zona, serie_producto, movimiento_inventario,
--   moneda, tipo_cambio_historico, region, ciudad, comuna,
--   estado_ticket, tipo_solicitud, ticket, ticket_mensaje
--
-- Datos semilla: permisos, roles operativos (empresa_id = 1), geografía Chile.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- SECCIÓN 1 — DROP (orden inverso de dependencias)
-- =============================================================================

DROP TABLE IF EXISTS ticket_mensaje;
DROP TABLE IF EXISTS ticket;
DROP TABLE IF EXISTS tipo_solicitud;
DROP TABLE IF EXISTS estado_ticket;
DROP TABLE IF EXISTS movimiento_inventario;
DROP TABLE IF EXISTS tipo_cambio_historico;
DROP TABLE IF EXISTS moneda;
DROP TABLE IF EXISTS notificacion;
DROP TABLE IF EXISTS comuna;
DROP TABLE IF EXISTS ciudad;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS serie_producto;
DROP TABLE IF EXISTS stock_zona;
DROP TABLE IF EXISTS bodega_config;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS movimiento_stock;
DROP TABLE IF EXISTS producto_presentacion;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS tipo_producto;
DROP TABLE IF EXISTS unidad_medida;
DROP TABLE IF EXISTS zona_bodega;
DROP TABLE IF EXISTS bodega;
DROP TABLE IF EXISTS tipo_zona;
DROP TABLE IF EXISTS empresa_administrada;
DROP TABLE IF EXISTS usuario_rol;
DROP TABLE IF EXISTS password_reset_token;
DROP TABLE IF EXISTS perfil_usuario;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS rol_permiso;
DROP TABLE IF EXISTS permisos_cargo;
DROP TABLE IF EXISTS permiso;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS cargo;
DROP TABLE IF EXISTS estado_inventario;
DROP TABLE IF EXISTS estado_orden;
DROP TABLE IF EXISTS empresa;

-- =============================================================================
-- SECCIÓN 2 — CREATE (orden de dependencias)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- region / ciudad / comuna  (geografía — tablas de referencia)
-- ----------------------------------------------------------------------------
CREATE TABLE region (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(5)   NOT NULL,
  activo TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_region_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ciudad (
  id        INT          NOT NULL AUTO_INCREMENT,
  region_id INT          NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  activo    TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  KEY region_id (region_id),
  CONSTRAINT ciudad_ibfk_1 FOREIGN KEY (region_id) REFERENCES region (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comuna (
  id        INT          NOT NULL AUTO_INCREMENT,
  region_id INT          NOT NULL,
  ciudad_id INT          NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  activo    TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  KEY region_id (region_id),
  KEY ciudad_id (ciudad_id),
  CONSTRAINT comuna_ibfk_1 FOREIGN KEY (region_id) REFERENCES region (id),
  CONSTRAINT comuna_ibfk_2 FOREIGN KEY (ciudad_id) REFERENCES ciudad (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Semilla geografia Chile (ver tambien geografia_chile_seed.sql)
-- Semilla de geografía de Chile (región, ciudad, comuna).
-- Idempotente: INSERT IGNORE. Sin ALTER (el esquema ya existe en schema_completo).

SET NAMES utf8mb4;
-- ---------------------------------------------------------------------------
-- REGIONES (orden geográfico norte→sur, numeración oficial)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO region (id, nombre, codigo) VALUES
( 1, 'Arica y Parinacota',          'XV'),
( 2, 'Tarapacá',                    'I'),
( 3, 'Antofagasta',                 'II'),
( 4, 'Atacama',                     'III'),
( 5, 'Coquimbo',                    'IV'),
( 6, 'Valparaíso',                  'V'),
( 7, 'Metropolitana de Santiago',   'RM'),
( 8, 'Libertador Gral. B. O''Higgins', 'VI'),
( 9, 'Maule',                       'VII'),
(10, 'Ñuble',                       'XVI'),
(11, 'Biobío',                      'VIII'),
(12, 'La Araucanía',                'IX'),
(13, 'Los Ríos',                    'XIV'),
(14, 'Los Lagos',                   'X'),
(15, 'Aysén del Gral. C. Ibáñez',   'XI'),
(16, 'Magallanes y Antártica',      'XII');

-- ---------------------------------------------------------------------------
-- CIUDADES (capitales provinciales y centros urbanos principales)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO ciudad (id, region_id, nombre) VALUES
-- Región XV - Arica y Parinacota
( 1,  1, 'Arica'),
( 2,  1, 'Putre'),
-- Región I - Tarapacá
( 3,  2, 'Iquique'),
( 4,  2, 'Alto Hospicio'),
( 5,  2, 'Pozo Almonte'),
-- Región II - Antofagasta
( 6,  3, 'Antofagasta'),
( 7,  3, 'Calama'),
( 8,  3, 'Tocopilla'),
-- Región III - Atacama
( 9,  4, 'Copiapó'),
(10,  4, 'Vallenar'),
(11,  4, 'Chañaral'),
-- Región IV - Coquimbo
(12,  5, 'La Serena'),
(13,  5, 'Coquimbo'),
(14,  5, 'Ovalle'),
(15,  5, 'Illapel'),
(16,  5, 'La Ligua'),
-- Región V - Valparaíso
(17,  6, 'Valparaíso'),
(18,  6, 'Viña del Mar'),
(19,  6, 'Quilpué'),
(20,  6, 'Villa Alemana'),
(21,  6, 'San Antonio'),
(22,  6, 'Los Andes'),
(23,  6, 'San Felipe'),
(24,  6, 'La Calera'),
(25,  6, 'Quillota'),
-- Región RM - Metropolitana
(26,  7, 'Santiago'),
(27,  7, 'Puente Alto'),
(28,  7, 'Maipú'),
(29,  7, 'La Florida'),
(30,  7, 'Las Condes'),
(31,  7, 'San Bernardo'),
(32,  7, 'Melipilla'),
(33,  7, 'Talagante'),
(34,  7, 'Colina'),
-- Región VI - O'Higgins
(35,  8, 'Rancagua'),
(36,  8, 'San Fernando'),
(37,  8, 'Santa Cruz'),
(38,  8, 'Pichilemu'),
-- Región VII - Maule
(39,  9, 'Talca'),
(40,  9, 'Curicó'),
(41,  9, 'Linares'),
(42,  9, 'Cauquenes'),
-- Región XVI - Ñuble
(43, 10, 'Chillán'),
(44, 10, 'San Carlos'),
-- Región VIII - Biobío
(45, 11, 'Concepción'),
(46, 11, 'Talcahuano'),
(47, 11, 'Los Ángeles'),
(48, 11, 'Lebu'),
-- Región IX - Araucanía
(49, 12, 'Temuco'),
(50, 12, 'Angol'),
(51, 12, 'Villarrica'),
-- Región XIV - Los Ríos
(52, 13, 'Valdivia'),
(53, 13, 'La Unión'),
-- Región X - Los Lagos
(54, 14, 'Puerto Montt'),
(55, 14, 'Osorno'),
(56, 14, 'Castro'),
(57, 14, 'Puerto Varas'),
(58, 14, 'Ancud'),
-- Región XI - Aysén
(59, 15, 'Coyhaique'),
(60, 15, 'Puerto Aysén'),
-- Región XII - Magallanes
(61, 16, 'Punta Arenas'),
(62, 16, 'Puerto Natales');

-- ---------------------------------------------------------------------------
-- COMUNAS
-- ---------------------------------------------------------------------------

-- Región XV - Arica y Parinacota
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(1, 1, 'Arica'),
(1, 1, 'Camarones'),
(1, 2, 'Putre'),
(1, 2, 'General Lagos');

-- Región I - Tarapacá
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(2, 3, 'Iquique'),
(2, 4, 'Alto Hospicio'),
(2, 5, 'Pozo Almonte'),
(2, 5, 'Camiña'),
(2, 5, 'Colchane'),
(2, 5, 'Huara'),
(2, 5, 'Pica');

-- Región II - Antofagasta
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(3, 6, 'Antofagasta'),
(3, 6, 'Mejillones'),
(3, 6, 'Sierra Gorda'),
(3, 6, 'Taltal'),
(3, 7, 'Calama'),
(3, 7, 'Ollagüe'),
(3, 7, 'San Pedro de Atacama'),
(3, 8, 'Tocopilla'),
(3, 8, 'María Elena');

-- Región III - Atacama
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(4, 9, 'Copiapó'),
(4, 9, 'Caldera'),
(4, 9, 'Tierra Amarilla'),
(4, 11, 'Chañaral'),
(4, 11, 'Diego de Almagro'),
(4, 10, 'Vallenar'),
(4, 10, 'Alto del Carmen'),
(4, 10, 'Freirina'),
(4, 10, 'Huasco');

-- Región IV - Coquimbo
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(5, 12, 'La Serena'),
(5, 12, 'Andacollo'),
(5, 12, 'La Higuera'),
(5, 12, 'Paiguano'),
(5, 12, 'Vicuña'),
(5, 13, 'Coquimbo'),
(5, 15, 'Illapel'),
(5, 15, 'Canela'),
(5, 15, 'Los Vilos'),
(5, 15, 'Salamanca'),
(5, 14, 'Ovalle'),
(5, 14, 'Combarbalá'),
(5, 14, 'Monte Patria'),
(5, 14, 'Punitaqui'),
(5, 14, 'Río Hurtado');

-- Región V - Valparaíso
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(6, 17, 'Valparaíso'),
(6, 17, 'Casablanca'),
(6, 17, 'Concón'),
(6, 17, 'Juan Fernández'),
(6, 17, 'Puchuncaví'),
(6, 17, 'Quintero'),
(6, 18, 'Viña del Mar'),
(6, 19, 'Quilpué'),
(6, 20, 'Villa Alemana'),
(6, 20, 'Limache'),
(6, 20, 'Olmué'),
(6, 21, 'San Antonio'),
(6, 21, 'Algarrobo'),
(6, 21, 'Cartagena'),
(6, 21, 'El Quisco'),
(6, 21, 'El Tabo'),
(6, 21, 'Santo Domingo'),
(6, 22, 'Los Andes'),
(6, 22, 'Calle Larga'),
(6, 22, 'Rinconada'),
(6, 22, 'San Esteban'),
(6, 23, 'San Felipe'),
(6, 23, 'Catemu'),
(6, 23, 'Llaillay'),
(6, 23, 'Panquehue'),
(6, 23, 'Putaendo'),
(6, 23, 'Santa María'),
(6, 16, 'La Ligua'),
(6, 16, 'Cabildo'),
(6, 16, 'Papudo'),
(6, 16, 'Petorca'),
(6, 16, 'Zapallar'),
(6, 24, 'La Calera'),
(6, 24, 'La Cruz'),
(6, 24, 'Nogales'),
(6, 25, 'Quillota'),
(6, 25, 'Hijuelas'),
(6,  6, 'Isla de Pascua');

-- Región RM - Metropolitana
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(7, 26, 'Santiago'),
(7, 26, 'Cerrillos'),
(7, 26, 'Cerro Navia'),
(7, 26, 'Conchalí'),
(7, 26, 'El Bosque'),
(7, 26, 'Estación Central'),
(7, 26, 'Huechuraba'),
(7, 26, 'Independencia'),
(7, 26, 'La Cisterna'),
(7, 29, 'La Florida'),
(7, 26, 'La Granja'),
(7, 26, 'La Pintana'),
(7, 26, 'La Reina'),
(7, 30, 'Las Condes'),
(7, 30, 'Lo Barnechea'),
(7, 26, 'Lo Espejo'),
(7, 26, 'Lo Prado'),
(7, 26, 'Macul'),
(7, 28, 'Maipú'),
(7, 26, 'Ñuñoa'),
(7, 26, 'Pedro Aguirre Cerda'),
(7, 26, 'Peñalolén'),
(7, 30, 'Providencia'),
(7, 26, 'Pudahuel'),
(7, 26, 'Quilicura'),
(7, 26, 'Quinta Normal'),
(7, 26, 'Recoleta'),
(7, 26, 'Renca'),
(7, 26, 'San Joaquín'),
(7, 26, 'San Miguel'),
(7, 26, 'San Ramón'),
(7, 30, 'Vitacura'),
(7, 27, 'Puente Alto'),
(7, 27, 'Pirque'),
(7, 27, 'San José de Maipo'),
(7, 34, 'Colina'),
(7, 34, 'Lampa'),
(7, 34, 'Tiltil'),
(7, 31, 'San Bernardo'),
(7, 31, 'Buin'),
(7, 31, 'Calera de Tango'),
(7, 31, 'Paine'),
(7, 32, 'Melipilla'),
(7, 32, 'Alhué'),
(7, 32, 'Curacaví'),
(7, 32, 'María Pinto'),
(7, 32, 'San Pedro'),
(7, 33, 'Talagante'),
(7, 33, 'El Monte'),
(7, 33, 'Isla de Maipo'),
(7, 33, 'Padre Hurtado'),
(7, 33, 'Peñaflor');

-- Región VI - O'Higgins
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(8, 35, 'Rancagua'),
(8, 35, 'Codegua'),
(8, 35, 'Coinco'),
(8, 35, 'Coltauco'),
(8, 35, 'Doñihue'),
(8, 35, 'Graneros'),
(8, 35, 'Las Cabras'),
(8, 35, 'Machalí'),
(8, 35, 'Malloa'),
(8, 35, 'Mostazal'),
(8, 35, 'Olivar'),
(8, 35, 'Peumo'),
(8, 35, 'Pichidegua'),
(8, 35, 'Quinta de Tilcoco'),
(8, 35, 'Rengo'),
(8, 35, 'Requínoa'),
(8, 35, 'San Vicente'),
(8, 38, 'Pichilemu'),
(8, 38, 'La Estrella'),
(8, 38, 'Litueche'),
(8, 38, 'Marchigüe'),
(8, 38, 'Navidad'),
(8, 38, 'Paredones'),
(8, 36, 'San Fernando'),
(8, 36, 'Chépica'),
(8, 36, 'Chimbarongo'),
(8, 37, 'Santa Cruz'),
(8, 37, 'Lolol'),
(8, 37, 'Nancagua'),
(8, 37, 'Palmilla'),
(8, 37, 'Peralillo'),
(8, 37, 'Placilla'),
(8, 37, 'Pumanque');

-- Región VII - Maule
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(9, 39, 'Talca'),
(9, 39, 'Constitución'),
(9, 39, 'Curepto'),
(9, 39, 'Empedrado'),
(9, 39, 'Maule'),
(9, 39, 'Pelarco'),
(9, 39, 'Pencahue'),
(9, 39, 'Río Claro'),
(9, 39, 'San Clemente'),
(9, 39, 'San Rafael'),
(9, 42, 'Cauquenes'),
(9, 42, 'Chanco'),
(9, 42, 'Pelluhue'),
(9, 40, 'Curicó'),
(9, 40, 'Hualañé'),
(9, 40, 'Licantén'),
(9, 40, 'Molina'),
(9, 40, 'Rauco'),
(9, 40, 'Romeral'),
(9, 40, 'Sagrada Familia'),
(9, 40, 'Teno'),
(9, 40, 'Vichuquén'),
(9, 41, 'Linares'),
(9, 41, 'Colbún'),
(9, 41, 'Longaví'),
(9, 41, 'Parral'),
(9, 41, 'Retiro'),
(9, 41, 'San Javier'),
(9, 41, 'Villa Alegre'),
(9, 41, 'Yerbas Buenas');

-- Región XVI - Ñuble
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(10, 43, 'Chillán'),
(10, 43, 'Chillán Viejo'),
(10, 43, 'Bulnes'),
(10, 43, 'Coihueco'),
(10, 43, 'El Carmen'),
(10, 43, 'Pemuco'),
(10, 43, 'Pinto'),
(10, 43, 'Quillón'),
(10, 43, 'San Ignacio'),
(10, 43, 'Yungay'),
(10, 44, 'San Carlos'),
(10, 44, 'Cobquecura'),
(10, 44, 'Coelemu'),
(10, 44, 'Ninhue'),
(10, 44, 'Ñiquén'),
(10, 44, 'Portezuelo'),
(10, 44, 'Quirihue'),
(10, 44, 'Ránquil'),
(10, 44, 'San Fabián'),
(10, 44, 'San Nicolás'),
(10, 44, 'Treguaco');

-- Región VIII - Biobío
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(11, 45, 'Concepción'),
(11, 45, 'Coronel'),
(11, 45, 'Chiguayante'),
(11, 45, 'Florida'),
(11, 45, 'Hualqui'),
(11, 45, 'Lota'),
(11, 45, 'Penco'),
(11, 45, 'San Pedro de la Paz'),
(11, 45, 'Santa Juana'),
(11, 46, 'Talcahuano'),
(11, 46, 'Hualpén'),
(11, 45, 'Tomé'),
(11, 48, 'Lebu'),
(11, 48, 'Arauco'),
(11, 48, 'Cañete'),
(11, 48, 'Contulmo'),
(11, 48, 'Curanilahue'),
(11, 48, 'Los Álamos'),
(11, 48, 'Tirúa'),
(11, 47, 'Los Ángeles'),
(11, 47, 'Antuco'),
(11, 47, 'Cabrero'),
(11, 47, 'Laja'),
(11, 47, 'Mulchén'),
(11, 47, 'Nacimiento'),
(11, 47, 'Negrete'),
(11, 47, 'Quilaco'),
(11, 47, 'Quilleco'),
(11, 47, 'San Rosendo'),
(11, 47, 'Santa Bárbara'),
(11, 47, 'Tucapel'),
(11, 47, 'Yumbel'),
(11, 47, 'Alto Biobío');

-- Región IX - La Araucanía
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(12, 49, 'Temuco'),
(12, 49, 'Carahue'),
(12, 49, 'Cunco'),
(12, 49, 'Curarrehue'),
(12, 49, 'Freire'),
(12, 49, 'Galvarino'),
(12, 49, 'Gorbea'),
(12, 49, 'Lautaro'),
(12, 49, 'Loncoche'),
(12, 49, 'Melipeuco'),
(12, 49, 'Nueva Imperial'),
(12, 49, 'Padre Las Casas'),
(12, 49, 'Perquenco'),
(12, 49, 'Pitrufquén'),
(12, 49, 'Saavedra'),
(12, 49, 'Teodoro Schmidt'),
(12, 49, 'Toltén'),
(12, 49, 'Vilcún'),
(12, 49, 'Cholchol'),
(12, 51, 'Villarrica'),
(12, 51, 'Pucón'),
(12, 50, 'Angol'),
(12, 50, 'Collipulli'),
(12, 50, 'Curacautín'),
(12, 50, 'Ercilla'),
(12, 50, 'Lonquimay'),
(12, 50, 'Los Sauces'),
(12, 50, 'Lumaco'),
(12, 50, 'Purén'),
(12, 50, 'Renaico'),
(12, 50, 'Traiguén'),
(12, 50, 'Victoria');

-- Región XIV - Los Ríos
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(13, 52, 'Valdivia'),
(13, 52, 'Corral'),
(13, 52, 'Futrono'),
(13, 52, 'Lago Ranco'),
(13, 52, 'Lanco'),
(13, 52, 'Los Lagos'),
(13, 52, 'Máfil'),
(13, 52, 'Mariquina'),
(13, 52, 'Paillaco'),
(13, 52, 'Panguipulli'),
(13, 53, 'La Unión'),
(13, 53, 'Río Bueno');

-- Región X - Los Lagos
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(14, 54, 'Puerto Montt'),
(14, 54, 'Calbuco'),
(14, 54, 'Cochamó'),
(14, 54, 'Fresia'),
(14, 54, 'Frutillar'),
(14, 57, 'Puerto Varas'),
(14, 54, 'Los Muermos'),
(14, 54, 'Llanquihue'),
(14, 54, 'Maullín'),
(14, 58, 'Ancud'),
(14, 56, 'Castro'),
(14, 56, 'Chonchi'),
(14, 56, 'Curaco de Vélez'),
(14, 56, 'Dalcahue'),
(14, 56, 'Puqueldón'),
(14, 56, 'Queilén'),
(14, 56, 'Quellón'),
(14, 56, 'Quemchi'),
(14, 56, 'Quinchao'),
(14, 55, 'Osorno'),
(14, 55, 'Puerto Octay'),
(14, 55, 'Purranque'),
(14, 55, 'Puyehue'),
(14, 55, 'Río Negro'),
(14, 55, 'San Juan de la Costa'),
(14, 55, 'San Pablo'),
(14, 54, 'Chaitén'),
(14, 54, 'Futaleufú'),
(14, 54, 'Hualaihué'),
(14, 54, 'Palena');

-- Región XI - Aysén
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(15, 59, 'Coyhaique'),
(15, 59, 'Lago Verde'),
(15, 60, 'Aysén'),
(15, 60, 'Cisnes'),
(15, 60, 'Guaitecas'),
(15, 59, 'Cochrane'),
(15, 59, 'O''Higgins'),
(15, 59, 'Tortel'),
(15, 59, 'Chile Chico'),
(15, 59, 'Río Ibáñez');

-- Región XII - Magallanes
INSERT IGNORE INTO comuna (region_id, ciudad_id, nombre) VALUES
(16, 61, 'Punta Arenas'),
(16, 61, 'Laguna Blanca'),
(16, 61, 'Río Verde'),
(16, 61, 'San Gregorio'),
(16, 61, 'Cabo de Hornos'),
(16, 61, 'Antártica'),
(16, 61, 'Porvenir'),
(16, 61, 'Primavera'),
(16, 61, 'Timaukel'),
(16, 62, 'Natales'),
(16, 62, 'Torres del Paine');


-- ----------------------------------------------------------------------------
-- empresa
-- ----------------------------------------------------------------------------
CREATE TABLE empresa (
  id                 BIGINT       NOT NULL AUTO_INCREMENT,
  codigo             VARCHAR(50)  NOT NULL,
  razon_social       VARCHAR(255) NOT NULL,
  nombre_fantasia    VARCHAR(255) DEFAULT NULL,
  giro               VARCHAR(255) DEFAULT NULL,
  telefono           VARCHAR(30)  DEFAULT NULL,
  correo             VARCHAR(255) DEFAULT NULL,
  sitio_web          VARCHAR(255) DEFAULT NULL,
  rut                VARCHAR(50)  DEFAULT NULL,
  esta_activa        TINYINT(1)   DEFAULT 1,
  es_empresa_maestra TINYINT(1)   NOT NULL DEFAULT 0,
  activo             TINYINT(1)   DEFAULT 1,
  creado_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  direccion          VARCHAR(255) DEFAULT NULL,
  region_id          INT          DEFAULT NULL,
  ciudad_id          INT          DEFAULT NULL,
  comuna_id          INT          DEFAULT NULL,
  locale             VARCHAR(10)  NOT NULL DEFAULT 'es-CL',
  timezone           VARCHAR(64)  NOT NULL DEFAULT 'America/Santiago',
  moneda_codigo      CHAR(3)      NOT NULL DEFAULT 'CLP',
  PRIMARY KEY (id),
  UNIQUE KEY uk_empresa_codigo (codigo),
  CONSTRAINT fk_empresa_region FOREIGN KEY (region_id) REFERENCES region (id),
  CONSTRAINT fk_empresa_ciudad FOREIGN KEY (ciudad_id) REFERENCES ciudad (id),
  CONSTRAINT fk_empresa_comuna FOREIGN KEY (comuna_id) REFERENCES comuna (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- cargo
-- ----------------------------------------------------------------------------
CREATE TABLE cargo (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT       NOT NULL,
  nombre     VARCHAR(100) NOT NULL,
  activo     TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cargo_empresa (nombre, empresa_id),
  KEY idx_cargo_empresa_id (empresa_id),
  CONSTRAINT cargo_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- rol
-- ----------------------------------------------------------------------------
CREATE TABLE rol (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT       NOT NULL,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  activo      TINYINT(1)   DEFAULT 1,
  creado_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_rol_empresa (nombre, empresa_id),
  KEY idx_rol_empresa_id (empresa_id),
  CONSTRAINT rol_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- permiso
-- ----------------------------------------------------------------------------
CREATE TABLE permiso (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT       NOT NULL,
  codigo      VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  activo      TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_permiso_empresa (codigo, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT permiso_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- rol_permiso
-- ----------------------------------------------------------------------------
CREATE TABLE rol_permiso (
  rol_id     BIGINT     NOT NULL,
  permiso_id BIGINT     NOT NULL,
  activo     TINYINT(1) DEFAULT 1,
  PRIMARY KEY (rol_id, permiso_id),
  KEY permiso_id (permiso_id),
  CONSTRAINT rol_permiso_ibfk_1 FOREIGN KEY (rol_id)     REFERENCES rol     (id),
  CONSTRAINT rol_permiso_ibfk_2 FOREIGN KEY (permiso_id) REFERENCES permiso (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- permisos_cargo  (cargo ↔ rol)
-- ----------------------------------------------------------------------------
CREATE TABLE permisos_cargo (
  cargo_id BIGINT     NOT NULL,
  rol_id   BIGINT     NOT NULL,
  activo   TINYINT(1) DEFAULT 1,
  PRIMARY KEY (cargo_id, rol_id),
  KEY rol_id (rol_id),
  CONSTRAINT permisos_cargo_ibfk_1 FOREIGN KEY (cargo_id) REFERENCES cargo (id),
  CONSTRAINT permisos_cargo_ibfk_2 FOREIGN KEY (rol_id)   REFERENCES rol   (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- estado_inventario
-- ----------------------------------------------------------------------------
CREATE TABLE estado_inventario (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT       NOT NULL,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  permite_venta TINYINT(1) DEFAULT 1,
  activo      TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_inv_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT estado_inventario_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- estado_orden
-- ----------------------------------------------------------------------------
CREATE TABLE estado_orden (
  id          BIGINT      NOT NULL AUTO_INCREMENT,
  empresa_id  BIGINT      NOT NULL,
  nombre      VARCHAR(50) NOT NULL,
  orden_flujo INT         DEFAULT 0,
  activo      TINYINT(1)  DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_ord_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT estado_orden_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- unidad_medida
-- ----------------------------------------------------------------------------
CREATE TABLE unidad_medida (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT      NOT NULL,
  codigo     VARCHAR(10) NOT NULL,
  nombre     VARCHAR(50) NOT NULL,
  activo     TINYINT(1)  DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_unidad_empresa (codigo, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT unidad_medida_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- tipo_zona
-- ----------------------------------------------------------------------------
CREATE TABLE tipo_zona (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT      NOT NULL,
  nombre     VARCHAR(50) NOT NULL,
  activo     TINYINT(1)  DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipozona_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT tipo_zona_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- tipo_producto
-- ----------------------------------------------------------------------------
CREATE TABLE tipo_producto (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT       NOT NULL,
  nombre     VARCHAR(100) NOT NULL,
  activo     TINYINT(1)   NOT NULL DEFAULT 1,
  creado_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_producto_empresa (nombre, empresa_id),
  KEY empresa_id (empresa_id),
  CONSTRAINT tipo_producto_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- usuario
-- ----------------------------------------------------------------------------
CREATE TABLE usuario (
  id                   BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id           BIGINT       NOT NULL,
  cargo_id             BIGINT       DEFAULT NULL,
  email                VARCHAR(255) NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  activo               TINYINT(1)   DEFAULT 1,
  ultimo_login         DATETIME     DEFAULT NULL,
  fecha_creacion       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  intentos_fallidos    INT          NOT NULL DEFAULT 0,
  bloqueado_hasta      DATETIME     DEFAULT NULL,
  bloqueos_temporales  INT          NOT NULL DEFAULT 0,
  bloqueado_permanente TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email_empresa (email, empresa_id),
  KEY empresa_id (empresa_id),
  KEY cargo_id (cargo_id),
  CONSTRAINT usuarios_ibfk_1 FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT usuarios_ibfk_2 FOREIGN KEY (cargo_id)   REFERENCES cargo   (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- perfil_usuario
-- ----------------------------------------------------------------------------
CREATE TABLE perfil_usuario (
  usuario_id       BIGINT       NOT NULL,
  rut              VARCHAR(20)  DEFAULT NULL,
  nombres          VARCHAR(100) DEFAULT NULL,
  apellido_paterno VARCHAR(100) DEFAULT NULL,
  apellido_materno VARCHAR(100) DEFAULT NULL,
  fecha_nacimiento DATE         DEFAULT NULL,
  genero           VARCHAR(20)  DEFAULT NULL,
  telefono         VARCHAR(30)  DEFAULT NULL,
  direccion        VARCHAR(255) DEFAULT NULL,
  region_id        INT          DEFAULT NULL,
  ciudad_id        INT          DEFAULT NULL,
  comuna_id        INT          DEFAULT NULL,
  pais             VARCHAR(100) DEFAULT NULL,
  locale_override   VARCHAR(10)  DEFAULT NULL,
  timezone_override VARCHAR(64)  DEFAULT NULL,
  foto_url         VARCHAR(500) DEFAULT NULL,
  biografia        TEXT,
  PRIMARY KEY (usuario_id),
  UNIQUE KEY rut (rut),
  KEY fk_perfil_region (region_id),
  KEY fk_perfil_ciudad (ciudad_id),
  KEY fk_perfil_comuna (comuna_id),
  CONSTRAINT perfil_usuario_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuario   (id) ON DELETE CASCADE,
  CONSTRAINT fk_perfil_region      FOREIGN KEY (region_id)  REFERENCES region     (id),
  CONSTRAINT fk_perfil_ciudad      FOREIGN KEY (ciudad_id)  REFERENCES ciudad     (id),
  CONSTRAINT fk_perfil_comuna      FOREIGN KEY (comuna_id)  REFERENCES comuna     (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- usuario_rol
-- ----------------------------------------------------------------------------
CREATE TABLE usuario_rol (
  usuario_id BIGINT     NOT NULL,
  rol_id     BIGINT     NOT NULL,
  activo     TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (usuario_id, rol_id),
  KEY rol_id (rol_id),
  CONSTRAINT usuario_rol_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
  CONSTRAINT usuario_rol_ibfk_2 FOREIGN KEY (rol_id)     REFERENCES rol     (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- bodega
-- ----------------------------------------------------------------------------
CREATE TABLE bodega (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT       NOT NULL,
  codigo     VARCHAR(50)  NOT NULL,
  nombre     VARCHAR(255) NOT NULL,
  activo     TINYINT(1)   DEFAULT 1,
  direccion  VARCHAR(255) DEFAULT NULL,
  region_id  INT          DEFAULT NULL,
  ciudad_id  INT          DEFAULT NULL,
  comuna_id  INT          DEFAULT NULL,
  PRIMARY KEY (id),
  KEY empresa_id       (empresa_id),
  KEY fk_bodega_region (region_id),
  KEY fk_bodega_ciudad (ciudad_id),
  KEY fk_bodega_comuna (comuna_id),
  CONSTRAINT bodega_ibfk_1     FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_bodega_region  FOREIGN KEY (region_id)  REFERENCES region  (id),
  CONSTRAINT fk_bodega_ciudad  FOREIGN KEY (ciudad_id)  REFERENCES ciudad  (id),
  CONSTRAINT fk_bodega_comuna  FOREIGN KEY (comuna_id)  REFERENCES comuna  (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- zona_bodega
-- ----------------------------------------------------------------------------
CREATE TABLE zona_bodega (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  bodega_id   BIGINT       NOT NULL,
  tipo_zona_id BIGINT      NOT NULL,
  nombre      VARCHAR(100) DEFAULT NULL,
  activo      TINYINT(1)   DEFAULT 1,
  PRIMARY KEY (id),
  KEY bodega_id    (bodega_id),
  KEY tipo_zona_id (tipo_zona_id),
  CONSTRAINT zona_bodega_ibfk_1 FOREIGN KEY (bodega_id)    REFERENCES bodega    (id),
  CONSTRAINT zona_bodega_ibfk_2 FOREIGN KEY (tipo_zona_id) REFERENCES tipo_zona (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- bodega_config
-- ----------------------------------------------------------------------------
CREATE TABLE bodega_config (
  bodega_id                BIGINT    NOT NULL,
  zona_recepcion_default_id BIGINT   DEFAULT NULL,
  actualizado_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bodega_id),
  KEY zona_recepcion_default_id (zona_recepcion_default_id),
  CONSTRAINT bodega_config_ibfk_1 FOREIGN KEY (bodega_id)                 REFERENCES bodega      (id),
  CONSTRAINT bodega_config_ibfk_2 FOREIGN KEY (zona_recepcion_default_id) REFERENCES zona_bodega (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- empresa_administrada
-- ----------------------------------------------------------------------------
CREATE TABLE empresa_administrada (
  empresa_maestra_id     BIGINT     NOT NULL,
  empresa_administrada_id BIGINT    NOT NULL,
  activo                 TINYINT(1) NOT NULL DEFAULT 1,
  creado_at              DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (empresa_maestra_id, empresa_administrada_id),
  KEY idx_empresa_administrada_hija (empresa_administrada_id),
  CONSTRAINT fk_empresa_admin_maestra FOREIGN KEY (empresa_maestra_id)      REFERENCES empresa (id),
  CONSTRAINT fk_empresa_admin_hija    FOREIGN KEY (empresa_administrada_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- producto
-- ----------------------------------------------------------------------------
CREATE TABLE producto (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id       BIGINT       NOT NULL,
  sku              VARCHAR(100) NOT NULL,
  nombre           VARCHAR(255) NOT NULL,
  unidad_medida_id BIGINT       NOT NULL,
  tipo_producto_id BIGINT       DEFAULT NULL,
  precio_costo     DECIMAL(12,2) DEFAULT NULL,
  stock_minimo     DECIMAL(18,6) DEFAULT NULL,
  activo           TINYINT(1)   DEFAULT 1,
  serializado      TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_producto_sku_empresa (sku, empresa_id),
  KEY empresa_id       (empresa_id),
  KEY unidad_medida_id (unidad_medida_id),
  KEY fk_producto_tipo_producto (tipo_producto_id),
  CONSTRAINT fk_producto_tipo_producto FOREIGN KEY (tipo_producto_id) REFERENCES tipo_producto (id),
  CONSTRAINT producto_ibfk_1           FOREIGN KEY (empresa_id)       REFERENCES empresa       (id),
  CONSTRAINT producto_ibfk_2           FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- producto_presentacion
-- Cada presentación es un empaque del producto (unidad, caja, display, pallet).
-- codigo_barras: EAN/código escaneable del empaque.
-- cantidad_contenida: factor de conversión a unidades base (ej. caja x12 → 12).
-- ----------------------------------------------------------------------------
CREATE TABLE producto_presentacion (
  id                       BIGINT        NOT NULL AUTO_INCREMENT,
  producto_id              BIGINT        NOT NULL,
  nombre                   VARCHAR(255)  NOT NULL,
  codigo_barras            VARCHAR(100)  DEFAULT NULL,
  cantidad_contenida       DECIMAL(18,6) NOT NULL,
  unidad_medida_id         BIGINT        NOT NULL,
  precio_costo             DECIMAL(12,2) DEFAULT NULL,
  precio_venta             DECIMAL(12,2) DEFAULT NULL,
  permite_venta_unidad     TINYINT(1)    NOT NULL DEFAULT 1,
  permite_venta_presentacion TINYINT(1)  NOT NULL DEFAULT 1,
  activo                   TINYINT(1)    NOT NULL DEFAULT 1,
  creado_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_presentacion_producto (producto_id, nombre),
  KEY unidad_medida_id (unidad_medida_id),
  KEY idx_presentacion_barcode (codigo_barras),
  CONSTRAINT producto_presentacion_ibfk_1 FOREIGN KEY (producto_id)      REFERENCES producto      (id),
  CONSTRAINT producto_presentacion_ibfk_2 FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- stock_zona  — stock operativo por producto y zona
-- ----------------------------------------------------------------------------
CREATE TABLE stock_zona (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  zona_bodega_id BIGINT       NOT NULL,
  producto_id   BIGINT        NOT NULL,
  cantidad      DECIMAL(18,6) NOT NULL DEFAULT 0,
  actualizado_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_stock_zona (zona_bodega_id, producto_id),
  KEY producto_id (producto_id),
  CONSTRAINT stock_zona_ibfk_1 FOREIGN KEY (zona_bodega_id) REFERENCES zona_bodega (id),
  CONSTRAINT stock_zona_ibfk_2 FOREIGN KEY (producto_id)    REFERENCES producto     (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- serie_producto  — inventario serializado: una fila por unidad física
-- estado: EN_BODEGA | DESPACHADO | BAJA
-- ----------------------------------------------------------------------------
CREATE TABLE serie_producto (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id     BIGINT       NOT NULL,
  producto_id    BIGINT       NOT NULL,
  numero_serie   VARCHAR(100) NOT NULL,
  zona_bodega_id BIGINT       DEFAULT NULL,
  estado         VARCHAR(30)  NOT NULL DEFAULT 'EN_BODEGA',
  creado_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_serie_empresa  (empresa_id, numero_serie),
  KEY idx_serie_producto (producto_id),
  KEY idx_serie_zona     (zona_bodega_id),
  KEY idx_serie_estado   (estado),
  CONSTRAINT serie_producto_ibfk_1 FOREIGN KEY (empresa_id)     REFERENCES empresa     (id),
  CONSTRAINT serie_producto_ibfk_2 FOREIGN KEY (producto_id)    REFERENCES producto    (id),
  CONSTRAINT serie_producto_ibfk_3 FOREIGN KEY (zona_bodega_id) REFERENCES zona_bodega (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- movimiento_inventario  — historial operativo de recepciones, traslados y despachos
-- ----------------------------------------------------------------------------
CREATE TABLE movimiento_inventario (
  id                    BIGINT        NOT NULL AUTO_INCREMENT,
  empresa_id            BIGINT        NOT NULL,
  usuario_id            BIGINT        NOT NULL,
  tipo                  VARCHAR(30)   NOT NULL,
  producto_id           BIGINT        NOT NULL,
  cantidad              DECIMAL(18,6) NOT NULL,
  presentacion_id       BIGINT        DEFAULT NULL,
  venta_por_presentacion TINYINT(1)   NOT NULL DEFAULT 0,
  zona_origen_id        BIGINT        DEFAULT NULL,
  zona_destino_id       BIGINT        DEFAULT NULL,
  documento_tipo        VARCHAR(50)   DEFAULT NULL,
  documento_folio       VARCHAR(100)  DEFAULT NULL,
  observaciones         TEXT,
  creado_at             TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  activo                TINYINT(1)    NOT NULL DEFAULT 1,
  serie_id              BIGINT        DEFAULT NULL,
  PRIMARY KEY (id),
  KEY usuario_id      (usuario_id),
  KEY presentacion_id (presentacion_id),
  KEY zona_origen_id  (zona_origen_id),
  KEY zona_destino_id (zona_destino_id),
  KEY serie_id        (serie_id),
  KEY idx_mov_inv_empresa_fecha (empresa_id, creado_at),
  KEY idx_mov_inv_producto      (producto_id),
  CONSTRAINT movimiento_inventario_ibfk_1 FOREIGN KEY (empresa_id)       REFERENCES empresa              (id),
  CONSTRAINT movimiento_inventario_ibfk_2 FOREIGN KEY (usuario_id)       REFERENCES usuario              (id),
  CONSTRAINT movimiento_inventario_ibfk_3 FOREIGN KEY (producto_id)      REFERENCES producto             (id),
  CONSTRAINT movimiento_inventario_ibfk_4 FOREIGN KEY (presentacion_id)  REFERENCES producto_presentacion(id),
  CONSTRAINT movimiento_inventario_ibfk_5 FOREIGN KEY (zona_origen_id)   REFERENCES zona_bodega          (id),
  CONSTRAINT movimiento_inventario_ibfk_6 FOREIGN KEY (zona_destino_id)  REFERENCES zona_bodega          (id),
  CONSTRAINT fk_mov_inv_serie             FOREIGN KEY (serie_id)         REFERENCES serie_producto       (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- moneda / tipo_cambio_historico
-- ----------------------------------------------------------------------------
CREATE TABLE moneda (
  codigo    CHAR(3)      NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  simbolo   VARCHAR(10)  DEFAULT NULL,
  decimales TINYINT      NOT NULL DEFAULT 2,
  activo    TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tipo_cambio_historico (
  id             BIGINT        NOT NULL AUTO_INCREMENT,
  empresa_id     BIGINT        NOT NULL,
  moneda_origen  CHAR(3)       NOT NULL,
  moneda_destino CHAR(3)       NOT NULL,
  tasa           DECIMAL(18,8) NOT NULL,
  vigente_desde  DATETIME      NOT NULL,
  vigente_hasta  DATETIME      DEFAULT NULL,
  documento_tipo VARCHAR(50)   DEFAULT NULL,
  documento_id   BIGINT        DEFAULT NULL,
  creado_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tc_empresa_vigencia (empresa_id, moneda_origen, moneda_destino, vigente_desde),
  CONSTRAINT fk_tc_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- soporte / centro de ayuda
-- ----------------------------------------------------------------------------
CREATE TABLE estado_ticket (
  id          INT          NOT NULL AUTO_INCREMENT,
  codigo      VARCHAR(30)  NOT NULL,
  nombre      VARCHAR(80)  NOT NULL,
  es_abierto  TINYINT(1)   NOT NULL DEFAULT 1,
  orden_flujo INT          NOT NULL DEFAULT 0,
  activo      TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_ticket_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tipo_solicitud (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id     BIGINT       NOT NULL,
  tipo_padre_id  BIGINT       DEFAULT NULL,
  codigo         VARCHAR(50)  NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  orden          INT          NOT NULL DEFAULT 0,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipo_solicitud_empresa_codigo (empresa_id, codigo),
  KEY idx_tipo_solicitud_padre (tipo_padre_id),
  CONSTRAINT fk_tipo_solicitud_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_tipo_solicitud_padre FOREIGN KEY (tipo_padre_id) REFERENCES tipo_solicitud (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ticket (
  id                   BIGINT       NOT NULL AUTO_INCREMENT,
  empresa_id           BIGINT       NOT NULL,
  usuario_id           BIGINT       NOT NULL,
  tipo_solicitud_id    BIGINT       NOT NULL,
  estado_ticket_id     INT          NOT NULL,
  asunto               VARCHAR(160) NOT NULL,
  asignado_usuario_id  BIGINT       DEFAULT NULL,
  nombre_solicitante   VARCHAR(255) NOT NULL,
  nombre_empresa       VARCHAR(255) NOT NULL,
  creado_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cerrado_at           DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_ticket_empresa_estado_creado (empresa_id, estado_ticket_id, creado_at),
  KEY idx_ticket_usuario_creado (usuario_id, creado_at),
  CONSTRAINT fk_ticket_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
  CONSTRAINT fk_ticket_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT fk_ticket_tipo FOREIGN KEY (tipo_solicitud_id) REFERENCES tipo_solicitud (id),
  CONSTRAINT fk_ticket_estado FOREIGN KEY (estado_ticket_id) REFERENCES estado_ticket (id),
  CONSTRAINT fk_ticket_asignado FOREIGN KEY (asignado_usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ticket_mensaje (
  id         BIGINT   NOT NULL AUTO_INCREMENT,
  ticket_id  BIGINT   NOT NULL,
  usuario_id BIGINT   DEFAULT NULL,
  es_sistema TINYINT(1) NOT NULL DEFAULT 0,
  cuerpo     TEXT     NOT NULL,
  creado_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ticket_mensaje_ticket_creado (ticket_id, creado_at),
  CONSTRAINT fk_ticket_mensaje_ticket FOREIGN KEY (ticket_id) REFERENCES ticket (id),
  CONSTRAINT fk_ticket_mensaje_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO moneda (codigo, nombre, simbolo, decimales) VALUES
  ('CLP', 'Peso chileno',        '$', 0),
  ('MXN', 'Peso mexicano',       '$', 2),
  ('USD', 'Dólar estadounidense','$', 2),
  ('EUR', 'Euro',                '€', 2);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- SECCIÓN 3 — DATOS SEMILLA (RBAC empresa 1)
-- Estos datos son necesarios para que el sistema arranque correctamente.
-- Ajusta el email del superadmin antes de ejecutar.
-- =============================================================================

-- Empresa maestra base (ajusta codigo/nombre/rut según tu organización)
INSERT INTO empresa (id, codigo, razon_social, esta_activa, es_empresa_maestra, activo)
VALUES (1, 'EMP001', 'Empresa Principal', 1, 1, 1)
ON DUPLICATE KEY UPDATE es_empresa_maestra = 1, activo = 1;

-- Permisos completos para empresa 1
INSERT INTO permiso (empresa_id, codigo, descripcion, activo) VALUES
(1, 'usuarios.leer',                    'Ver usuarios', 1),
(1, 'usuarios.crear',                   'Crear usuarios', 1),
(1, 'usuarios.editar',                  'Editar usuarios', 1),
(1, 'usuarios.eliminar',                'Eliminar usuarios', 1),
(1, 'empresas.leer',                    'Ver empresas', 1),
(1, 'empresas.crear',                   'Crear empresas', 1),
(1, 'empresas.editar',                  'Editar empresas', 1),
(1, 'empresas.eliminar',                'Eliminar empresas', 1),
(1, 'cargos.leer',                      'Ver cargos', 1),
(1, 'cargos.crear',                     'Crear cargos', 1),
(1, 'cargos.editar',                    'Editar cargos', 1),
(1, 'cargos.eliminar',                  'Eliminar cargos', 1),
(1, 'roles.leer',                       'Ver roles', 1),
(1, 'roles.crear',                      'Crear roles', 1),
(1, 'roles.editar',                     'Editar roles', 1),
(1, 'roles.eliminar',                   'Eliminar roles', 1),
(1, 'permisos.leer',                    'Ver permisos', 1),
(1, 'permisos.crear',                   'Crear permisos', 1),
(1, 'permisos.editar',                  'Editar permisos', 1),
(1, 'permisos.eliminar',                'Eliminar permisos', 1),
(1, 'bodegas.leer',                     'Ver bodegas', 1),
(1, 'bodegas.crear',                    'Crear bodegas', 1),
(1, 'bodegas.editar',                   'Editar bodegas', 1),
(1, 'bodegas.eliminar',                 'Eliminar bodegas', 1),
(1, 'productos.leer',                   'Ver productos', 1),
(1, 'productos.crear',                  'Crear productos', 1),
(1, 'productos.editar',                 'Editar productos', 1),
(1, 'productos.eliminar',               'Eliminar productos', 1),
(1, 'productos.importar',               'Importar productos desde Excel', 1),
(1, 'unidades_medida.leer',             'Ver unidades de medida', 1),
(1, 'unidades_medida.crear',            'Crear unidades de medida', 1),
(1, 'unidades_medida.editar',           'Editar unidades de medida', 1),
(1, 'unidades_medida.eliminar',         'Eliminar unidades de medida', 1),
(1, 'tipos_zona.leer',                  'Ver tipos de zona', 1),
(1, 'tipos_zona.crear',                 'Crear tipos de zona', 1),
(1, 'tipos_zona.editar',                'Editar tipos de zona', 1),
(1, 'tipos_zona.eliminar',              'Eliminar tipos de zona', 1),
(1, 'zonas_bodega.leer',                'Ver zonas de bodega', 1),
(1, 'zonas_bodega.crear',               'Crear zonas de bodega', 1),
(1, 'zonas_bodega.editar',              'Editar zonas de bodega', 1),
(1, 'zonas_bodega.eliminar',            'Eliminar zonas de bodega', 1),
(1, 'tipos_producto.leer',              'Ver tipos de producto', 1),
(1, 'tipos_producto.crear',             'Crear tipos de producto', 1),
(1, 'tipos_producto.editar',            'Editar tipos de producto', 1),
(1, 'tipos_producto.eliminar',          'Eliminar tipos de producto', 1),
(1, 'producto_presentacion.leer',       'Ver presentaciones de producto', 1),
(1, 'producto_presentacion.crear',      'Crear presentaciones de producto', 1),
(1, 'producto_presentacion.editar',     'Editar presentaciones de producto', 1),
(1, 'producto_presentacion.eliminar',   'Eliminar presentaciones de producto', 1),
(1, 'inventario.leer',                  'Ver stock y movimientos de inventario', 1),
(1, 'inventario.recepcionar',           'Registrar recepciones de mercancía', 1),
(1, 'inventario.trasladar',             'Trasladar stock entre ubicaciones', 1),
(1, 'inventario.despachar',             'Registrar despachos de mercancía', 1),
(1, 'inventario.configurar',            'Configurar zona de recepción por bodega', 1),
(1, 'tickets.crear',                    'Crear tickets de ayuda', 1),
(1, 'tickets.leer',                     'Ver tickets de ayuda', 1),
(1, 'tickets.responder',                'Responder en el chat de un ticket', 1),
(1, 'tickets.gestionar',                'Gestionar la mesa de ayuda (empresa maestra)', 1)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), activo = 1;

-- Roles operativos (empresa 1)
INSERT INTO rol (empresa_id, nombre, descripcion, activo)
SELECT 1, nombre, descripcion, 1 FROM (
  SELECT 'Administrador'       AS nombre, 'Acceso completo al WMS'                AS descripcion UNION ALL
  SELECT 'Recepción',                     'Operaciones de recepción en bodega'                   UNION ALL
  SELECT 'Despacho',                      'Operaciones de despacho en bodega'                    UNION ALL
  SELECT 'Consulta Inventario',           'Solo lectura de catálogo e inventario'                UNION ALL
  SELECT 'Inventario Completo',           'Gestión completa de catálogo e inventario'
) t
WHERE NOT EXISTS (SELECT 1 FROM rol r WHERE r.empresa_id = 1 AND r.nombre = t.nombre);

-- Administrador → todos los permisos
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r
INNER JOIN permiso p ON p.empresa_id = r.empresa_id AND p.activo = 1
WHERE r.empresa_id = 1 AND r.nombre = 'Administrador';

-- Recepción → permisos de recepción
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Recepción'
  AND p.codigo IN ('bodegas.leer','zonas_bodega.leer','tipos_zona.leer',
                   'productos.leer','inventario.leer','inventario.recepcionar','inventario.configurar',
                   'tickets.crear','tickets.leer','tickets.responder');

-- Despacho → permisos de despacho
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Despacho'
  AND p.codigo IN ('bodegas.leer','zonas_bodega.leer','tipos_zona.leer',
                   'productos.leer','inventario.leer','inventario.despachar',
                   'tickets.crear','tickets.leer','tickets.responder');

-- Consulta Inventario → solo lectura
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Consulta Inventario'
  AND p.codigo IN ('productos.leer','unidades_medida.leer','tipos_producto.leer',
                   'producto_presentacion.leer','bodegas.leer','tipos_zona.leer',
                   'zonas_bodega.leer','inventario.leer',
                   'tickets.crear','tickets.leer','tickets.responder');

-- Inventario Completo → CRUD catálogo + inventario
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id, activo)
SELECT r.id, p.id, 1
FROM rol r INNER JOIN permiso p ON p.empresa_id = r.empresa_id
WHERE r.empresa_id = 1 AND r.nombre = 'Inventario Completo'
  AND p.codigo IN (
    'productos.leer','productos.crear','productos.editar','productos.eliminar','productos.importar',
    'unidades_medida.leer','unidades_medida.crear','unidades_medida.editar','unidades_medida.eliminar',
    'tipos_producto.leer','tipos_producto.crear','tipos_producto.editar','tipos_producto.eliminar',
    'producto_presentacion.leer','producto_presentacion.crear','producto_presentacion.editar','producto_presentacion.eliminar',
    'bodegas.leer','bodegas.crear','bodegas.editar','bodegas.eliminar',
    'tipos_zona.leer','tipos_zona.crear','tipos_zona.editar','tipos_zona.eliminar',
    'zonas_bodega.leer','zonas_bodega.crear','zonas_bodega.editar','zonas_bodega.eliminar',
    'inventario.leer','inventario.recepcionar','inventario.trasladar','inventario.despachar','inventario.configurar',
    'tickets.crear','tickets.leer','tickets.responder'
  );

INSERT INTO estado_ticket (codigo, nombre, es_abierto, orden_flujo, activo) VALUES
  ('en_proceso', 'En proceso', 1, 1, 1),
  ('cerrado', 'Cerrado', 0, 2, 1);

INSERT INTO tipo_solicitud (empresa_id, tipo_padre_id, codigo, nombre, orden, activo) VALUES
  (1, NULL, 'post_venta', 'Post-venta', 1, 1),
  (1, NULL, 'error', 'Error', 2, 1),
  (1, NULL, 'consulta', 'Consulta', 3, 1),
  (1, NULL, 'otro', 'Otro', 4, 1);

INSERT INTO tipo_solicitud (empresa_id, tipo_padre_id, codigo, nombre, orden, activo)
SELECT 1, padre.id, t.codigo, t.nombre, t.orden, 1
FROM tipo_solicitud padre
INNER JOIN (
  SELECT 'error_acceso' AS codigo, 'Acceso' AS nombre, 1 AS orden UNION ALL
  SELECT 'error_inventario', 'Inventario', 2 UNION ALL
  SELECT 'error_catalogo', 'Catálogo', 3 UNION ALL
  SELECT 'error_otro', 'Otro', 4
) t
WHERE padre.empresa_id = 1 AND padre.codigo = 'error';

-- =============================================================================
-- SECCIÓN 4 — SCRIPT POST-INSTALACIÓN
-- Crea el primer usuario superadmin de la empresa maestra.
--
-- Contraseña por defecto: WmsAdmin1!
-- Hash bcrypt generado con app.core.security.hash_password("WmsAdmin1!")
--
-- ⚠  IMPORTANTE: cambia la contraseña al primer inicio de sesión.
--    Puedes regenerar el hash con:
--      python -c "from app.core.security import hash_password; print(hash_password('TuNuevaContrasena'))"
-- =============================================================================

-- Ajusta el email del superadmin antes de ejecutar:
SET @admin_email    = 'admin@emp001.cl';
SET @admin_password = '$2b$12$0/lqdpkIi7fAT2Hz/2raT.9EYEJpsLxyNc.SkP1obKA7pdmMh4p2O';

-- Crear usuario superadmin (idempotente)
INSERT INTO usuario (empresa_id, email, password_hash, activo)
SELECT 1, @admin_email, @admin_password, 1
WHERE NOT EXISTS (
    SELECT 1 FROM usuario WHERE empresa_id = 1 AND email = @admin_email
);

-- Asignar rol Administrador
INSERT IGNORE INTO usuario_rol (usuario_id, rol_id, activo)
SELECT u.id, r.id, 1
FROM usuario u
INNER JOIN rol r ON r.empresa_id = u.empresa_id AND r.nombre = 'Administrador' AND r.activo = 1
WHERE u.email = @admin_email AND u.empresa_id = 1;

-- Verificación (debe mostrar el usuario y sus permisos)
SELECT
    u.email,
    e.razon_social AS empresa,
    r.nombre AS rol,
    COUNT(DISTINCT p.codigo) AS permisos_efectivos
FROM usuario u
INNER JOIN empresa e ON e.id = u.empresa_id
INNER JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
INNER JOIN rol r ON r.id = ur.rol_id AND r.activo = 1
INNER JOIN rol_permiso rp ON rp.rol_id = r.id AND rp.activo = 1
INNER JOIN permiso p ON p.id = rp.permiso_id AND p.activo = 1
WHERE u.email = @admin_email
GROUP BY u.email, e.razon_social, r.nombre;

-- =============================================================================
-- NOTAS PARA EMPRESAS ADICIONALES
-- Las empresas nuevas creadas desde la API reciben automáticamente:
--   • Catálogo RBAC copiado desde empresa 1
--   • Usuario admin@{codigo_empresa} con contraseña WmsAdmin1! (temporal)
-- No es necesario ejecutar pasos manuales adicionales.
-- =============================================================================
