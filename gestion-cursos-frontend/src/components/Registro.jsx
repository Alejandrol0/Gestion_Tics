import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';

const Registro = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'aprendiz',
        coordinador_asignado: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [coordinadores, setCoordinadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const { registrar } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        cargarCoordinadores();
    }, []);

    const cargarCoordinadores = async () => {
        try {
            const response = await api.get('/coordinadores/disponibles');
            setCoordinadores(response.data.coordinadores);
        } catch (error) {
            console.error('Error cargando coordinadores:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (formData.role === 'instructor' && !formData.coordinador_asignado) {
            newErrors.coordinador_asignado = 'Debes seleccionar un coordinador';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);

        const datosEnvio = {
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            role: formData.role
        };

        if (formData.role === 'instructor') {
            datosEnvio.coordinador_asignado = formData.coordinador_asignado;
        }

        const result = await registrar(datosEnvio);

        if (result.success) {
            setTimeout(() => navigate('/login'), 2000);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
            
            {/* Tarjeta principal */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-green-200 transform transition-all duration-500 hover:scale-[1.02]">
                {/* Header con verde SENA */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 p-6 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full"></div>
                    
                    <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl border-4 border-green-400 transform rotate-3 hover:rotate-6 transition-transform">
                            <span className="text-4xl font-black text-green-600 drop-shadow-lg">
                                SENA
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                            Crear cuenta
                        </h2>
                        <p className="text-green-100 text-sm">
                            Únete al Sistema de Gestión de Cursos
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-100">
                    {/* Nombre */}
                    <div className="group">
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Nombre completo
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-green-600 transition-colors" />
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 transition-all ${
                                    errors.nombre ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:border-green-500'
                                }`}
                                placeholder="Juan Pérez"
                            />
                        </div>
                        {errors.nombre && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.nombre}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-green-600 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 transition-all ${
                                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:border-green-500'
                                }`}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div className="group">
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-green-600 transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 transition-all ${
                                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:border-green-500'
                                }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div className="group">
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-green-600 transition-colors" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 transition-all ${
                                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:border-green-500'
                                }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                            >
                                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Rol */}
                    <div className="group">
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Rol
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                        >
                            <option value="aprendiz">👨‍🎓 Aprendiz</option>
                            <option value="instructor">👨‍🏫 Instructor</option>
                            <option value="coordinador">👨‍💼 Coordinador</option>
                            <option value="funcionario">👔 Funcionario</option>
                        </select>
                    </div>

                    {/* Coordinador asignado (solo para instructores) */}
                    {formData.role === 'instructor' && (
                        <div className="group animate-fadeIn">
                            <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                                Coordinador asignado
                            </label>
                            <select
                                name="coordinador_asignado"
                                value={formData.coordinador_asignado}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 transition-all ${
                                    errors.coordinador_asignado ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:border-green-500'
                                }`}
                            >
                                <option value="">Selecciona un coordinador</option>
                                {coordinadores.map(coord => (
                                    <option key={coord._id} value={coord._id}>
                                        {coord.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.coordinador_asignado && (
                                <p className="text-red-500 text-xs mt-1 ml-1">{errors.coordinador_asignado}</p>
                            )}
                        </div>
                    )}

                    {/* Botón de registro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 group shadow-lg"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Registrando...</span>
                            </>
                        ) : (
                            <>
                                <FiUserPlus className="text-xl" />
                                <span>Registrarme</span>
                                <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* Separador */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400">o</span>
                        </div>
                    </div>

                    {/* Link a login */}
                    <p className="text-center text-gray-600">
                        ¿Ya tienes una cuenta?{' '}
                        <Link 
                            to="/login" 
                            className="text-green-600 hover:text-green-800 font-semibold hover:underline inline-flex items-center gap-1 group"
                        >
                            Inicia sesión aquí
                            <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </p>
                </form>
            </div>

            {/* Estilos para scrollbar personalizado */}
            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #39A900;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #2C7A1C;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Registro;