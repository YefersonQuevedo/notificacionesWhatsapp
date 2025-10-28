import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MessageCircle, Smartphone, Send, Power, PowerOff, Bell, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { whatsappAPI } from '../services/api';

export default function WhatsApp() {
  const [estado, setEstado] = useState({ conectado: false, qrCode: null });
  const [loading, setLoading] = useState(true);
  const [conectando, setConectando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    cargarEstado();
    // Polling cada 5 segundos para actualizar estado
    const interval = setInterval(cargarEstado, 5000);
    return () => clearInterval(interval);
  }, []);

  const cargarEstado = async () => {
    try {
      const response = await whatsappAPI.obtenerEstado();
      console.log('📊 Estado WhatsApp:', response.data);
      setEstado(response.data);
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
    } finally {
      setLoading(false);
    }
  };

  const conectar = async () => {
    try {
      setConectando(true);
      console.log('🔌 Iniciando conexión WhatsApp...');
      const response = await whatsappAPI.conectar();
      console.log('✓ Respuesta del servidor:', response.data);
      toast.success(response.data.message || 'Proceso de conexión iniciado. El código QR aparecerá en unos segundos.');
      setTimeout(cargarEstado, 2000);
    } catch (error) {
      console.error('❌ Error completo:', error.response || error);
      const errorMsg = error.response?.data?.error || error.message || 'Error iniciando conexión';
      toast.error(errorMsg);
    } finally {
      setConectando(false);
    }
  };

  const desconectar = async () => {
    try {
      await whatsappAPI.desconectar();
      toast.success('WhatsApp desconectado');
      cargarEstado();
    } catch (error) {
      toast.error('Error desconectando');
    }
  };

  const onSubmitTest = async (data) => {
    try {
      setEnviando(true);
      await whatsappAPI.enviarTest(data.numero, data.mensaje);
      toast.success('Mensaje enviado correctamente');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error enviando mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const enviarNotificacionesManual = async () => {
    try {
      await whatsappAPI.enviarNotificaciones();
      toast.success('Proceso de envío iniciado. Los mensajes se enviarán en segundo plano.');
    } catch (error) {
      toast.error('Error iniciando envío');
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp</h1>
        <p className="text-gray-500 mt-1">Gestiona la conexión y envío de mensajes</p>
      </div>

      {/* Estado de conexión */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${estado.conectado ? 'bg-green-100' : 'bg-red-100'}`}>
              <Smartphone className={`h-8 w-8 ${estado.conectado ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Estado de Conexión</h2>
              <p className={`text-sm ${estado.conectado ? 'text-green-600' : 'text-red-600'}`}>
                {estado.conectado ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Conectado y listo para enviar mensajes
                  </span>
                ) : (
                  <span className="flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Desconectado - Necesitas escanear código QR
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {!estado.conectado ? (
              <button
                onClick={conectar}
                disabled={conectando}
                className="btn btn-primary flex items-center"
              >
                <Power className="h-5 w-5 mr-2" />
                {conectando ? 'Conectando...' : 'Conectar'}
              </button>
            ) : (
              <button
                onClick={desconectar}
                className="btn btn-danger flex items-center"
              >
                <PowerOff className="h-5 w-5 mr-2" />
                Desconectar
              </button>
            )}
          </div>
        </div>

        {!estado.conectado && estado.qrCodeDataURL && (
          <div className="bg-white border-2 border-green-300 rounded-lg p-6">
            <div className="flex items-center justify-center mb-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <h3 className="font-bold text-gray-900 text-lg">¡Código QR Listo!</h3>
            </div>
            <p className="text-center text-gray-600 mb-4">Escanea este código QR con WhatsApp</p>
            <div className="flex justify-center mb-4">
              <img
                src={estado.qrCodeDataURL}
                alt="Código QR de WhatsApp"
                className="border-4 border-green-400 rounded-lg shadow-xl"
                style={{ width: '300px', height: '300px' }}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Abre WhatsApp en tu teléfono</li>
                <li>Ve a Menú (⋮) &gt; Dispositivos vinculados</li>
                <li>Toca en "Vincular un dispositivo"</li>
                <li>Escanea el código QR que aparece arriba</li>
                <li>Espera confirmación de conexión (se actualizará automáticamente)</li>
              </ol>
            </div>
          </div>
        )}

        {!estado.conectado && !estado.qrCodeDataURL && conectando && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mr-3"></div>
              <h3 className="font-bold text-yellow-900 text-lg">Generando Código QR...</h3>
            </div>
            <div className="text-center space-y-3">
              <p className="text-yellow-800 font-medium">
                ⏳ Inicializando WhatsApp Web (esto puede tardar 10-15 segundos la primera vez)
              </p>
              <div className="bg-yellow-100 rounded-lg p-3 text-sm text-yellow-700">
                <p className="font-semibold mb-1">¿Primera vez que conectas?</p>
                <p>El sistema está descargando componentes necesarios. Solo sucede la primera vez.</p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}

        {!estado.conectado && !estado.qrCodeDataURL && !conectando && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instrucciones para conectar:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Haz clic en el botón "Conectar"</li>
              <li>Espera a que se genere el código QR (aparecerá aquí)</li>
              <li>Abre WhatsApp en tu teléfono: Menú &gt; Dispositivos vinculados</li>
              <li>Escanea el código QR</li>
              <li>Espera confirmación de conexión (se actualizará automáticamente)</li>
            </ol>
          </div>
        )}

        {estado.conectado && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">WhatsApp conectado correctamente</p>
                <p className="text-sm text-green-700 mt-1">
                  El sistema enviará recordatorios automáticamente de Lunes a Viernes
                  entre 8am y 6pm cada hora. También se verifica diario a las 7am si hay
                  nuevos recordatorios por crear.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enviar mensaje de prueba */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Send className="mr-2 h-6 w-6 text-primary-600" />
          Enviar Mensaje de Prueba
        </h2>

        {!estado.conectado ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Necesitas conectar WhatsApp primero antes de poder enviar mensajes
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmitTest)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número (con código país) *
              </label>
              <input
                type="text"
                {...register('numero', {
                  required: 'El número es requerido',
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: 'Formato inválido (ej: 573001234567)'
                  }
                })}
                className="input"
                placeholder="573001234567"
              />
              {errors.numero && (
                <p className="text-red-500 text-sm mt-1">{errors.numero.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Ejemplo: 573001234567 (Colombia)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje *
              </label>
              <textarea
                {...register('mensaje', { required: 'El mensaje es requerido' })}
                className="input"
                rows={5}
                placeholder="Escribe tu mensaje de prueba aquí..."
              />
              {errors.mensaje && (
                <p className="text-red-500 text-sm mt-1">{errors.mensaje.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="btn btn-primary flex items-center"
            >
              <Send className="h-5 w-5 mr-2" />
              {enviando ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        )}
      </div>

      {/* Envío manual de notificaciones */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Bell className="mr-2 h-6 w-6 text-primary-600" />
          Envío Manual de Recordatorios
        </h2>

        <p className="text-gray-700 mb-4">
          Los recordatorios se envían automáticamente, pero puedes forzar un envío manual
          de todas las notificaciones pendientes.
        </p>

        {!estado.conectado ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Necesitas conectar WhatsApp primero
            </p>
          </div>
        ) : (
          <button
            onClick={enviarNotificacionesManual}
            className="btn btn-primary flex items-center"
          >
            <Bell className="h-5 w-5 mr-2" />
            Enviar Notificaciones Pendientes Ahora
          </button>
        )}
      </div>

      {/* Información del sistema */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          Información del Sistema de Notificaciones
        </h2>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Recordatorios Automáticos</h3>
            <p className="text-sm text-gray-700 mb-2">
              El sistema envía recordatorios automáticamente en los siguientes momentos:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><strong>30 días antes</strong> del vencimiento de la tecnomecánica</li>
              <li><strong>15 días antes</strong> del vencimiento</li>
              <li><strong>7 días antes</strong> del vencimiento</li>
              <li><strong>5 días antes</strong> del vencimiento</li>
              <li><strong>1 día antes</strong> del vencimiento (urgente)</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Horario de Envío</h3>
            <p className="text-sm text-gray-700">
              <strong>Lunes a Viernes:</strong> De 8:00 AM a 6:00 PM cada hora
              <br />
              <strong>Verificación diaria:</strong> 7:00 AM (crea nuevos recordatorios si hay vehículos nuevos)
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Ejemplo de Mensaje</h3>
            <div className="bg-white border border-gray-200 rounded p-3 text-sm">
              <p className="text-gray-800">
                ⚠️ Hola JUAN PÉREZ!
              </p>
              <p className="text-gray-800 mt-2">
                Le recordamos que la <strong>tecnomecánica</strong> de su vehículo placa <strong>ABC123</strong> vence en 7 días.
              </p>
              <p className="text-gray-800 mt-2">
                📅 Fecha de vencimiento: <strong>05/11/2025</strong>
              </p>
              <p className="text-gray-800 mt-2">
                Por favor renueve su tecnomecánica a tiempo para evitar multas e inconvenientes.
              </p>
              <p className="text-gray-800 mt-2">
                ¿Necesita ayuda? Responda este mensaje o contáctenos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
