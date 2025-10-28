import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.login(data.email, data.password);
      login(response.data.token, response.data.usuario);
      toast.success('Bienvenido!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Grupo Cardeñoza</h1>
          <p className="text-primary-100">Sistema de Recordatorios de Tecnomecánica</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <LogIn className="h-12 w-12 text-primary-600" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                {...register('email', { required: 'El email es requerido' })}
                className="input"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                {...register('password', { required: 'La contraseña es requerida' })}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-primary-600 hover:text-primary-700 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-white text-sm">
          <p>Demo: admin@demo.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
