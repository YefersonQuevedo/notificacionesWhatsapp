import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Car, Calendar, AlertCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehiculosAPI, clientesAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { format, differenceInDays } from 'date-fns';

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, vehiculo: null });

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    cargarVehiculos();
    cargarClientesParaSelect();
  }, [pagination.page, search]);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      const response = await vehiculosAPI.listar({
        page: pagination.page,
        limit: 20,
        search
      });
      setVehiculos(response.data.vehiculos);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      toast.error('Error cargando vehículos');
    } finally {
      setLoading(false);
    }
  };

  const cargarClientesParaSelect = async () => {
    try {
      const response = await clientesAPI.listar({ limit: 1000 });
      setClientes(response.data.clientes);
    } catch (error) {
      console.error('Error cargando clientes');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    cargarVehiculos();
  };

  const abrirModalCrear = () => {
    setEditingVehiculo(null);
    reset({
      placa: '',
      cliente_id: '',
      fecha_compra_soat: '',
      fecha_vencimiento_soat: '',
      activo: true
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (vehiculo) => {
    setEditingVehiculo(vehiculo);
    reset({
      placa: vehiculo.placa,
      cliente_id: vehiculo.cliente_id || '',
      fecha_compra_soat: vehiculo.fecha_compra_soat,
      fecha_vencimiento_soat: vehiculo.fecha_vencimiento_soat,
      activo: vehiculo.activo
    });
    setModalOpen(true);
  };

  const calcularFechaVencimiento = (fechaCompra) => {
    if (!fechaCompra) return '';
    const fecha = new Date(fechaCompra);
    fecha.setFullYear(fecha.getFullYear() + 1);
    return fecha.toISOString().split('T')[0];
  };

  const onSubmit = async (data) => {
    try {
      // Si no se especificó fecha de vencimiento, calcularla automáticamente
      if (!data.fecha_vencimiento_soat && data.fecha_compra_soat) {
        data.fecha_vencimiento_soat = calcularFechaVencimiento(data.fecha_compra_soat);
      }

      if (editingVehiculo) {
        await vehiculosAPI.actualizar(editingVehiculo.id, data);
        toast.success('Vehículo actualizado correctamente');
      } else {
        await vehiculosAPI.crear(data);
        toast.success('Vehículo creado correctamente');
      }
      setModalOpen(false);
      cargarVehiculos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error guardando vehículo');
    }
  };

  const confirmarEliminar = (vehiculo) => {
    setDeleteDialog({ open: true, vehiculo });
  };

  const eliminarVehiculo = async () => {
    try {
      await vehiculosAPI.eliminar(deleteDialog.vehiculo.id);
      toast.success('Vehículo eliminado correctamente');
      setDeleteDialog({ open: false, vehiculo: null });
      cargarVehiculos();
    } catch (error) {
      toast.error('Error eliminando vehículo');
    }
  };

  const getUrgenciaColor = (dias) => {
    if (dias < 0) return 'bg-red-100 text-red-800';
    if (dias <= 7) return 'bg-orange-100 text-orange-800';
    if (dias <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getUrgenciaTexto = (dias) => {
    if (dias < 0) return 'VENCIDO';
    if (dias === 0) return 'HOY';
    if (dias === 1) return 'MAÑANA';
    if (dias <= 30) return `${dias} días`;
    return 'OK';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-500 mt-1">Gestiona los vehículos y sus SOAT</p>
        </div>
        <button onClick={abrirModalCrear} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Vehículo
        </button>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Total: {pagination.total} vehículos
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Cargando...</div>
          </div>
        ) : vehiculos.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">No hay vehículos registrados</p>
            <button onClick={abrirModalCrear} className="btn btn-primary mt-4">
              Crear primer vehículo
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Placa</th>
                    <th className="table-header">Cliente</th>
                    <th className="table-header">Compra SOAT</th>
                    <th className="table-header">Vencimiento SOAT</th>
                    <th className="table-header">Estado</th>
                    <th className="table-header">Urgencia</th>
                    <th className="table-header">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehiculos.map((vehiculo) => {
                    const diasRestantes = differenceInDays(
                      new Date(vehiculo.fecha_vencimiento_soat),
                      new Date()
                    );

                    return (
                      <tr key={vehiculo.id} className="hover:bg-gray-50">
                        <td className="table-cell font-bold text-lg">{vehiculo.placa}</td>
                        <td className="table-cell">
                          {vehiculo.cliente ? (
                            <div>
                              <p className="font-medium">{vehiculo.cliente.nombre}</p>
                              <p className="text-xs text-gray-500">{vehiculo.cliente.cedula}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              Sin cliente
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          {format(new Date(vehiculo.fecha_compra_soat), 'dd/MM/yyyy')}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {format(new Date(vehiculo.fecha_vencimiento_soat), 'dd/MM/yyyy')}
                          </div>
                        </td>
                        <td className="table-cell">
                          {vehiculo.activo ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getUrgenciaColor(diasRestantes)}`}>
                            {diasRestantes < 0 && <AlertCircle className="h-3 w-3 mr-1" />}
                            {getUrgenciaTexto(diasRestantes)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => abrirModalEditar(vehiculo)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => confirmarEliminar(vehiculo)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-gray-700">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placa *
            </label>
            <input
              type="text"
              {...register('placa', {
                required: 'La placa es requerida',
                pattern: {
                  value: /^[A-Z0-9]{5,6}$/i,
                  message: 'Formato de placa inválido (ej: ABC123)'
                }
              })}
              className="input uppercase"
              placeholder="ABC123"
              maxLength={6}
              disabled={!!editingVehiculo}
            />
            {errors.placa && (
              <p className="text-red-500 text-sm mt-1">{errors.placa.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente (opcional)
            </label>
            <select {...register('cliente_id')} className="input">
              <option value="">Sin cliente asignado</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.cedula}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Puedes asignar un cliente después
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Compra SOAT *
              </label>
              <input
                type="date"
                {...register('fecha_compra_soat', { required: 'Fecha requerida' })}
                className="input"
                onChange={(e) => {
                  const fechaVencimiento = calcularFechaVencimiento(e.target.value);
                  setValue('fecha_vencimiento_soat', fechaVencimiento);
                }}
              />
              {errors.fecha_compra_soat && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_compra_soat.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Vencimiento *
              </label>
              <input
                type="date"
                {...register('fecha_vencimiento_soat', { required: 'Fecha requerida' })}
                className="input"
              />
              {errors.fecha_vencimiento_soat && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_vencimiento_soat.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Se calcula automáticamente
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('activo')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Vehículo activo
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Nota:</strong> Al guardar este vehículo, se crearán automáticamente
              recordatorios para: 30, 15, 7, 5 y 1 día antes del vencimiento.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingVehiculo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, vehiculo: null })}
        onConfirm={eliminarVehiculo}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de que deseas eliminar el vehículo ${deleteDialog.vehiculo?.placa}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
