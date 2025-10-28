import { useEffect, useState } from 'react';
import { AlertCircle, Car, Users, Calendar, Send, CheckCircle, Clock } from 'lucide-react';
import { vehiculosAPI, clientesAPI, whatsappAPI } from '../services/api';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalVehiculos: 0,
    proximosVencer: []
  });
  const [loading, setLoading] = useState(true);
  const [diasFiltro, setDiasFiltro] = useState(30);
  const [enviandoRecordatorio, setEnviandoRecordatorio] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [diasFiltro]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [vehiculosRes, clientesRes, proximosRes] = await Promise.all([
        vehiculosAPI.listar({ limit: 1 }),
        clientesAPI.listar({ limit: 1 }),
        vehiculosAPI.proximosVencer(diasFiltro)
      ]);

      setStats({
        totalClientes: clientesRes.data.total,
        totalVehiculos: vehiculosRes.data.total,
        proximosVencer: proximosRes.data.vehiculos || proximosRes.data
      });
    } catch (error) {
      toast.error('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getUrgenciaColor = (dias) => {
    if (dias <= 1) return 'bg-red-100 text-red-800';
    if (dias <= 7) return 'bg-orange-100 text-orange-800';
    if (dias <= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const enviarRecordatorioManual = async (vehiculoId) => {
    try {
      setEnviandoRecordatorio(vehiculoId);
      await whatsappAPI.enviarRecordatorio(vehiculoId);
      toast.success('Recordatorio enviado exitosamente');
      await cargarDatos(); // Recargar datos para actualizar estado
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error enviando recordatorio');
    } finally {
      setEnviandoRecordatorio(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de tu sistema de recordatorios</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Clientes</p>
              <p className="text-2xl font-bold">{stats.totalClientes}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Car className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Vehículos</p>
              <p className="text-2xl font-bold">{stats.totalVehiculos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Próximos a Vencer</p>
              <p className="text-2xl font-bold">{stats.proximosVencer.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehículos próximos a vencer */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-primary-600" />
            Tecnomecánicas Próximas a Vencer
          </h2>

          {/* Selector de días */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 font-medium">Ver próximos:</label>
            <select
              value={diasFiltro}
              onChange={(e) => setDiasFiltro(parseInt(e.target.value))}
              className="input py-2 px-3 w-32"
            >
              <option value="7">7 días</option>
              <option value="15">15 días</option>
              <option value="30">30 días</option>
              <option value="60">60 días</option>
              <option value="90">90 días</option>
              <option value="180">6 meses</option>
              <option value="365">1 año</option>
            </select>
          </div>
        </div>

        {stats.proximosVencer.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay vehículos con tecnomecánica próxima a vencer en los próximos {diasFiltro} días
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Placa</th>
                  <th className="table-header">Cliente</th>
                  <th className="table-header">Fecha Vencimiento</th>
                  <th className="table-header">Días Restantes</th>
                  <th className="table-header">Urgencia</th>
                  <th className="table-header">Estado Notificación</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Último Envío</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.proximosVencer.map((vehiculo) => {
                  const diasRestantes = differenceInDays(
                    new Date(vehiculo.fecha_vencimiento_soat),
                    new Date()
                  );

                  const ultimaNotificacion = vehiculo.notificaciones?.[0];
                  const tieneCliente = vehiculo.cliente && vehiculo.cliente.telefono;

                  return (
                    <tr key={vehiculo.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{vehiculo.placa}</td>
                      <td className="table-cell">{vehiculo.cliente?.nombre || 'Sin cliente'}</td>
                      <td className="table-cell">
                        {format(new Date(vehiculo.fecha_vencimiento_soat), 'dd/MM/yyyy')}
                      </td>
                      <td className="table-cell">{diasRestantes} días</td>
                      <td className="table-cell">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgenciaColor(diasRestantes)}`}>
                          {diasRestantes <= 1 ? 'URGENTE' : diasRestantes <= 7 ? 'Alta' : diasRestantes <= 15 ? 'Media' : 'Baja'}
                        </span>
                      </td>
                      <td className="table-cell">
                        {ultimaNotificacion?.enviado ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Enviado
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        {ultimaNotificacion ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ultimaNotificacion.tipo_recordatorio === 'manual'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ultimaNotificacion.tipo_recordatorio === 'manual' ? 'Manual' : 'Automático'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {ultimaNotificacion?.fecha_envio ? (
                          <span className="text-sm text-gray-600">
                            {format(new Date(ultimaNotificacion.fecha_envio), 'dd/MM/yyyy HH:mm')}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => enviarRecordatorioManual(vehiculo.id)}
                          disabled={!tieneCliente || enviandoRecordatorio === vehiculo.id}
                          className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                            !tieneCliente
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                          title={!tieneCliente ? 'Cliente sin teléfono' : 'Enviar recordatorio manual'}
                        >
                          <Send className="h-4 w-4" />
                          <span>
                            {enviandoRecordatorio === vehiculo.id ? 'Enviando...' : 'Enviar'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
