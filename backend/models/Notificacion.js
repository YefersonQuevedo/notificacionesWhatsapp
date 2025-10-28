import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Notificacion = sequelize.define('Notificacion', {
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
  vehiculo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vehiculos',
      key: 'id'
    }
  },
  tipo_recordatorio: {
    type: DataTypes.ENUM('30_dias', '15_dias', '7_dias', '5_dias', '1_dia'),
    allowNull: false
  },
  fecha_programada: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_envio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  enviado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mensaje_enviado: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'notificaciones',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['empresa_id', 'fecha_programada', 'enviado'],
      name: 'idx_empresa_fecha_enviado'
    },
    {
      fields: ['vehiculo_id']
    }
  ]
});

export default Notificacion;
