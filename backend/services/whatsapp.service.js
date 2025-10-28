import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isReady = false;
    this.qrCode = null;
    this.qrCodeDataURL = null;
    this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './whatsapp_sessions';
    this.isInitializing = false;
  }

  async iniciar(empresaId = 'default') {
    // Prevenir múltiples inicializaciones simultáneas
    if (this.isInitializing) {
      console.log('⚠️  Ya hay un proceso de inicialización en curso');
      return;
    }

    if (this.client) {
      console.log('⚠️  Cliente ya existe. Destruyendo cliente anterior...');
      try {
        await this.client.destroy();
      } catch (err) {
        console.log('ℹ️  No se pudo destruir el cliente anterior');
      }
    }

    this.isInitializing = true;
    console.log(`\n📱 Iniciando WhatsApp Web para empresa ${empresaId}...`);
    console.log(`📂 Directorio de sesión: ${this.sessionPath}`);

    try {
      // Crear cliente con autenticación local
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: `empresa_${empresaId}`,
          dataPath: this.sessionPath
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
        }
      });

      console.log('✓ Cliente de WhatsApp Web creado');

      // Evento: QR generado
      this.client.on('qr', async (qr) => {
        this.qrCode = qr;

        // Mostrar en terminal de forma prominente
        console.log('\n\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                  🔲 ¡CÓDIGO QR GENERADO! 🔲                  ');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        console.log('          ESCANEA ESTE CÓDIGO QR CON WHATSAPP:');
        console.log('');

        // Generar QR en terminal
        qrcodeTerminal.generate(qr, { small: false });

        console.log('');
        console.log('───────────────────────────────────────────────────────────────');
        console.log('  📱 Instrucciones:');
        console.log('  1. Abre WhatsApp en tu teléfono');
        console.log('  2. Ve a Menú > Dispositivos vinculados');
        console.log('  3. Toca "Vincular un dispositivo"');
        console.log('  4. Escanea el código QR de arriba');
        console.log('───────────────────────────────────────────────────────────────');
        console.log('  🌐 También disponible en: http://localhost:5173 (interfaz web)');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('\n');

        // Generar QR como Data URL para el frontend
        try {
          this.qrCodeDataURL = await QRCode.toDataURL(qr);
          console.log('✓ QR generado para interfaz web (disponible en /api/whatsapp/estado)');
        } catch (err) {
          console.error('❌ Error generando QR para web:', err);
        }
      });

      // Evento: Autenticación exitosa
      this.client.on('authenticated', () => {
        console.log('✅ Autenticación exitosa');
        this.qrCode = null;
        this.qrCodeDataURL = null;
      });

      // Evento: Fallo de autenticación
      this.client.on('auth_failure', (msg) => {
        console.error('❌ Fallo de autenticación:', msg);
        this.isInitializing = false;
        this.qrCode = null;
        this.qrCodeDataURL = null;
      });

      // Evento: Cliente listo
      this.client.on('ready', () => {
        console.log('✅ WhatsApp Web está listo!');
        this.isConnected = true;
        this.isReady = true;
        this.isInitializing = false;
        this.qrCode = null;
        this.qrCodeDataURL = null;
      });

      // Evento: Desconexión
      this.client.on('disconnected', (reason) => {
        console.log('⚠️  WhatsApp desconectado. Razón:', reason);
        this.isConnected = false;
        this.isReady = false;
        this.isInitializing = false;
      });

      // Evento: Cambio de estado
      this.client.on('change_state', (state) => {
        console.log('📡 Estado cambiado a:', state);
      });

      // Evento: Cargando pantalla
      this.client.on('loading_screen', (percent, message) => {
        console.log(`⏳ Cargando WhatsApp Web: ${percent}% - ${message}`);
      });

      console.log('✓ Listeners registrados');
      console.log('🔄 Inicializando cliente...');
      console.log('');
      console.log('⚠️  NOTA IMPORTANTE:');
      console.log('   • La primera vez tarda 10-20 segundos (descarga Chromium)');
      console.log('   • Las siguientes veces serán más rápidas (5-10 segundos)');
      console.log('   • El código QR aparecerá automáticamente cuando esté listo');
      console.log('');

      // Inicializar el cliente
      await this.client.initialize();

    } catch (error) {
      console.error('❌ Error iniciando WhatsApp Web:', error);
      this.isInitializing = false;
      this.isConnected = false;
      this.isReady = false;
      throw error;
    }
  }

  async limpiarSesion(empresaId = 'default') {
    console.log(`🗑️  Limpiando sesión de empresa ${empresaId}...`);

    // Destruir cliente si existe
    if (this.client) {
      try {
        await this.client.destroy();
        console.log('✓ Cliente destruido');
      } catch (err) {
        console.log('ℹ️  No se pudo destruir el cliente limpiamente');
      }
      this.client = null;
    }

    this.isConnected = false;
    this.isReady = false;
    this.qrCode = null;
    this.qrCodeDataURL = null;
    this.isInitializing = false;

    console.log('✓ Sesión limpiada. Puedes conectar nuevamente.');
  }

  async enviarMensaje(numero, mensaje) {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp no está conectado. Por favor escanea el código QR primero.');
    }

    try {
      // Formatear número (debe incluir código de país, ej: 573001234567)
      const numeroFormateado = numero.replace(/\D/g, ''); // Quitar caracteres no numéricos
      const chatId = `${numeroFormateado}@c.us`;

      await this.client.sendMessage(chatId, mensaje);
      console.log(`✓ Mensaje enviado a ${numero}`);
      return true;
    } catch (error) {
      console.error(`✗ Error enviando mensaje a ${numero}:`, error);
      throw error;
    }
  }

  async enviarMensajeConImagen(numero, mensaje, rutaImagen) {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp no está conectado');
    }

    try {
      const numeroFormateado = numero.replace(/\D/g, '');
      const chatId = `${numeroFormateado}@c.us`;

      const { MessageMedia } = pkg;
      const media = MessageMedia.fromFilePath(rutaImagen);

      await this.client.sendMessage(chatId, media, { caption: mensaje });
      console.log(`✓ Mensaje con imagen enviado a ${numero}`);
      return true;
    } catch (error) {
      console.error(`✗ Error enviando mensaje con imagen a ${numero}:`, error);
      throw error;
    }
  }

  obtenerEstado() {
    return {
      conectado: this.isReady,
      qrCode: this.qrCode,
      qrCodeDataURL: this.qrCodeDataURL,
      inicializando: this.isInitializing
    };
  }

  async desconectar() {
    console.log('🔌 Desconectando WhatsApp...');
    if (this.client) {
      try {
        await this.client.logout();
        await this.client.destroy();
        console.log('✓ WhatsApp desconectado');
      } catch (err) {
        console.error('❌ Error desconectando:', err);
      }
      this.client = null;
    }
    this.isConnected = false;
    this.isReady = false;
    this.qrCode = null;
    this.qrCodeDataURL = null;
    this.isInitializing = false;
  }
}

// Exportar instancia singleton
const whatsappService = new WhatsAppService();
export default whatsappService;
