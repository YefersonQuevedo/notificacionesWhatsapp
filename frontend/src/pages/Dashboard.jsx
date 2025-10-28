import { useEffect, useState } from 'react';
import { AlertCircle, Car, Users, Calendar, TrendingUp } from 'lucide-react';
import { vehiculosAPI, clientesAPI } from '../services/api';
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

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [vehiculosRes, clientesRes, proximosRes] = await Promise.all([
        vehiculosAPI.listar({ limit: 1 }),
        clientesAPI.listar({ limit: 1 }),
        vehiculosAPI.proximosVencer()
      ]);

      setStats({
        totalClientes: clientesRes.data.total,
        totalVehiculos: vehiculosRes.data.total,
        proximosVencer: proximosRes.data
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
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Calendar className="mr-2 h-6 w-6 text-primary-600" />
          SOAT Próximos a Vencer (30 días)
        </h2>

        {stats.proximosVencer.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay vehículos con SOAT próximo a vencer
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.proximosVencer.map((vehiculo) => {
                  const diasRestantes = differenceInDays(
                    new Date(vehiculo.fecha_vencimiento_soat),
                    new Date()
                  );

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
