#!/usr/bin/env node

// Script para generar secretos seguros para producción
// Uso: node generate-secrets.js

import crypto from 'crypto';

console.log('\n===========================================');
console.log('  Generador de Secretos para Producción');
console.log('===========================================\n');

// Generar JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET (copia esto en .env):');
console.log(jwtSecret);

// Generar password seguro para MySQL
const dbPassword = crypto.randomBytes(32).toString('base64').replace(/[\/\+\=]/g, '');
console.log('\nDB_PASSWORD sugerido (para MySQL):');
console.log(dbPassword);

console.log('\n===========================================');
console.log('Instrucciones:');
console.log('===========================================');
console.log('1. Copia el JWT_SECRET y pégalo en backend/.env.production');
console.log('2. Usa el DB_PASSWORD al crear el usuario MySQL');
console.log('3. También pega el DB_PASSWORD en backend/.env.production');
console.log('\nComando MySQL para crear usuario:');
console.log(`CREATE USER 'tecnomecanica'@'localhost' IDENTIFIED BY '${dbPassword}';`);
console.log(`GRANT ALL PRIVILEGES ON soat_reminders.* TO 'tecnomecanica'@'localhost';`);
console.log('FLUSH PRIVILEGES;\n');
