import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOfertas } from '../../context/OfertaContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FiEye, FiEdit, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiPlus, FiCalendar, FiUsers, FiMapPin } from 'react-icons/fi';

const MisOfertas = () => {
    const { ofertas, loading, cargarMisOfertas } = useOfertas();
    const { user } = useAuth();
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => { cargarMisOfertas(); }, []);

    const getStatusConfig = (estado) => {
        switch(estado) {
            case 'aprobado':  return { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800',  icon: <FiCheckCircle className="text-green-600" />,  label: 'Aprobada' };
            case 'pendiente': return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="text-yellow-600" />,      label: 'Pendiente' };
            case 'rechazado': return { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-800',       icon: <FiXCircle className="text-red-600" />,        label: 'Rechazada' };
            default:          return { bg: 'bg-gray-50',   border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-800',     icon: <FiAlertCircle className="text-gray-600" />,   label: estado };
        }
    };

    const conteo = {
        todos:     ofertas.length,
        pendiente: ofertas.filter(o => o.estado === 'pendiente').length,
        aprobado:  ofertas.filter(o => o.estado === 'aprobado').length,
        rechazado: ofertas.filter(o => o.estado === 'rechazado').length,
    };

    const ofertasFiltradas = filtro === 'todos' ? ofertas : ofertas.filter(o => o.estado === filtro);

    const formatFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Cargando tus fichas...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-6 mb-6 text-white flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Mis Fichas de Formación</h1>
                            <p className="text-green-100">Gestiona las fichas que has creado</p>
                        </div>
                        <Link
                            to="/ofertas/regular"
                            className="flex items-center gap-2 bg-white text-green-700 font-bold px-5 py-3 rounded-xl hover:bg-green-50 transition-all shadow-md"
                        >
                            <FiPlus /> Nueva Ficha
                        </Link>
                    </div>

                    {/* Stats + Filtros */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                            { key: 'todos',     label: 'Todas',      color: 'border-gray-300 hover:border-gray-400',    activeBg: 'bg-gray-700 text-white',   defaultBg: 'bg-white text-gray-700' },
                            { key: 'pendiente', label: 'Pendientes', color: 'border-yellow-300 hover:border-yellow-400', activeBg: 'bg-yellow-500 text-white',  defaultBg: 'bg-white text-yellow-700' },
                            { key: 'aprobado',  label: 'Aprobadas',  color: 'border-green-300 hover:border-green-400',   activeBg: 'bg-green-600 text-white',   defaultBg: 'bg-white text-green-700' },
                            { key: 'rechazado', label: 'Rechazadas', color: 'border-red-300 hover:border-red-400',       activeBg: 'bg-red-600 text-white',     defaultBg: 'bg-white text-red-700' },
                        ].map(({ key, label, color, activeBg, defaultBg }) => (
                            <button
                                key={key}
                                onClick={() => setFiltro(key)}
                                className={`rounded-xl border-2 p-4 text-left transition-all font-semibold ${color} ${filtro === key ? activeBg : defaultBg + ' hover:shadow-md'}`}
                            >
                                <p className="text-2xl font-black">{conteo[key]}</p>
                                <p className="text-sm">{label}</p>
                            </button>
                        ))}
                    </div>

                    {/* Listado */}
                    {ofertasFiltradas.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No hay fichas</h3>
                            <p className="text-gray-500 mb-6">
                                {filtro === 'todos' ? 'Aún no has creado ninguna ficha.' : `No tienes fichas en estado "${filtro}".`}
                            </p>
                            <Link to="/ofertas/regular" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">
                                <FiPlus /> Crear primera ficha
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {ofertasFiltradas.map(oferta => {
                                const cfg = getStatusConfig(oferta.estado);
                                const nombrePrograma = oferta.programa_formacion?.nombre_programa
                                    || oferta.programa_formacion?.nombre
                                    || 'Sin programa';
                                return (
                                    <div key={oferta._id} className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border-2 ${cfg.border} overflow-hidden flex flex-col`}>
                                        {/* Badge estado */}
                                        <div className={`px-5 py-3 flex items-center justify-between ${cfg.bg}`}>
                                            <span className={`flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full ${cfg.badge}`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                            <span className="text-xs bg-white px-3 py-1 rounded-full shadow-sm font-semibold text-gray-600">
                                                <FiUsers className="inline mr-1" />Cupo: {oferta.cupo_maximo}
                                            </span>
                                        </div>

                                        {/* Contenido */}
                                        <div className="p-5 flex-1 flex flex-col gap-3">
                                            <h3 className="font-bold text-gray-800 text-base leading-snug line-clamp-2">
                                                {nombrePrograma}
                                            </h3>

                                            <div className="space-y-1.5 text-sm text-gray-600">
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700 w-20 shrink-0">Modalidad:</span>
                                                    {oferta.modalidad?.nombre || 'N/A'}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <FiCalendar className="text-green-500 shrink-0" />
                                                    {formatFecha(oferta.fechas?.inicio)} → {formatFecha(oferta.fechas?.fin)}
                                                </p>
                                                {oferta.ubicacion?.municipio?.nombre && (
                                                    <p className="flex items-center gap-2">
                                                        <FiMapPin className="text-green-500 shrink-0" />
                                                        {oferta.ubicacion.municipio.nombre}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Motivo rechazo */}
                                            {oferta.estado === 'rechazado' && oferta.comentario_coordinador && (
                                                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                                                    <p className="text-xs font-bold text-red-800 mb-1">Motivo del rechazo:</p>
                                                    <p className="text-xs text-red-700 line-clamp-3">{oferta.comentario_coordinador}</p>
                                                </div>
                                            )}

                                            {/* Acciones */}
                                            <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                                                <Link
                                                    to={`/ofertas/${oferta._id}`}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all"
                                                >
                                                    <FiEye /> Ver
                                                </Link>
                                                {(oferta.estado === 'pendiente' || oferta.estado === 'rechazado') && (
                                                    <Link
                                                        to={`/ofertas/editar/${oferta._id}`}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all"
                                                    >
                                                        <FiEdit /> Editar
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MisOfertas;