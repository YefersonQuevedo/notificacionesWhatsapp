import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const MensajeTemplate = sequelize.define('MensajeTemplate', {
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
  tipo_recordatorio: {
    type: DataTypes.ENUM('30_dias', '15_dias', '7_dias', '5_dias', '1_dia'),
    allowNull: false
  },
  template: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Plantilla del mensaje. Variables: {nombre}, {placa}, {dias}, {diasTexto}, {fecha}, {urgencia}'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'mensaje_templates',
  underscored: true,
  timestamps: true
});

export default MensajeTemplate;
