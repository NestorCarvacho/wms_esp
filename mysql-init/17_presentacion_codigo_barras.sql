-- Código de barras por presentación de producto
-- Permite escanear cualquier EAN (unidad, caja, display, pallet) y resolver producto + factor

-- === BLOQUE 1: campo codigo_barras en producto_presentacion ===
ALTER TABLE producto_presentacion
  ADD COLUMN codigo_barras VARCHAR(100) NULL AFTER nombre;

-- === BLOQUE 2: índice para búsqueda rápida por escaneo ===
-- No es UNIQUE global: multi-tenant permite el mismo EAN en distintas empresas.
-- La unicidad por empresa se valida en capa de aplicación.
CREATE INDEX idx_presentacion_barcode ON producto_presentacion (codigo_barras);
