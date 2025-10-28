import { useState, useEffect } from 'react';
import { Database, Search, FileText, Calendar, TrendingUp, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { datosBrutosAPI } from '../services/api';

export default function DatosBrutos() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [archivo, setArchivo] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [datoDetalle, setDatoDetalle] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarArchivos();
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [page, search, archivo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await datosBrutosAPI.listar({
        page,
        limit: 50,
        search,
        archivo
      });
      setDatos(response.data.datos);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarArchivos = async () => {
    try {
      const response = await datosBrutosAPI.archivos();
      setArchivos(response.data);
    } catch (error) {
      console.error('Error cargando archivos');
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await datosBrutosAPI.estadisticas();
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas');
    }
  };

  const verDetalle = async (id) => {
    try {
      const response = await datosBrutosAPI.obtener(id);
      setDatoDetalle(response.data);
      setModalAbierto(true);
    } catch (error) {
      toast.error('Error cargando detalle');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  const formatearMoneda = (valor) => {
    if (!valor) return '';
    return valor.replace('$', '').trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Datos Brutos</h1>
        <p className="text-gray-500 mt-1">
          Visualiza todos los datos importados desde archivos CSV
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Registros</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {estadisticas.total.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Database className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Archivos Importados</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {estadisticas.porArchivo.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Filtrado Actual</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {total.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por cédula, nombre, placa o teléfono..."
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo
            </label>
            <select
              value={archivo}
              onChange={(e) => {
                setArchivo(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">Todos los archivos</option>
              {archivos.map((arch) => (
                <option key={arch} value={arch}>
                  {arch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Cargando datos...</div>
            </div>
          ) : datos.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron datos</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {datos.map((dato) => (
                    <tr key={dato.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearFecha(dato.fecha_registro)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{dato.num_doc}</div>
                          <div className="text-xs text-gray-500">{dato.tipo_doc}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dato.tipo_cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dato.placa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dato.telefonos || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearMoneda(dato.total || '')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={dato.archivo_origen}>
                          {dato.archivo_origen}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => verDetalle(dato.id)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(page - 1) * 50 + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(page * 50, total)}
                  </span>{' '}
                  de <span className="font-medium">{total}</span> registros
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {modalAbierto && datoDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalle del Registro</h2>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.item || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Factura</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.fact || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tipo Documento</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.tipo_doc || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Número Documento</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.num_doc || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Cliente</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.tipo_cliente || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Teléfonos</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.telefonos || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Placa</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{datoDetalle.placa || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Crédito</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.credito || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Bancos</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.bancos || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Efectivo</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.efectivo || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total</label>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">{datoDetalle.total || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">SICOV</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.sicov || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Recaudo</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.recaudo || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">ANSV</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.ansv || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Costos Total</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.costos_total || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Convenios</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.convenios || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">N° PIN Adquirido</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.n_pin_adquirido || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gastos</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.gastos || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Observaciones</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.observaciones || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Referidos</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.referidos || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Archivo Origen</label>
                  <p className="mt-1 text-sm text-gray-900">{datoDetalle.archivo_origen || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setModalAbierto(false)}
                className="btn btn-secondary w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
