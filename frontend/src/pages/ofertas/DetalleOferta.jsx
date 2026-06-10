import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ofertaApi from '../../services/ofertaApi';
import Navbar from '../../components/Navbar';
import {
    FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiClock,
    FiBriefcase, FiCheckCircle, FiXCircle, FiEdit, FiBook,
    FiHome, FiTag
} from 'react-icons/fi';

const DetalleOferta = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [oferta, setOferta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { cargarOferta(); }, [id]);

    const cargarOferta = async () => {
        try {
            const data = await ofertaApi.getOferta(id);
            setOferta(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const estadoConfig = {
        aprobado:  { bg: 'from-green-600 to-green-700',  badge: 'bg-green-100 text-green-800 border-green-300',  icon: <FiCheckCircle className="text-3xl" />, label: 'Aprobada' },
        pendiente: { bg: 'from-yellow-500 to-yellow-600', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <FiClock className="text-3xl" />,       label: 'Pendiente de revisión' },
        rechazado: { bg: 'from-red-600 to-red-700',      badge: 'bg-red-100 text-red-800 border-red-300',         icon: <FiXCircle className="text-3xl" />,       label: 'Rechazada' },
    };

    const cfg = estadoConfig[oferta?.estado] || estadoConfig.pendiente;
    const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

    if (loading) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando información...</p>
                </div>
            </div>
        </>
    );

    if (!oferta) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                    <FiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Ficha no encontrada</h2>
                    <button onClick={() => navigate('/ofertas/mis-ofertas')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">Volver</button>
                </div>
            </div>
        </>
    );

    const nombrePrograma = oferta.programa_formacion?.nombre_programa || oferta.programa_formacion?.nombre || 'Programa no especificado';

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-green-600 flex items-center gap-1"><FiHome /> Inicio</button>
                        <span>/</span>
                        <button onClick={() => navigate('/ofertas/mis-ofertas')} className="hover:text-green-600">Mis Fichas</button>
                        <span>/</span>
                        <span className="text-gray-800 font-medium">Detalle</span>
                    </div>

                    {/* Header con estado */}
                    <div className={`bg-gradient-to-r ${cfg.bg} rounded-2xl shadow-lg p-6 mb-6 text-white`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {cfg.icon}
                                <div>
                                    <p className="text-sm font-medium opacity-80 mb-0.5">Estado de la ficha</p>
                                    <h2 className="text-2xl font-bold">{cfg.label}</h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-75">Creada el</p>
                                <p className="font-semibold">{new Date(oferta.createdAt).toLocaleDateString('es-CO')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Alerta de rechazo */}
                    {oferta.estado === 'rechazado' && oferta.comentario_coordinador && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
                            <p className="font-bold text-red-800 mb-1">💬 Motivo del rechazo:</p>
                            <p className="text-red-700">{oferta.comentario_coordinador}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna principal */}
                        <div className="lg:col-span-2 space-y-5">

                            {/* Programa */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2">
                                    <FiBook className="text-green-600" /> Programa de Formación
                                </h3>
                                <p className="text-xl font-bold text-gray-900 mb-3">{nombrePrograma}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Modalidad</p>
                                        <p className="font-semibold">{oferta.modalidad?.nombre || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Tipo de programa</p>
                                        <p className="font-semibold">{oferta.tipo_programa?.nombre || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Tipo de oferta</p>
                                        <p className="font-semibold">{oferta.tipo_oferta?.nombre || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Duración</p>
                                        <p className="font-semibold">{oferta.duracion_meses} horas</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Cupo máximo</p>
                                        <p className="font-semibold flex items-center gap-1"><FiUsers className="text-green-500" /> {oferta.cupo_maximo} personas</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Ambiente</p>
                                        <p className="font-semibold">{oferta.ambiente?.nombre || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2">
                                    <FiCalendar className="text-green-600" /> Fechas
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <p className="text-xs text-green-600 font-semibold mb-1">INICIO</p>
                                        <p className="font-bold text-gray-800">{formatFecha(oferta.fechas?.inicio)}</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <p className="text-xs text-green-600 font-semibold mb-1">FIN</p>
                                        <p className="font-bold text-gray-800">{formatFecha(oferta.fechas?.fin)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Horario */}
                            {!oferta.es_campesena && oferta.horario && (
                                <div className="bg-white rounded-2xl shadow-md p-6">
                                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2">
                                        <FiClock className="text-green-600" /> Horario
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {oferta.horario?.dias?.map(d => (
                                            <span key={d} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{d}</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Hora:</span> {oferta.horario?.hora_inicio} – {oferta.horario?.hora_fin}
                                    </p>
                                </div>
                            )}

                            {/* Ubicación */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2">
                                    <FiMapPin className="text-green-600" /> Ubicación
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Departamento</p>
                                        <p className="font-semibold">{oferta.ubicacion?.departamento || 'Cauca'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Municipio</p>
                                        <p className="font-semibold">{oferta.ubicacion?.municipio?.nombre || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                                        <p className="text-xs text-gray-500 mb-1">Dirección</p>
                                        <p className="font-semibold">{oferta.ubicacion?.direccion || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna lateral */}
                        <div className="space-y-5">
                            {/* Coordinador */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2">
                                    <FiBriefcase className="text-green-600" /> Coordinador
                                </h3>
                                {oferta.coordinador_asignado ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {oferta.coordinador_asignado.nombre?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{oferta.coordinador_asignado.nombre}</p>
                                            <p className="text-sm text-gray-500">{oferta.coordinador_asignado.email}</p>
                                        </div>
                                    </div>
                                ) : <p className="text-gray-500">No asignado</p>}
                            </div>

                            {/* Detalles adicionales */}
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2">
                                    <FiTag className="text-green-600" /> Detalles
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {oferta.subsector_economico?.nombre && (
                                        <div>
                                            <p className="text-gray-500 text-xs">Subsector económico</p>
                                            <p className="font-semibold text-gray-800">{oferta.subsector_economico.nombre}</p>
                                        </div>
                                    )}
                                    {oferta.convenio?.nombre && (
                                        <div>
                                            <p className="text-gray-500 text-xs">Convenio</p>
                                            <p className="font-semibold text-gray-800">{oferta.convenio.nombre}</p>
                                        </div>
                                    )}
                                    {oferta.es_campesena && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                            <p className="text-amber-700 font-semibold">🌾 Ficha Campesena</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Acciones */}
                            {(oferta.estado === 'pendiente' || oferta.estado === 'rechazado') && user?.role === 'instructor' && (
                                <div className="bg-white rounded-2xl shadow-md p-6">
                                    <Link
                                        to={`/ofertas/editar/${oferta._id}`}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all"
                                    >
                                        <FiEdit /> Editar ficha
                                    </Link>
                                    {oferta.estado === 'rechazado' && (
                                        <p className="text-xs text-gray-500 mt-2 text-center">Corrígela y vuelve a enviarla</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetalleOferta;