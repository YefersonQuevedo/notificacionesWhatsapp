import { parse } from 'csv-parse';
import fs from 'fs';
import { Cliente, Vehiculo, DatoBruto } from '../models/associations.js';
import sequelize from '../models/index.js';

// Función para parsear fecha en formato DD/MM/YYYY
function parsearFecha(fechaStr) {
  if (!fechaStr || fechaStr.trim() === '') return null;

  const partes = fechaStr.split('/');
  if (partes.length !== 3) return null;

  const dia = parseInt(partes[0]);
  const mes = parseInt(partes[1]);
  const anio = parseInt(partes[2]);

  if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null;

  return new Date(anio, mes - 1, dia);
}

// Calcular fecha de vencimiento SOAT (1 año después, considerando bisiestos)
function calcularVencimientoSoat(fechaCompra) {
  if (!fechaCompra) return null;

  const fecha = new Date(fechaCompra);
  const anioSiguiente = fecha.getFullYear() + 1;
  const mes = fecha.getMonth();
  const dia = fecha.getDate();

  // Manejar 29 de febrero en año bisiesto
  if (mes === 1 && dia === 29 && !esBisiesto(anioSiguiente)) {
    return new Date(anioSiguiente, 1, 28);
  }

  return new Date(anioSiguiente, mes, dia);
}

function esBisiesto(anio) {
  return (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
}

// Limpiar valores del CSV
function limpiarValor(valor) {
  if (!valor) return null;
  return valor.trim() === '' ? null : valor.trim();
}

// Validar si una línea es un registro válido (no es resumen ni línea vacía)
function esRegistroValido(registro) {
  // Verificar que tenga al menos fecha, cédula y placa
  // NOTA: trim: true en el parser elimina espacios de los headers
  const cedula = limpiarValor(registro['NUM. DOC']);
  const placa = limpiarValor(registro['PLACA']); // Sin espacio después de trim
  const fecha = limpiarValor(registro['ITEM']);
  const nombre = limpiarValor(registro['TIPO DE CLIENTE']);

  // Si no tiene cédula, placa o nombre, es probablemente un resumen o línea vacía
  if (!cedula || !placa || !nombre) return false;

  // Verificar que la cédula tenga formato válido (números o alfanumérico, mínimo 5 caracteres)
  // Relajamos la validación para aceptar placas que a veces aparecen en el campo cédula
  const cedulaLimpia = cedula.replace(/\s/g, '');
  if (cedulaLimpia.length < 5) return false;

  // Verificar que la placa tenga formato válido (letras y números, 5-6 caracteres)
  if (!/^[A-Z0-9]{5,6}$/i.test(placa.replace(/\s/g, ''))) return false;

  // Verificar que la fecha tenga formato válido DD/MM/YYYY
  if (fecha && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) return false;

  return true;
}

export async function importarCSV(rutaArchivo, empresaId, nombreArchivo) {
  const transaction = await sequelize.transaction();

  try {
    const registros = [];
    const registrosDuplicados = [];
    const registrosNuevos = [];

    // Leer y parsear CSV
    const contenido = fs.readFileSync(rutaArchivo, { encoding: 'latin1' });

    await new Promise((resolve, reject) => {
      parse(contenido, {
        delimiter: ';',
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, datos) => {
        if (err) reject(err);
        else {
          registros.push(...datos);
          resolve();
        }
      });
    });

    console.log(`Total de registros en CSV: ${registros.length}`);

    let clientesCreados = 0;
    let vehiculosCreados = 0;
    let datosRawCreados = 0;
    let lineasIgnoradas = 0;

    for (const registro of registros) {
      // Validar si es un registro válido (no es resumen ni línea vacía)
      if (!esRegistroValido(registro)) {
        lineasIgnoradas++;
        continue;
      }

      const cedula = limpiarValor(registro['NUM. DOC']);
      const placa = limpiarValor(registro['PLACA']); // Sin espacio después de trim
      const fechaStr = limpiarValor(registro['ITEM']);

      // Guardar datos brutos completos
      // NOTA: trim: true en el parser elimina espacios de los headers
      const datoBruto = {
        empresa_id: empresaId,
        fecha_registro: parsearFecha(fechaStr),
        item: fechaStr,
        fact: limpiarValor(registro['FACT']),
        tipo_doc: limpiarValor(registro['TIPO DOC']),
        num_doc: cedula,
        tipo_cliente: limpiarValor(registro['TIPO DE CLIENTE']),
        telefonos: limpiarValor(registro['TELEFONOS']),
        placa: placa,
        credito: limpiarValor(registro['CREDITO']),
        bancos: limpiarValor(registro['BANCOS']),
        efectivo: limpiarValor(registro['EFECTIVO']),
        total: limpiarValor(registro['TOTAL']),
        sicov: limpiarValor(registro['SICOV']),
        recaudo: limpiarValor(registro['RECAUDO']),
        ansv: limpiarValor(registro['ANSV']),
        costos_total: limpiarValor(registro['COSTOS TOTAL']),
        convenios: limpiarValor(registro['CONVENIOS']),
        n_pin_adquirido: limpiarValor(registro['N°PIN ADQUIRIDO']),
        gastos: limpiarValor(registro['GASTOS']),
        observaciones: limpiarValor(registro['OBSERVACIONES']),
        referidos: limpiarValor(registro['REFERIDOS']),
        archivo_origen: nombreArchivo
      };

      // Verificar si ya existe este registro exacto
      const existeDatoBruto = await DatoBruto.findOne({
        where: {
          empresa_id: empresaId,
          num_doc: cedula,
          placa: placa,
          fecha_registro: datoBruto.fecha_registro
        },
        transaction
      });

      if (!existeDatoBruto) {
        await DatoBruto.create(datoBruto, { transaction });
        datosRawCreados++;
      }

      // Procesar cliente y vehículo si hay datos válidos
      if (cedula && placa && fechaStr) {
        const nombreCliente = limpiarValor(registro['TIPO DE CLIENTE']);
        const telefono = limpiarValor(registro['TELEFONOS']);
        const tipoDoc = limpiarValor(registro['TIPO DOC']) || 'CC';
        const fechaCompra = parsearFecha(fechaStr);

        if (!nombreCliente || !fechaCompra) continue;

        // Buscar o crear cliente
        let cliente = await Cliente.findOne({
          where: {
            empresa_id: empresaId,
            cedula: cedula
          },
          transaction
        });

        if (!cliente) {
          cliente = await Cliente.create({
            empresa_id: empresaId,
            cedula: cedula,
            nombre: nombreCliente,
            telefono: telefono,
            tipo_documento: tipoDoc
          }, { transaction });
          clientesCreados++;
        }

        // Buscar o crear vehículo
        const vehiculoExistente = await Vehiculo.findOne({
          where: {
            empresa_id: empresaId,
            placa: placa
          },
          transaction
        });

        if (!vehiculoExistente) {
          const fechaVencimiento = calcularVencimientoSoat(fechaCompra);

          await Vehiculo.create({
            empresa_id: empresaId,
            cliente_id: cliente.id,
            placa: placa,
            fecha_compra_soat: fechaCompra,
            fecha_vencimiento_soat: fechaVencimiento,
            activo: true
          }, { transaction });

          vehiculosCreados++;
          registrosNuevos.push({ cedula, placa, fechaCompra: fechaStr });
        } else {
          registrosDuplicados.push({ cedula, placa });
        }
      }
    }

    await transaction.commit();

    console.log(`Líneas ignoradas (resúmenes/vacías): ${lineasIgnoradas}`);

    return {
      success: true,
      totalRegistros: registros.length,
      lineasValidas: registros.length - lineasIgnoradas,
      lineasIgnoradas,
      clientesCreados,
      vehiculosCreados,
      datosRawCreados,
      duplicados: registrosDuplicados.length,
      registrosNuevos,
      registrosDuplicados
    };

  } catch (error) {
    await transaction.rollback();
    console.error('Error importando CSV:', error);
    throw error;
  }
}
