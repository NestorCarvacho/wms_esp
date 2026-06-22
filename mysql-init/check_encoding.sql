-- El acento 'ó' debería ser C3B3 en UTF-8 (pos 8 en 'Recepción')
SELECT nombre, HEX(SUBSTR(nombre, 8, 1)) as hex_char8 FROM rol WHERE id = 3;
