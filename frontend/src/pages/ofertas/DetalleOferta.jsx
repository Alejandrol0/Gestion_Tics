import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ofertaApi from '../../services/ofertaApi';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiClock, FiBriefcase, FiCheckCircle, FiXCircle, FiClock as FiClockIcon } from 'react-icons/fi';

const DetalleOferta = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [oferta, setOferta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarOferta();
    }, [id]);

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

    const getStatusColor = (estado) => {
        switch(estado) {
            case 'aprobado': return 'bg-green-100 text-green-800 border-green-200';
            case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rechazado': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (estado) => {
        switch(estado) {
            case 'aprobado': return <FiCheckCircle className="text-green-600 text-2xl" />;
            case 'pendiente': return <FiClockIcon className="text-yellow-600 text-2xl" />;
            case 'rechazado': return <FiXCircle className="text-red-600 text-2xl" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    if (!oferta) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <FiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oferta no encontrada</h2>
                    <button onClick={() => navigate('/ofertas/mis-ofertas')} className="bg-green-600 text-white px-6 py-3 rounded-xl mt-4">Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
                    <FiArrowLeft /> Volver
                </button>

                <div className={`rounded-2xl shadow-lg p-6 mb-6 ${getStatusColor(oferta.estado)}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {getStatusIcon(oferta.estado)}
                            <div>
                                <h1 className="text-2xl font-bold">{oferta.programa_formacion?.nombre_programa || 'Programa de formación'}</h1>
                                <p className="text-sm opacity-75">Código: {oferta.programa_formacion?.codigo || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold">Estado</p>
                            <p className="text-lg font-bold capitalize">{oferta.estado}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4">Información general</h2>
                            <dl className="grid grid-cols-2 gap-4">
                                <div><dt className="text-sm text-gray-500">Modalidad</dt><dd className="font-medium">{oferta.modalidad?.nombre || 'N/A'}</dd></div>
                                <div><dt className="text-sm text-gray-500">Tipo de programa</dt><dd className="font-medium">{oferta.tipo_programa?.nombre || 'N/A'}</dd></div>
                                <div><dt className="text-sm text-gray-500">Tipo de oferta</dt><dd className="font-medium">{oferta.tipo_oferta?.nombre || 'N/A'}</dd></div>
                                <div><dt className="text-sm text-gray-500">Cupo máximo</dt><dd className="font-medium">{oferta.cupo_maximo} personas</dd></div>
                                <div><dt className="text-sm text-gray-500">Duración</dt><dd className="font-medium">{oferta.duracion_meses} meses</dd></div>
                                {oferta.es_campesena && <div><dt className="text-sm text-gray-500">Es campesena</dt><dd className="font-medium text-green-600">Sí</dd></div>}
                            </dl>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2"><FiCalendar /> Fechas</h2>
                            <dl className="grid grid-cols-2 gap-4">
                                <div><dt className="text-sm text-gray-500">Inicio</dt><dd className="font-medium">{new Date(oferta.fechas?.inicio).toLocaleDateString()}</dd></div>
                                <div><dt className="text-sm text-gray-500">Fin</dt><dd className="font-medium">{new Date(oferta.fechas?.fin).toLocaleDateString()}</dd></div>
                            </dl>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2"><FiMapPin /> Ubicación</h2>
                            <dl className="grid grid-cols-2 gap-4">
                                <div><dt className="text-sm text-gray-500">Municipio</dt><dd className="font-medium">{oferta.ubicacion?.municipio?.nombre || 'N/A'}</dd></div>
                                <div><dt className="text-sm text-gray-500">Dirección</dt><dd className="font-medium">{oferta.ubicacion?.direccion || 'N/A'}</dd></div>
                            </dl>
                        </div>

                        {oferta.horario && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4 flex items-center gap-2"><FiClock /> Horario</h2>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div><dt className="text-sm text-gray-500">Días</dt><dd className="font-medium">{oferta.horario?.dias?.join(', ') || 'No especificado'}</dd></div>
                                    <div><dt className="text-sm text-gray-500">Hora</dt><dd className="font-medium">{oferta.horario?.hora_inicio} - {oferta.horario?.hora_fin}</dd></div>
                                </dl>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4">Ambiente</h2>
                            <p className="font-medium">{oferta.ambiente?.nombre || 'No especificado'}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4">Coordinador</h2>
                            {oferta.coordinador_asignado ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"><FiBriefcase className="text-white" /></div>
                                    <div><p className="font-bold">{oferta.coordinador_asignado.nombre}</p><p className="text-sm text-gray-600">{oferta.coordinador_asignado.email}</p></div>
                                </div>
                            ) : <p className="text-gray-500">No asignado</p>}
                        </div>

                        {oferta.subsector_economico?.nombre && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4">Subsector económico</h2>
                                <p className="font-medium">{oferta.subsector_economico.nombre}</p>
                            </div>
                        )}

                        {oferta.convenio?.nombre && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold border-b-2 border-green-500 pb-2 mb-4">Convenio</h2>
                                <p className="font-medium">{oferta.convenio.nombre}</p>
                            </div>
                        )}

                        {oferta.comentario_coordinador && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="font-semibold text-red-800">Comentario del coordinador:</p>
                                <p className="text-red-700 text-sm">{oferta.comentario_coordinador}</p>
                            </div>
                        )}

                        {(oferta.estado === 'pendiente' || oferta.estado === 'rechazado') && user?.role === 'instructor' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <Link to={`/ofertas/editar/${oferta._id}`} className="w-full block text-center bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">Editar oferta</Link>
                                {oferta.estado === 'rechazado' && <p className="text-sm text-gray-500 mt-3 text-center">Puedes editarla y volver a enviarla</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleOferta;