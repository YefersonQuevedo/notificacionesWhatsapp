import { useState, useEffect } from 'react';
import { mensajeTemplatesAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { MessageSquare, Save, Info } from 'lucide-react';

const TIPOS_CONFIG = [
  { key: '30_dias', label: '30 días antes', color: 'bg-blue-100 text-blue-700' },
  { key: '15_dias', label: '15 días antes', color: 'bg-green-100 text-green-700' },
  { key: '7_dias', label: '7 días antes', color: 'bg-yellow-100 text-yellow-700' },
  { key: '5_dias', label: '5 días antes', color: 'bg-orange-100 text-orange-700' },
  { key: '1_dia', label: '1 día antes', color: 'bg-red-100 text-red-700' }
];

export default function ConfigMensajes() {
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    cargarTemplates();
  }, []);

  const cargarTemplates = async () => {
    try {
      setLoading(true);
      const response = await mensajeTemplatesAPI.listar();

      // Convertir array a objeto con tipo_recordatorio como key
      const templatesObj = {};
      response.data.forEach(t => {
        templatesObj[t.tipo_recordatorio] = t.template;
      });

      setTemplates(templatesObj);
    } catch (error) {
      console.error('Error cargando templates:', error);
      toast.error('Error cargando plantillas de mensajes');
    } finally {
      setLoading(false);
    }
  };

  const guardarTemplate = async (tipo_recordatorio) => {
    try {
      setSaving(tipo_recordatorio);
      await mensajeTemplatesAPI.actualizar(tipo_recordatorio, templates[tipo_recordatorio]);
      toast.success('Plantilla guardada correctamente');
    } catch (error) {
      console.error('Error guardando template:', error);
      toast.error('Error guardando plantilla');
    } finally {
      setSaving(null);
    }
  };

  const actualizarTemplate = (tipo_recordatorio, valor) => {
    setTemplates(prev => ({
      ...prev,
      [tipo_recordatorio]: valor
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando plantillas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Configurar Mensajes de Recordatorio</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Variables disponibles:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-blue-100 px-1 rounded">{'{nombre}'}</code> - Nombre del cliente</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{placa}'}</code> - Placa del vehículo</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{dias}'}</code> - Número de días restantes</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{diasTexto}'}</code> - Texto descriptivo (ej: "vence en 5 días", "vence HOY", "vence MAÑANA")</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{fecha}'}</code> - Fecha de vencimiento (dd/mm/yyyy)</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{urgencia}'}</code> - Emoji de urgencia (🔴 ⚠️)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {TIPOS_CONFIG.map(({ key, label, color }) => (
          <div key={key} className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm ${color} mr-2`}>
                  {label}
                </span>
              </h2>
              <button
                onClick={() => guardarTemplate(key)}
                disabled={saving === key}
                className="btn btn-primary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving === key ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            <textarea
              value={templates[key] || ''}
              onChange={(e) => actualizarTemplate(key, e.target.value)}
              rows={4}
              className="input w-full font-mono text-sm"
              placeholder="Escribe tu mensaje aquí..."
            />

            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs text-gray-600 mb-1 font-semibold">Vista previa:</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {(templates[key] || '')
                  .replace('{nombre}', 'Juan Pérez')
                  .replace('{placa}', 'ABC123')
                  .replace('{dias}', key === '30_dias' ? '30' : key === '15_dias' ? '15' : key === '7_dias' ? '7' : key === '5_dias' ? '5' : '1')
                  .replace('{diasTexto}', key === '1_dia' ? 'vence MAÑANA' : `vence en ${key.replace('_dias', '')} días`)
                  .replace('{fecha}', '15/11/2025')
                  .replace('{urgencia}', key === '1_dia' || key === '5_dias' ? '🔴 ' : key === '7_dias' ? '⚠️ ' : '')
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Los cambios en las plantillas se aplicarán a los próximos mensajes enviados.
          Los mensajes ya enviados no se verán afectados.
        </p>
      </div>
    </div>
  );
}
