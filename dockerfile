# 1. Usar una imagen oficial de Python 3.12 ligera
FROM python:3.12-slim

# 2. Configurar variables de entorno para Python
# Previene que Python genere archivos .pyc y asegura que los logs se emitan sin buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Establecer el directorio de trabajo
WORKDIR /app

# 4. Instalar dependencias del sistema necesarias para MySQL y compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 5. Instalar dependencias de la aplicación
# Se copian primero los requerimientos para aprovechar la caché de capas de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copiar el resto del código de la aplicación
COPY . .

# 7. Crear un usuario no privilegiado por seguridad
RUN adduser --disabled-password --gecos "" wmsuser
RUN chown -R wmsuser:wmsuser /app
USER wmsuser

# 8. Exponer el puerto en el que corre FastAPI
EXPOSE 8000

# 9. Comando para iniciar la aplicación usando Uvicorn
# Se asume que el punto de entrada es main.py y la instancia de FastAPI se llama 'app'
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]