# Migración Railway — Pasos individuales

Ejecutar **uno a la vez** en el panel Query de Railway (o en un cliente MySQL).

---

## PASO 1 — Tabla región

```sql
CREATE TABLE IF NOT EXISTS region (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(5)   NOT NULL UNIQUE,
  activo TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## PASO 2 — Tabla ciudad

```sql
CREATE TABLE IF NOT EXISTS ciudad (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  region_id INT NOT NULL,
  nombre    VARCHAR(100) NOT NULL,
  activo    TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_ciudad_region (region_id),
  FOREIGN KEY (region_id) REFERENCES region(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## PASO 3 — Tabla comuna

```sql
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
```

---

## PASO 4 — Columnas geográficas en perfil_usuario

```sql
ALTER TABLE perfil_usuario
  ADD COLUMN IF NOT EXISTS region_id INT NULL,
  ADD COLUMN IF NOT EXISTS ciudad_id INT NULL,
  ADD COLUMN IF NOT EXISTS comuna_id INT NULL;
```

---

## PASO 5 — Columnas geográficas en empresa

```sql
ALTER TABLE empresa
  ADD COLUMN IF NOT EXISTS region_id INT NULL,
  ADD COLUMN IF NOT EXISTS ciudad_id INT NULL,
  ADD COLUMN IF NOT EXISTS comuna_id INT NULL,
  ADD COLUMN IF NOT EXISTS direccion VARCHAR(255) NULL;
```

---

## PASO 6 — Columnas geográficas en bodega

```sql
ALTER TABLE bodega
  ADD COLUMN IF NOT EXISTS region_id INT NULL,
  ADD COLUMN IF NOT EXISTS ciudad_id INT NULL,
  ADD COLUMN IF NOT EXISTS comuna_id INT NULL,
  ADD COLUMN IF NOT EXISTS direccion VARCHAR(255) NULL;
```

---

## PASO 7 — Campos empresa (razon_social y contacto)

> ⚠️ Si la columna `nombre` ya fue renombrada, omitir el CHANGE y ejecutar solo el ADD.

```sql
ALTER TABLE empresa
  CHANGE COLUMN nombre razon_social VARCHAR(255) NOT NULL;
```

```sql
ALTER TABLE empresa
  ADD COLUMN IF NOT EXISTS nombre_fantasia VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS giro            VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS telefono        VARCHAR(30)  NULL,
  ADD COLUMN IF NOT EXISTS correo          VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS sitio_web       VARCHAR(255) NULL;
```

---

## PASO 8 — Corregir encoding en tabla rol

```sql
UPDATE rol SET nombre = 'Recepción', descripcion = 'Operaciones de recepción en bodega' WHERE nombre LIKE 'Recepci%n';
```

```sql
UPDATE rol SET descripcion = 'Solo lectura de catálogo e inventario' WHERE nombre = 'Consulta Inventario';
```

```sql
UPDATE rol SET descripcion = 'Gestión completa de catálogo e inventario' WHERE nombre = 'Inventario Completo';
```

---

## PASO 9 — Insertar datos geográficos

Copiar y ejecutar el bloque de `INSERT IGNORE INTO region ...` del archivo `15_geografia_chile.sql` (líneas 40–57), luego los de `ciudad` y `comuna`.

> **Tip:** Con un cliente MySQL (TablePlus, DBeaver, MySQL Workbench) puedes ejecutar el archivo completo `15_geografia_chile.sql` directamente sin dividirlo.
