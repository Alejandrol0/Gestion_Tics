import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOfertas } from '../../context/OfertaContext';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEdit, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const MisOfertas = () => {
    const { ofertas, loading, cargarMisOfertas } = useOfertas();
    const { user } = useAuth();
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => {
        cargarMisOfertas();
    }, []);

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
            case 'aprobado': return <FiCheckCircle className="text-green-600" />;
            case 'pendiente': return <FiClock className="text-yellow-600" />;
            case 'rechazado': return <FiXCircle className="text-red-600" />;
            default: return <FiAlertCircle className="text-gray-600" />;
        }
    };

    const ofertasFiltradas = filtro === 'todos' ? ofertas : ofertas.filter(o => o.estado === filtro);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tus ofertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Mis Ofertas de Formación</h1>
                    <p className="text-green-100">Gestiona las fichas que has creado</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setFiltro('todos')} className={`px-4 py-2 rounded-lg font-semibold ${filtro === 'todos' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Todos</button>
                        <button onClick={() => setFiltro('pendiente')} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${filtro === 'pendiente' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}><FiClock /> Pendientes</button>
                        <button onClick={() => setFiltro('aprobado')} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${filtro === 'aprobado' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}><FiCheckCircle /> Aprobadas</button>
                        <button onClick={() => setFiltro('rechazado')} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${filtro === 'rechazado' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}><FiXCircle /> Rechazadas</button>
                    </div>
                </div>

                {ofertasFiltradas.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay ofertas</h3>
                        <p className="text-gray-600">Aún no has creado ninguna oferta</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ofertasFiltradas.map(oferta => (
                            <div key={oferta._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                                <div className={`p-4 border-b-2 ${getStatusColor(oferta.estado)}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">{getStatusIcon(oferta.estado)}<span className="font-semibold capitalize">{oferta.estado}</span></div>
                                        <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm">Cupo: {oferta.cupo_maximo}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{oferta.programa_formacion?.nombre || 'Programa no especificado'}</h3>
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm text-gray-600"><span className="font-semibold">Modalidad:</span> {oferta.modalidad?.nombre || 'N/A'}</p>
                                        <p className="text-sm text-gray-600"><span className="font-semibold">Fechas:</span> {new Date(oferta.fechas?.inicio).toLocaleDateString()} - {new Date(oferta.fechas?.fin).toLocaleDateString()}</p>
                                        {oferta.estado === 'rechazado' && oferta.comentario_coordinador && (
                                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-xs font-semibold text-red-800">Motivo:</p>
                                                <p className="text-sm text-red-700">{oferta.comentario_coordinador}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <Link to={`/ofertas/${oferta._id}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"><FiEye /> Ver</Link>
                                        {(oferta.estado === 'pendiente' || oferta.estado === 'rechazado') && (
                                            <Link to={`/ofertas/editar/${oferta._id}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"><FiEdit /> Editar</Link>
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

export default MisOfertas;