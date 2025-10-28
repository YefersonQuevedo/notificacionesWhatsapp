import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const DatoBruto = sequelize.define('DatoBruto', {
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
  fecha_registro: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  item: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fact: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tipo_doc: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  num_doc: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tipo_cliente: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefonos: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  placa: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  credito: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bancos: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  efectivo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  total: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  sicov: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  recaudo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ansv: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  costos_total: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  convenios: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  n_pin_adquirido: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gastos: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referidos: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  archivo_origen: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'datos_brutos',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['empresa_id']
    },
    {
      fields: ['fecha_registro']
    },
    {
      fields: ['num_doc']
    },
    {
      fields: ['placa']
    }
  ]
});

export default DatoBruto;
