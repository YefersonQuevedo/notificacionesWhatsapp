# Multi-stage build para optimizar el tamaño de la imagen

# Etapa 1: Construir el frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copiar package.json raíz y del frontend
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Instalar dependencias
RUN npm install && cd frontend && npm install

# Copiar código fuente del frontend
COPY frontend/ ./frontend/

# Construir el frontend para producción
RUN cd frontend && npm run build

# Etapa 2: Imagen de producción
FROM node:22-alpine

# Instalar curl para healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Copiar package.json raíz
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar código fuente del backend
COPY backend/ ./backend/

# Copiar el frontend construido desde la etapa anterior
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Crear directorio para archivos temporales de WhatsApp
RUN mkdir -p /app/backend/.wwebjs_auth /app/backend/.wwebjs_cache && \
    chown -R node:node /app

# Cambiar al usuario node (no root)
USER node

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Comando para iniciar la aplicación
WORKDIR /app/backend
CMD ["node", "server.js"]
