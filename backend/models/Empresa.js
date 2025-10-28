import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ruc: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  telefono_whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'empresas',
  timestamps: true,
  underscored: true
});

export default Empresa;
