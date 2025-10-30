-- Script para recrear tabla empresas
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS empresas;

CREATE TABLE empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  ruc VARCHAR(50) UNIQUE,
  telefono_whatsapp VARCHAR(20),
  activo TINYINT(1) DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar empresa por defecto
INSERT INTO empresas (id, nombre, ruc, telefono_whatsapp, activo)
VALUES (1, 'Grupo Cardeñoza', '123456789', NULL, 1);

SET FOREIGN_KEY_CHECKS=1;

-- Verificar
SELECT * FROM empresas;
