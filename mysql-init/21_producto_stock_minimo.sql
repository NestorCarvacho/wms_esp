-- Umbral de stock crítico por producto (zona de origen tras despacho)
-- === BLOQUE 1 (ignorar "Duplicate column" si ya existe) ===
ALTER TABLE producto ADD COLUMN stock_minimo DECIMAL(18, 6) NULL;
