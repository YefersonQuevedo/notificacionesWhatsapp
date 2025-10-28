const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear empresa demo
    await queryInterface.bulkInsert('empresas', [{
      id: 1,
      nombre: 'Grupo Cardeñoza',
      ruc: '900123456-1',
      telefono_whatsapp: '573001234567',
      activo: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Crear usuario admin demo (password: admin123)
    const passwordHash = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('usuarios', [{
      empresa_id: 1,
      email: 'admin@demo.com',
      password_hash: passwordHash,
      nombre: 'Administrador Demo',
      rol: 'admin',
      activo: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    console.log('✓ Empresa demo creada');
    console.log('✓ Usuario: admin@demo.com');
    console.log('✓ Contraseña: admin123');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@demo.com' });
    await queryInterface.bulkDelete('empresas', { ruc: '900123456-1' });
  }
};
