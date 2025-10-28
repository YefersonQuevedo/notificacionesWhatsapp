import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { importAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Importar() {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Solo se permiten archivos CSV');
        return;
      }
      setArchivo(file);
      setResultado(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setArchivo(file);
      setResultado(null);
    } else {
      toast.error('Solo se permiten archivos CSV');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleImportar = async () => {
    if (!archivo) {
      toast.error('Selecciona un archivo primero');
      return;
    }

    setCargando(true);
    try {
      const response = await importAPI.subirCSV(archivo);
      setResultado(response.data);
      toast.success('Archivo importado exitosamente!');
      setArchivo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error importando archivo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Importar CSV</h1>
        <p className="text-gray-500 mt-1">
          Carga archivos CSV para agregar clientes y vehículos automáticamente
        </p>
      </div>

      {/* Zona de carga */}
      <div className="card">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            archivo ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />

          {!archivo ? (
            <>
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Arrastra tu archivo CSV aquí
              </p>
              <p className="text-sm text-gray-500 mb-4">o</p>
              <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
                Seleccionar Archivo
              </label>
            </>
          ) : (
            <>
              <FileText className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">{archivo.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                {(archivo.size / 1024).toFixed(2)} KB
              </p>
              <div className="space-x-2">
                <button onClick={handleImportar} disabled={cargando} className="btn btn-primary">
                  {cargando ? 'Importando...' : 'Importar Ahora'}
                </button>
                <button
                  onClick={() => {
                    setArchivo(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Formato del CSV:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Separador: punto y coma (;)</li>
            <li>Columnas: ITEM (fecha), NUM. DOC (cédula), TIPO DE CLIENTE (nombre), PLACA, TELEFONOS</li>
            <li>Los registros duplicados (misma cédula y placa) serán omitidos automáticamente</li>
            <li>La fecha de vencimiento del SOAT se calculará automáticamente (1 año después)</li>
          </ul>
        </div>
      </div>

      {/* Resultado de importación */}
      {resultado && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
            Resultado de la Importación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Líneas CSV</p>
              <p className="text-3xl font-bold text-blue-900">{resultado.totalRegistros}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Líneas Válidas</p>
              <p className="text-3xl font-bold text-indigo-900">{resultado.lineasValidas}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Líneas Ignoradas</p>
              <p className="text-3xl font-bold text-gray-900">{resultado.lineasIgnoradas || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Resúmenes/vacías</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Clientes Creados</p>
              <p className="text-3xl font-bold text-green-900">{resultado.clientesCreados}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Vehículos Creados</p>
              <p className="text-3xl font-bold text-green-900">{resultado.vehiculosCreados}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Datos Raw Guardados</p>
              <p className="text-3xl font-bold text-purple-900">{resultado.datosRawCreados}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Duplicados Omitidos</p>
              <p className="text-3xl font-bold text-yellow-900">{resultado.duplicados}</p>
            </div>
          </div>

          {resultado.duplicados > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Registros Duplicados</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Se omitieron {resultado.duplicados} registros porque ya existían en la base de datos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
