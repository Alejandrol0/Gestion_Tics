import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCursos } from '../../context/CursoContext';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEdit, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const MisCursos = () => {
    const { cursos, loading, cargarMisCursos } = useCursos();
    const { user } = useAuth();
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => {
        cargarMisCursos();
    }, []);

    const getStatusColor = (estado) => {
        switch(estado) {
            case 'activa': return 'bg-green-100 text-green-800 border-green-200';
            case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rechazada': return 'bg-red-100 text-red-800 border-red-200';
            case 'finalizada': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelada': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (estado) => {
        switch(estado) {
            case 'activa': return <FiCheckCircle className="text-green-600" />;
            case 'pendiente': return <FiClock className="text-yellow-600" />;
            case 'rechazada': return <FiXCircle className="text-red-600" />;
            default: return <FiAlertCircle className="text-gray-600" />;
        }
    };

    const cursosFiltrados = filtro === 'todos' 
        ? cursos 
        : cursos.filter(c => c.estado === filtro);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tus cursos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Mis Ofertas de Curso</h1>
                    <p className="text-green-100">Gestiona las ofertas que has creado</p>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFiltro('todos')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                filtro === 'todos' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFiltro('pendiente')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                filtro === 'pendiente' 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                        >
                            <FiClock /> Pendientes
                        </button>
                        <button
                            onClick={() => setFiltro('activa')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                filtro === 'activa' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                            <FiCheckCircle /> Activas
                        </button>
                        <button
                            onClick={() => setFiltro('rechazada')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                filtro === 'rechazada' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                            <FiXCircle /> Rechazadas
                        </button>
                    </div>
                </div>

                {/* Lista de cursos */}
                {cursosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay cursos</h3>
                        <p className="text-gray-600 mb-6">
                            {filtro === 'todos' 
                                ? 'Aún no has creado ninguna oferta de curso' 
                                : `No tienes cursos en estado ${filtro}`}
                        </p>
                        <Link
                            to="/cursos/nuevo"
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
                        >
                            Crear nueva oferta
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cursosFiltrados.map(curso => (
                            <div
                                key={curso._id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-[1.02]"
                            >
                                {/* Header con estado */}
                                <div className={`p-4 border-b-2 ${getStatusColor(curso.estado)}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(curso.estado)}
                                            <span className="font-semibold capitalize">
                                                {curso.estado}
                                            </span>
                                        </div>
                                        <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                                            Cupo: {curso.cupo_maximo}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                                        {curso.programa_formacion?.nombre || 'Programa no especificado'}
                                    </h3>
                                    
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <span className="font-semibold">Modalidad:</span>
                                            {curso.modalidad?.nombre || 'No especificada'}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <span className="font-semibold">Fechas:</span>
                                            {curso.fechas?.inicio_curso ? new Date(curso.fechas.inicio_curso).toLocaleDateString() : '?'} - 
                                            {curso.fechas?.fin_curso ? new Date(curso.fechas.fin_curso).toLocaleDateString() : '?'}
                                        </p>
                                        {curso.estado === 'rechazada' && curso.comentarios_rechazo && (
                                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-xs font-semibold text-red-800 mb-1">Motivo del rechazo:</p>
                                                <p className="text-sm text-red-700">{curso.comentarios_rechazo}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <Link
                                            to={`/cursos/${curso._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                                        >
                                            <FiEye /> Ver
                                        </Link>
                                        
                                        {(curso.estado === 'pendiente' || curso.estado === 'rechazada') && (
                                            <Link
                                                to={`/cursos/editar/${curso._id}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                                            >
                                                <FiEdit /> Editar
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisCursos;