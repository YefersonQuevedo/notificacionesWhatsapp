import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const dbConfig = require('../config/database.cjs');

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a MySQL establecida correctamente');
  } catch (error) {
    console.error('✗ Error conectando a MySQL:', error.message);
    process.exit(1);
  }
};

export { sequelize, testConnection };
export default sequelize;
