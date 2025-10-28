import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, User, Phone, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientesAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, cliente: null });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    cargarClientes();
  }, [pagination.page, search]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesAPI.listar({
        page: pagination.page,
        limit: 20,
        search
      });
      setClientes(response.data.clientes);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      toast.error('Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    cargarClientes();
  };

  const abrirModalCrear = () => {
    setEditingCliente(null);
    reset({
      cedula: '',
      nombre: '',
      telefono: '',
      tipo_documento: 'CC'
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (cliente) => {
    setEditingCliente(cliente);
    reset({
      cedula: cliente.cedula,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      tipo_documento: cliente.tipo_documento
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingCliente) {
        await clientesAPI.actualizar(editingCliente.id, data);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientesAPI.crear(data);
        toast.success('Cliente creado correctamente');
      }
      setModalOpen(false);
      cargarClientes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error guardando cliente');
    }
  };

  const confirmarEliminar = (cliente) => {
    setDeleteDialog({ open: true, cliente });
  };

  const eliminarCliente = async () => {
    try {
      await clientesAPI.eliminar(deleteDialog.cliente.id);
      toast.success('Cliente eliminado correctamente');
      setDeleteDialog({ open: false, cliente: null });
      cargarClientes();
    } catch (error) {
      toast.error('Error eliminando cliente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona la base de datos de clientes</p>
        </div>
        <button onClick={abrirModalCrear} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o teléfono..."
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
            Total: {pagination.total} clientes
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Cargando...</div>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">No hay clientes registrados</p>
            <button onClick={abrirModalCrear} className="btn btn-primary mt-4">
              Crear primer cliente
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Tipo Doc</th>
                    <th className="table-header">Cédula</th>
                    <th className="table-header">Nombre</th>
                    <th className="table-header">Teléfono</th>
                    <th className="table-header">Vehículos</th>
                    <th className="table-header">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="table-cell">{cliente.tipo_documento}</td>
                      <td className="table-cell font-medium">{cliente.cedula}</td>
                      <td className="table-cell">{cliente.nombre}</td>
                      <td className="table-cell">
                        {cliente.telefono ? (
                          <a href={`https://wa.me/${cliente.telefono}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {cliente.telefono}
                          </a>
                        ) : (
                          <span className="text-gray-400">Sin teléfono</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {cliente.vehiculos?.length || 0}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => abrirModalEditar(cliente)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmarEliminar(cliente)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select {...register('tipo_documento')} className="input">
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="NIT">NIT</option>
              <option value="PP">Pasaporte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Documento *
            </label>
            <input
              type="text"
              {...register('cedula', { required: 'La cédula es requerida' })}
              className="input"
              placeholder="1234567890"
              disabled={!!editingCliente}
            />
            {errors.cedula && (
              <p className="text-red-500 text-sm mt-1">{errors.cedula.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              {...register('nombre', { required: 'El nombre es requerido' })}
              className="input"
              placeholder="Juan Pérez"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (con código país)
            </label>
            <input
              type="text"
              {...register('telefono')}
              className="input"
              placeholder="573001234567"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: 573001234567 (para WhatsApp)
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
              {editingCliente ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, cliente: null })}
        onConfirm={eliminarCliente}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar a ${deleteDialog.cliente?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
