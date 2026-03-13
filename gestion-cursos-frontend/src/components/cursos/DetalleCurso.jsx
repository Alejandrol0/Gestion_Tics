import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCursos } from '../../context/CursoContext';
import { useAuth } from '../../context/AuthContext';
import cursoApi from '../../services/cursoApi';
import { 
    FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiClock, 
    FiBriefcase, FiEdit, FiCheckCircle, FiXCircle, FiClock as FiClockIcon
} from 'react-icons/fi';

const DetalleCurso = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cargarMisCursos } = useCursos();
    const [curso, setCurso] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCurso();
    }, [id]);

    const cargarCurso = async () => {
        try {
            const data = await cursoApi.getCurso(id);
            setCurso(data);
        } catch (error) {
            console.error('Error cargando curso:', error);
        } finally {
            setLoading(false);
        }
    };

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
            case 'activa': return <FiCheckCircle className="text-green-600 text-2xl" />;
            case 'pendiente': return <FiClockIcon className="text-yellow-600 text-2xl" />;
            case 'rechazada': return <FiXCircle className="text-red-600 text-2xl" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información del curso...</p>
                </div>
            </div>
        );
    }

    if (!curso) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <FiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Curso no encontrado</h2>
                    <p className="text-gray-600 mb-6">El curso que buscas no existe o no tienes acceso</p>
                    <button
                        onClick={() => navigate('/cursos/mis-cursos')}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
                    >
                        Volver a mis cursos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Botón volver */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition-all"
                >
                    <FiArrowLeft /> Volver
                </button>

                {/* Header con estado */}
                <div className={`rounded-2xl shadow-lg p-6 mb-6 ${getStatusColor(curso.estado)}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {getStatusIcon(curso.estado)}
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {curso.programa_formacion?.nombre || 'Programa de formación'}
                                </h1>
                                <p className="text-sm opacity-75">
                                    Código: {curso.programa_formacion?.codigo || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold mb-1">Estado</p>
                            <p className="text-lg font-bold capitalize">{curso.estado}</p>
                        </div>
                    </div>
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información básica */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2">
                                Información del curso
                            </h2>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Modalidad</dt>
                                    <dd className="font-medium">{curso.modalidad?.nombre || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Tipo de programa</dt>
                                    <dd className="font-medium">{curso.tipo_programa?.nombre || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Tipo de oferta</dt>
                                    <dd className="font-medium">{curso.tipo_oferta?.nombre || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Cupo máximo</dt>
                                    <dd className="font-medium">{curso.cupo_maximo} personas</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Fechas */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 flex items-center gap-2">
                                <FiCalendar /> Fechas importantes
                            </h2>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Inicio de inscripciones</dt>
                                    <dd className="font-medium">
                                        {curso.fechas?.inicio_inscripciones 
                                            ? new Date(curso.fechas.inicio_inscripciones).toLocaleDateString('es-CO', { 
                                                year: 'numeric', month: 'long', day: 'numeric' 
                                            })
                                            : 'No especificado'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Fin de inscripciones</dt>
                                    <dd className="font-medium">
                                        {curso.fechas?.fin_inscripciones 
                                            ? new Date(curso.fechas.fin_inscripciones).toLocaleDateString('es-CO', { 
                                                year: 'numeric', month: 'long', day: 'numeric' 
                                            })
                                            : 'No especificado'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Inicio del curso</dt>
                                    <dd className="font-medium">
                                        {curso.fechas?.inicio_curso 
                                            ? new Date(curso.fechas.inicio_curso).toLocaleDateString('es-CO', { 
                                                year: 'numeric', month: 'long', day: 'numeric' 
                                            })
                                            : 'No especificado'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Fin del curso</dt>
                                    <dd className="font-medium">
                                        {curso.fechas?.fin_curso 
                                            ? new Date(curso.fechas.fin_curso).toLocaleDateString('es-CO', { 
                                                year: 'numeric', month: 'long', day: 'numeric' 
                                            })
                                            : 'No especificado'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Ubicación */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 flex items-center gap-2">
                                <FiMapPin /> Ubicación
                            </h2>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Dirección</dt>
                                    <dd className="font-medium">{curso.ubicacion?.direccion || 'No especificada'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Ciudad</dt>
                                    <dd className="font-medium">{curso.ubicacion?.ciudad || 'No especificada'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Sala / Aula</dt>
                                    <dd className="font-medium">{curso.ubicacion?.sala || 'No especificada'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Horario */}
                        {curso.horario && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 flex items-center gap-2">
                                    <FiClock /> Horario
                                </h2>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Días</dt>
                                        <dd className="font-medium">
                                            {curso.horario?.dias?.length > 0 
                                                ? curso.horario.dias.join(', ')
                                                : 'No especificado'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Horario</dt>
                                        <dd className="font-medium">
                                            {curso.horario?.hora_inicio || '?'} - {curso.horario?.hora_fin || '?'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Jornada</dt>
                                        <dd className="font-medium capitalize">{curso.horario?.jornada || 'No especificada'}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                    </div>

                    {/* Columna lateral */}
                    <div className="space-y-6">
                        {/* Ambiente y recursos */}
                        {curso.ambiente && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2">
                                    Ambiente
                                </h2>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm text-gray-500">Nombre</dt>
                                        <dd className="font-medium">{curso.ambiente?.nombre || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Tipo</dt>
                                        <dd className="font-medium">{curso.ambiente?.tipo || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Capacidad</dt>
                                        <dd className="font-medium">{curso.ambiente?.capacidad || 'N/A'}</dd>
                                    </div>
                                    {curso.ambiente?.recursos?.length > 0 && (
                                        <div>
                                            <dt className="text-sm text-gray-500 mb-2">Recursos</dt>
                                            <dd className="flex flex-wrap gap-2">
                                                {curso.ambiente.recursos.map((recurso, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {recurso}
                                                    </span>
                                                ))}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {/* Coordinador asignado */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2">
                                Coordinador asignado
                            </h2>
                            {curso.coordinador_asignado ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                        <FiBriefcase className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{curso.coordinador_asignado.nombre}</p>
                                        <p className="text-sm text-gray-600">{curso.coordinador_asignado.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No asignado</p>
                            )}
                        </div>

                        {/* Empresa solicitante */}
                        {curso.empresa_solicitante?.nombre && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2">
                                    Empresa solicitante
                                </h2>
                                <dl className="space-y-2">
                                    <dt className="text-sm text-gray-500">Empresa</dt>
                                    <dd className="font-medium">{curso.empresa_solicitante.nombre}</dd>
                                    {curso.empresa_solicitante.contacto && (
                                        <>
                                            <dt className="text-sm text-gray-500 mt-2">Contacto</dt>
                                            <dd className="font-medium">{curso.empresa_solicitante.contacto}</dd>
                                        </>
                                    )}
                                </dl>
                            </div>
                        )}

                        {/* Acciones */}
                        {(curso.estado === 'pendiente' || curso.estado === 'rechazada') && user?.role === 'instructor' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2">
                                    Acciones
                                </h2>
                                <Link
                                    to={`/cursos/editar/${curso._id}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                                >
                                    <FiEdit /> Editar oferta
                                </Link>
                                {curso.estado === 'rechazada' && (
                                    <p className="text-sm text-gray-600 mt-3 text-center">
                                        Puedes editar la oferta y volver a enviarla para revisión
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleCurso;