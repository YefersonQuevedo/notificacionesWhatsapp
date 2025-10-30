import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Páginas
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Importar from './pages/Importar';
import WhatsApp from './pages/WhatsApp';
import DatosBrutos from './pages/DatosBrutos';
import ConfigMensajes from './pages/ConfigMensajes';

// Layout
import Layout from './components/Layout';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="vehiculos" element={<Vehiculos />} />
            <Route path="importar" element={<Importar />} />
            <Route path="whatsapp" element={<WhatsApp />} />
            <Route path="datos-brutos" element={<DatosBrutos />} />
            <Route path="config-mensajes" element={<ConfigMensajes />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
