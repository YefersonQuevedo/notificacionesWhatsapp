// Migración inicial - Crea todas las tablas del sistema
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tabla Empresas
    await queryInterface.createTable('empresas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ruc: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: true
      },
      telefono_whatsapp: {
        type: Sequelize.STRING(20),
        allowNull: true
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

    // 2. Tabla Usuarios
    await queryInterface.createTable('usuarios', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      rol: {
        type: Sequelize.ENUM('admin', 'operador', 'viewer'),
        defaultValue: 'operador'
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

    // 3. Tabla Clientes
    await queryInterface.createTable('clientes', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cedula: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      tipo_documento: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: 'CC'
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

    // Índice único para cedula + empresa
    await queryInterface.addIndex('clientes', ['cedula', 'empresa_id'], {
      unique: true,
      name: 'unique_cedula_empresa'
    });

    await queryInterface.addIndex('clientes', ['empresa_id']);

    // 4. Tabla Vehículos
    await queryInterface.createTable('vehiculos', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      placa: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      fecha_compra_soat: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_vencimiento_soat: {
        type: Sequelize.DATEONLY,
        allowNull: false
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

    // Índices para vehículos
    await queryInterface.addIndex('vehiculos', ['placa', 'empresa_id'], {
      unique: true,
      name: 'unique_placa_empresa'
    });
    await queryInterface.addIndex('vehiculos', ['empresa_id']);
    await queryInterface.addIndex('vehiculos', ['cliente_id']);
    await queryInterface.addIndex('vehiculos', ['fecha_vencimiento_soat']);

    // 5. Tabla Notificaciones
    await queryInterface.createTable('notificaciones', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      vehiculo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vehiculos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo_recordatorio: {
        type: Sequelize.ENUM('30_dias', '15_dias', '7_dias', '5_dias', '1_dia'),
        allowNull: false
      },
      fecha_programada: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_envio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      enviado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mensaje_enviado: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Índices para notificaciones
    await queryInterface.addIndex('notificaciones', ['empresa_id', 'fecha_programada', 'enviado'], {
      name: 'idx_empresa_fecha_enviado'
    });
    await queryInterface.addIndex('notificaciones', ['vehiculo_id']);

    // 6. Tabla Datos Brutos (CSV completo)
    await queryInterface.createTable('datos_brutos', {
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
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fecha_registro: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      item: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fact: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      tipo_doc: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      num_doc: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      tipo_cliente: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      telefonos: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      placa: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      credito: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      bancos: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      efectivo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      total: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      sicov: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      recaudo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      ansv: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      costos_total: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      convenios: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      n_pin_adquirido: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      gastos: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      referidos: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      archivo_origen: {
        type: Sequelize.STRING(255),
        allowNull: true
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

    // Índices para datos brutos
    await queryInterface.addIndex('datos_brutos', ['empresa_id']);
    await queryInterface.addIndex('datos_brutos', ['fecha_registro']);
    await queryInterface.addIndex('datos_brutos', ['num_doc']);
    await queryInterface.addIndex('datos_brutos', ['placa']);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar tablas en orden inverso (por las foreign keys)
    await queryInterface.dropTable('notificaciones');
    await queryInterface.dropTable('datos_brutos');
    await queryInterface.dropTable('vehiculos');
    await queryInterface.dropTable('clientes');
    await queryInterface.dropTable('usuarios');
    await queryInterface.dropTable('empresas');
  }
};
