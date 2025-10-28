import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Vehiculo = sequelize.define('Vehiculo', {
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
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  fecha_compra_soat: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_vencimiento_soat: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'vehiculos',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['placa', 'empresa_id'],
      name: 'unique_placa_empresa'
    },
    {
      fields: ['empresa_id']
    },
    {
      fields: ['cliente_id']
    },
    {
      fields: ['fecha_vencimiento_soat']
    }
  ]
});

export default Vehiculo;
