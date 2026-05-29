import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiClipboard, FiLogOut, FiUser, FiChevronRight } from 'react-icons/fi';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white shadow-md border-b-2 border-green-500 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-sm">SENA</span>
                        </div>
                        <span className="text-xl font-bold text-green-700">
                            Gestión de Cursos
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                <FiUser className="text-white text-sm" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 leading-none">
                                    {user?.nombre}
                                </p>
                                <p className="text-xs text-green-600 font-semibold capitalize">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md text-sm font-medium"
                        >
                            <FiLogOut />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Contenido */}
            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* Saludo */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Hola, <span className="text-green-600">{user?.nombre?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Bienvenido al sistema de gestión de cursos SENA
                    </p>
                </div>

                {/* ── Vista INSTRUCTOR ── */}
                {user?.role === 'instructor' && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                            Crear nueva ficha
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

                            {/* Tarjeta Regular */}
                            <button
                                onClick={() => navigate('/ofertas/regular')}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-green-400 transition-all duration-300 p-8 text-left hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-green-100 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                                    <FiBookOpen className="text-2xl text-green-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Ficha Regular
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Crea una ficha de oferta regular con horario, modalidad, programa de formación y toda la información requerida.
                                </p>
                                <div className="flex items-center gap-1 text-green-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                    Crear ficha
                                    <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            {/* Tarjeta Campesena */}
                            <button
                                onClick={() => navigate('/ofertas/campesena')}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-amber-400 transition-all duration-300 p-8 text-left hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-amber-100 group-hover:bg-amber-500 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                                    <FiUsers className="text-2xl text-amber-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Ficha Campesena
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Crea una ficha de oferta Campesena. No requiere horario fijo, orientada a comunidades rurales.
                                </p>
                                <div className="flex items-center gap-1 text-amber-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                    Crear ficha
                                    <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>

                        {/* Mis fichas */}
                        <h2 className="text-lg font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                            Mis fichas
                        </h2>
                        <button
                            onClick={() => navigate('/ofertas/mis-ofertas')}
                            className="group w-full bg-white rounded-2xl shadow-md hover:shadow-lg border-2 border-transparent hover:border-green-300 transition-all p-6 text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 group-hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors">
                                    <FiClipboard className="text-xl text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">Ver mis fichas</p>
                                    <p className="text-sm text-gray-500">Consulta el estado de todas tus fichas enviadas</p>
                                </div>
                            </div>
                            <FiChevronRight className="text-gray-400 text-xl group-hover:translate-x-1 transition-transform" />
                        </button>
                    </>
                )}

                {/* ── Vista COORDINADOR ── */}
                {user?.role === 'coordinador' && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                            Panel coordinador
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <button
                                onClick={() => navigate('/coordinador/pendientes')}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-blue-400 transition-all p-8 text-left hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                                    <FiClipboard className="text-2xl text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Fichas pendientes
                                </h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Revisa y aprueba o rechaza las fichas enviadas por tus instructores.
                                </p>
                                <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                    Ver fichas
                                    <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/coordinador/instructores')}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-green-400 transition-all p-8 text-left hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-green-100 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                                    <FiUsers className="text-2xl text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Mis instructores
                                </h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Consulta la lista de instructores asignados a tu coordinación.
                                </p>
                                <div className="flex items-center gap-1 text-green-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                    Ver instructores
                                    <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* ── Vista FUNCIONARIO ── */}
                {user?.role === 'funcionario' && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                            Panel funcionario
                        </h2>
                        <button
                            onClick={() => navigate('/funcionario/fichas')}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-purple-400 transition-all p-8 text-left hover:-translate-y-1 w-full sm:w-auto"
                        >
                            <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                                <FiClipboard className="text-2xl text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Fichas aprobadas
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Gestiona inscripciones y matrículas de las fichas aprobadas.
                            </p>
                            <div className="flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                Ver fichas
                                <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;