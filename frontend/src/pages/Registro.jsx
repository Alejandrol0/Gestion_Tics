import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiUser, FiMail, FiLock, FiArrowRight, FiUserCheck } from 'react-icons/fi';

const Registro = () => {
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmar: '',
        role: 'instructor',
        coordinador_asignado: ''
    });
    const [coordinadores, setCoordinadores] = useState([]);
    const [error, setError]     = useState('');
    const [exito, setExito]     = useState('');
    const [loading, setLoading] = useState(false);

    const { registrar } = useAuth();
    const navigate      = useNavigate();

    // Cargar coordinadores cuando el rol es instructor
    useEffect(() => {
        if (form.role === 'instructor') {
            api.get('/usuarios/coordinadores')
                .then(({ data }) => setCoordinadores(data))
                .catch(() => setCoordinadores([]));
        }
    }, [form.role]);

    const handleChange = (e) => {
        setError('');
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmar) {
            return setError('Las contraseñas no coinciden');
        }
        if (form.role === 'instructor' && !form.coordinador_asignado) {
            return setError('Debes seleccionar un coordinador');
        }

        setLoading(true);

        const datos = {
            nombre: form.nombre,
            email:  form.email,
            password: form.password,
            role: form.role,
            ...(form.role === 'instructor' && {
                coordinador_asignado: form.coordinador_asignado
            })
        };

        const result = await registrar(datos);

        if (result.success) {
            setExito('¡Cuenta creada! Redirigiendo...');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.msg || 'Error al registrar');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decoración */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-green-200">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl border-4 border-green-400">
                            <span className="text-3xl font-black text-green-600">SENA</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
                        <p className="text-green-100 text-sm">Sistema de Gestión de Cursos</p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-8 space-y-4">

                    {/* Alertas */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {exito && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                            {exito}
                        </div>
                    )}

                    {/* Nombre */}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Nombre completo
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                                placeholder="Tu nombre"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Rol
                        </label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                        >
                            <option value="instructor">Instructor</option>
                            <option value="coordinador">Coordinador</option>
                            <option value="funcionario">Funcionario</option>
                        </select>
                    </div>

                    {/* Coordinador — solo si es instructor */}
                    {form.role === 'instructor' && (
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                                Coordinador asignado
                            </label>
                            <div className="relative">
                                <FiUserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="coordinador_asignado"
                                    value={form.coordinador_asignado}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                                    required
                                >
                                    <option value="">-- Selecciona un coordinador --</option>
                                    {coordinadores.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.nombre} — {c.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {coordinadores.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1 ml-1">
                                    No hay coordinadores registrados aún.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Confirmar password */}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1 ml-1">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                name="confirmar"
                                value={form.confirmar}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50/50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2 group shadow-lg"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Registrando...</span>
                            </>
                        ) : (
                            <>
                                <span>Crear cuenta</span>
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-gray-600 text-sm pt-2">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-green-600 font-semibold hover:underline inline-flex items-center gap-1 group">
                            Inicia sesión
                            <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Registro;