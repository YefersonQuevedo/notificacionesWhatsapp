import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  registro: (data) => api.post('/auth/registro', data)
};

// Clientes
export const clientesAPI = {
  listar: (params) => api.get('/clientes', { params }),
  obtener: (id) => api.get(`/clientes/${id}`),
  crear: (data) => api.post('/clientes', data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data),
  eliminar: (id) => api.delete(`/clientes/${id}`)
};

// Vehículos
export const vehiculosAPI = {
  listar: (params) => api.get('/vehiculos', { params }),
  obtener: (id) => api.get(`/vehiculos/${id}`),
  crear: (data) => api.post('/vehiculos', data),
  actualizar: (id, data) => api.put(`/vehiculos/${id}`, data),
  eliminar: (id) => api.delete(`/vehiculos/${id}`),
  proximosVencer: () => api.get('/vehiculos/dashboard/proximos-vencer')
};

// Importación
export const importAPI = {
  subirCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  historial: () => api.get('/import/historial')
};

// WhatsApp
export const whatsappAPI = {
  obtenerEstado: () => api.get('/whatsapp/estado'),
  conectar: () => api.post('/whatsapp/conectar'),
  desconectar: () => api.post('/whatsapp/desconectar'),
  enviarTest: (numero, mensaje) => api.post('/whatsapp/test', { numero, mensaje }),
  enviarNotificaciones: () => api.post('/whatsapp/enviar-notificaciones'),
  enviarACliente: (clienteId, mensaje) => api.post('/whatsapp/enviar-cliente', { clienteId, mensaje })
};

// Datos Brutos
export const datosBrutosAPI = {
  listar: (params) => api.get('/datos-brutos', { params }),
  obtener: (id) => api.get(`/datos-brutos/${id}`),
  archivos: () => api.get('/datos-brutos/archivos'),
  estadisticas: (params) => api.get('/datos-brutos/estadisticas', { params })
};

export default api;
