# Comandos Simples para el Servidor

Abre una terminal en el servidor y ejecuta estos comandos **uno por uno**, copiando y pegando:

## 1. Configurar DNS

```bash
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 8.8.4.4" >> /etc/resolv.conf'
cat /etc/resolv.conf
```

## 2. Verificar que funciona

```bash
ping -c 2 8.8.8.8
ping -c 2 google.com
```

## 3. Instalar PM2

```bash
sudo npm install -g pm2
pm2 --version
```

## 4. Instalar todo lo demás (un solo comando)

```bash
sudo apt update && sudo apt install -y mysql-server nginx chromium-browser build-essential python3 rsync
```

## 5. Habilitar servicios

```bash
sudo systemctl enable mysql nginx
sudo systemctl start mysql nginx
```

## 6. Configurar MySQL

```bash
sudo mysql -u root
```

**Dentro de MySQL, copia y pega todo esto:**

```sql
CREATE DATABASE soat_reminders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tecnomecanica'@'localhost' IDENTIFIED BY 'cIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4';
GRANT ALL PRIVILEGES ON soat_reminders.* TO 'tecnomecanica'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 7. Verificar que MySQL funciona

```bash
mysql -u tecnomecanica -pcIY7T70ls1w8KRYDP5lwMqvK4RR98PEQTQdbYfmazr4 -e "SHOW DATABASES;"
```

Deberías ver `soat_reminders` en la lista.

## 8. Crear directorio

```bash
mkdir -p ~/tecnomecanica
```

---

## ✅ Cuando termines

Escribe "listo" y ejecutaré el deployment automáticamente desde aquí.
