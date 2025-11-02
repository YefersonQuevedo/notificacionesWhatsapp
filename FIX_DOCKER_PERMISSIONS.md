# Arreglar Permisos de Docker

Ejecuta esto EN EL SERVIDOR:

```bash
# 1. Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# 2. Aplicar los cambios (sin cerrar sesión)
newgrp docker

# 3. Verificar
docker ps

# 4. Levantar la aplicación
cd ~/tecnomecanica
docker compose up -d --build
```

Si funciona, debería mostrar los contenedores levantándose.

## Luego ejecutar migraciones:

```bash
cd ~/tecnomecanica

# Esperar 20 segundos a que MySQL esté listo
sleep 20

# Ejecutar migraciones
docker compose exec app npx sequelize-cli db:migrate
docker compose exec app npx sequelize-cli db:seed:all
```

## Ver el resultado:

```bash
# Ver contenedores
docker compose ps

# Ver logs
docker compose logs -f app
```

La aplicación estará disponible en:
- http://192.168.1.63
- http://tecnomecanica.ilyforge.com

Usuario: admin@admin.com
Password: admin123
