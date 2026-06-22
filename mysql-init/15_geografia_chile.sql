-- =============================================================================
-- 15_geografia_chile.sql
-- Tablas normalizadas de geografía de Chile: región, ciudad, comuna
-- Idempotente: usa CREATE TABLE IF NOT EXISTS e INSERT IGNORE
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLAS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS region (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(5)   NOT NULL UNIQUE,
  activo TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ciudad (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  region_id INT NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  activo    TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_ciudad_region (region_id),
  FOREIGN KEY (region_id) REFERENCES region(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comuna (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  region_id INT NOT NULL,
  ciudad_id INT NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  activo    TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_comuna_region (region_id),
  INDEX idx_comuna_ciudad (ciudad_id),
  FOREIGN KEY (region_id) REFERENCES region(id),
  FOREIGN KEY (ciudad_id) REFERENCES ciudad(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

-- ---------------------------------------------------------------------------
-- MIGRAR perfil_usuario: agregar FKs, mantener columna direccion (texto libre)
-- ---------------------------------------------------------------------------
ALTER TABLE perfil_usuario
  ADD COLUMN region_id INT NULL,
  ADD COLUMN ciudad_id INT NULL,
  ADD COLUMN comuna_id INT NULL,
  ADD CONSTRAINT fk_perfil_region FOREIGN KEY (region_id) REFERENCES region(id),
  ADD CONSTRAINT fk_perfil_ciudad FOREIGN KEY (ciudad_id) REFERENCES ciudad(id),
  ADD CONSTRAINT fk_perfil_comuna FOREIGN KEY (comuna_id) REFERENCES comuna(id);

-- ---------------------------------------------------------------------------
-- MIGRAR empresa: agregar campos de dirección
-- ---------------------------------------------------------------------------
ALTER TABLE empresa
  ADD COLUMN direccion VARCHAR(255) NULL,
  ADD COLUMN region_id INT NULL,
  ADD COLUMN ciudad_id INT NULL,
  ADD COLUMN comuna_id INT NULL,
  ADD CONSTRAINT fk_empresa_region FOREIGN KEY (region_id) REFERENCES region(id),
  ADD CONSTRAINT fk_empresa_ciudad FOREIGN KEY (ciudad_id) REFERENCES ciudad(id),
  ADD CONSTRAINT fk_empresa_comuna FOREIGN KEY (comuna_id) REFERENCES comuna(id);

-- ---------------------------------------------------------------------------
-- MIGRAR bodega: agregar campos de dirección
-- ---------------------------------------------------------------------------
ALTER TABLE bodega
  ADD COLUMN direccion VARCHAR(255) NULL,
  ADD COLUMN region_id INT NULL,
  ADD COLUMN ciudad_id INT NULL,
  ADD COLUMN comuna_id INT NULL,
  ADD CONSTRAINT fk_bodega_region FOREIGN KEY (region_id) REFERENCES region(id),
  ADD CONSTRAINT fk_bodega_ciudad FOREIGN KEY (ciudad_id) REFERENCES ciudad(id),
  ADD CONSTRAINT fk_bodega_comuna FOREIGN KEY (comuna_id) REFERENCES comuna(id);
