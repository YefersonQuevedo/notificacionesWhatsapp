'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('mensaje_templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresas',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tipo_recordatorio: {
        type: Sequelize.ENUM('30_dias', '15_dias', '7_dias', '5_dias', '1_dia'),
        allowNull: false
      },
      template: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Plantilla del mensaje. Variables: {nombre}, {placa}, {dias}, {diasTexto}, {fecha}, {urgencia}'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índice único para empresa_id + tipo_recordatorio
    await queryInterface.addIndex('mensaje_templates', ['empresa_id', 'tipo_recordatorio'], {
      unique: true,
      name: 'unique_empresa_tipo'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('mensaje_templates');
  }
};
