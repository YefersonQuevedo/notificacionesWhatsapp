import Empresa from './Empresa.js';
import Usuario from './Usuario.js';
import Cliente from './Cliente.js';
import Vehiculo from './Vehiculo.js';
import Notificacion from './Notificacion.js';
import DatoBruto from './DatoBruto.js';

// Empresa -> Usuarios
Empresa.hasMany(Usuario, { foreignKey: 'empresa_id', as: 'usuarios' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Empresa -> Clientes
Empresa.hasMany(Cliente, { foreignKey: 'empresa_id', as: 'clientes' });
Cliente.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Empresa -> Vehiculos
Empresa.hasMany(Vehiculo, { foreignKey: 'empresa_id', as: 'vehiculos' });
Vehiculo.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Cliente -> Vehiculos
Cliente.hasMany(Vehiculo, { foreignKey: 'cliente_id', as: 'vehiculos' });
Vehiculo.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Vehiculo -> Notificaciones
Vehiculo.hasMany(Notificacion, { foreignKey: 'vehiculo_id', as: 'notificaciones' });
Notificacion.belongsTo(Vehiculo, { foreignKey: 'vehiculo_id', as: 'vehiculo' });

// Empresa -> Notificaciones
Empresa.hasMany(Notificacion, { foreignKey: 'empresa_id', as: 'notificaciones' });
Notificacion.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Empresa -> DatosBrutos
Empresa.hasMany(DatoBruto, { foreignKey: 'empresa_id', as: 'datos_brutos' });
DatoBruto.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

export {
  Empresa,
  Usuario,
  Cliente,
  Vehiculo,
  Notificacion,
  DatoBruto
};
