import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail]     = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.msg || 'Credenciales incorrectas');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-green-200">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative">
                        <div className="w-28 h-28 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl border-4 border-green-400 rotate-3 hover:rotate-6 transition-transform">
                            <span className="text-4xl font-black text-green-600">SENA</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h1>
                        <p className="text-green-100">Sistema de Gestión de Cursos</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="group">
                        <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setError(''); setEmail(e.target.value); }}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group">
                        <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setError(''); setPassword(e.target.value); }}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4 group shadow-lg"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Iniciando sesión...</span>
                            </>
                        ) : (
                            <>
                                <span>Iniciar Sesión</span>
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400">o</span>
                        </div>
                    </div>

                    <p className="text-center text-gray-600 text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link to="/registro" className="text-green-600 font-semibold hover:underline inline-flex items-center gap-1 group">
                            Regístrate aquí
                            <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;