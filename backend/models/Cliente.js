import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'id'
    }
  },
  cedula: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tipo_documento: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'CC'
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['cedula', 'empresa_id'],
      name: 'unique_cedula_empresa'
    },
    {
      fields: ['empresa_id']
    }
  ]
});

export default Cliente;
