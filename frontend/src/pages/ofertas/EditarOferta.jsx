import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOfertas } from '../../context/OfertaContext';
import { useAuth } from '../../context/AuthContext';
import ofertaApi from '../../services/ofertaApi';
import Navbar from '../../components/Navbar';
import { FiSave, FiArrowLeft, FiAlertCircle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EditarOferta = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { referencias, cargarReferencias, actualizarOferta } = useOfertas();

    const [oferta, setOferta] = useState(null);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [busquedaPrograma, setBusquedaPrograma] = useState('');
    const [mostrarListaPrograma, setMostrarListaPrograma] = useState(false);

    useEffect(() => { cargarDatos(); }, [id]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await cargarReferencias();
            const data = await ofertaApi.getOferta(id);

            if (data.estado !== 'pendiente' && data.estado !== 'rechazado') {
                setError(`No puedes editar una ficha en estado: ${data.estado}`);
                return;
            }

            setOferta(data);
            const nombreProg = data.programa_formacion?.nombre_programa || data.programa_formacion?.nombre || '';
            setBusquedaPrograma(nombreProg);

            setFormData({
                programa_formacion: data.programa_formacion?._id || data.programa_formacion,
                modalidad: data.modalidad?._id || data.modalidad,
                tipo_programa: data.tipo_programa?._id || data.tipo_programa,
                tipo_oferta: data.tipo_oferta?._id || data.tipo_oferta,
                cupo_maximo: data.cupo_maximo,
                duracion_meses: data.duracion_meses,
                ambiente: { nombre: data.ambiente?.nombre || '' },
                fechas: {
                    inicio: data.fechas?.inicio ? new Date(data.fechas.inicio).toISOString().split('T')[0] : '',
                    fin: data.fechas?.fin ? new Date(data.fechas.fin).toISOString().split('T')[0] : ''
                },
                ubicacion: {
                    departamento: data.ubicacion?.departamento || 'Cauca',
                    municipio: data.ubicacion?.municipio?._id || data.ubicacion?.municipio,
                    direccion: data.ubicacion?.direccion || ''
                },
                subsector_economico: { nombre: data.subsector_economico?.nombre || '' },
                convenio: { nombre: data.convenio?.nombre || '' },
                horario: data.horario || { hora_inicio: '', hora_fin: '', dias: [] },
                coordinador_asignado: data.coordinador_asignado?._id || user?.coordinador_asignado?._id || ''
            });
        } catch (err) {
            console.error(err);
            setError('Error al cargar la ficha');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const toggleDia = (dia) => {
        setFormData(prev => ({
            ...prev,
            horario: {
                ...prev.horario,
                dias: prev.horario.dias.includes(dia)
                    ? prev.horario.dias.filter(d => d !== dia)
                    : [...prev.horario.dias, dia]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.programa_formacion) return toast.error('Selecciona un programa de la lista');
        if (!formData.fechas.inicio || !formData.fechas.fin) return toast.error('Las fechas son obligatorias');

        setSaving(true);
        const result = await actualizarOferta(id, formData);
        if (result.success) navigate('/ofertas/mis-ofertas');
        setSaving(false);
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando ficha...</p>
                </div>
            </div>
        </>
    );

    if (error) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
                    <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No se puede editar</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => navigate('/ofertas/mis-ofertas')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">
                        Volver a mis fichas
                    </button>
                </div>
            </div>
        </>
    );

    if (!formData) return null;

    const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const mapCorto = { 'Lunes':'L','Martes':'M','Miércoles':'Mi','Jueves':'J','Viernes':'V','Sábado':'S' };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 font-medium">
                        <FiArrowLeft /> Volver
                    </button>

                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
                        <h1 className="text-3xl font-bold mb-1">Editar Ficha</h1>
                        <p className="text-yellow-100">
                            {oferta?.estado === 'rechazado' ? 'Corrige los problemas y vuelve a enviar' : 'Modifica los datos de la ficha'}
                        </p>
                    </div>

                    {oferta?.estado === 'rechazado' && oferta?.comentario_coordinador && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
                            <p className="font-bold text-red-800 mb-1">💬 Motivo del rechazo:</p>
                            <p className="text-red-700">{oferta.comentario_coordinador}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Sección Programa */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">📚 Programa de Formación</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Combobox programa */}
                                <div className="md:col-span-2 relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Programa *</label>
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar programa por nombre..."
                                            value={busquedaPrograma}
                                            onChange={e => {
                                                setBusquedaPrograma(e.target.value);
                                                setMostrarListaPrograma(true);
                                                if (formData.programa_formacion) setFormData(prev => ({ ...prev, programa_formacion: '' }));
                                            }}
                                            onFocus={() => setMostrarListaPrograma(true)}
                                            onBlur={() => setTimeout(() => setMostrarListaPrograma(false), 200)}
                                            className={`w-full pl-9 pr-4 py-3 border-2 rounded-xl transition-colors ${formData.programa_formacion ? 'border-green-400 bg-green-50' : 'border-gray-200 focus:border-green-400'}`}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {formData.programa_formacion && (
                                        <p className="text-xs text-green-600 mt-1 font-medium">✅ Programa seleccionado</p>
                                    )}
                                    {mostrarListaPrograma && busquedaPrograma.length > 0 && (
                                        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto mt-1">
                                            {(referencias.programas || [])
                                                .filter(p => p.nombre_programa.toLowerCase().includes(busquedaPrograma.toLowerCase()))
                                                .slice(0, 50)
                                                .map(p => (
                                                    <li key={p._id}
                                                        onMouseDown={e => {
                                                            e.preventDefault();
                                                            setFormData(prev => ({ ...prev, programa_formacion: p._id }));
                                                            setBusquedaPrograma(p.nombre_programa);
                                                            setMostrarListaPrograma(false);
                                                        }}
                                                        className={`px-4 py-2.5 cursor-pointer hover:bg-green-50 text-sm border-b border-gray-50 last:border-0 ${formData.programa_formacion === p._id ? 'bg-green-100 font-semibold text-green-800' : 'text-gray-700'}`}
                                                    >
                                                        {p.nombre_programa}
                                                    </li>
                                                ))}
                                            {!(referencias.programas || []).some(p => p.nombre_programa.toLowerCase().includes(busquedaPrograma.toLowerCase())) && (
                                                <li className="px-4 py-3 text-gray-400 text-sm text-center">Sin resultados</li>
                                            )}
                                        </ul>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Modalidad *</label>
                                    <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" required>
                                        <option value="">Selecciona</option>
                                        {referencias.modalidades?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de oferta *</label>
                                    <select name="tipo_oferta" value={formData.tipo_oferta} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" required>
                                        <option value="">Selecciona</option>
                                        {referencias.tiposOferta?.filter(t => ['Cerrada','Pública','Publica'].includes(t.nombre)).map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cupo máximo *</label>
                                    <input type="number" name="cupo_maximo" value={formData.cupo_maximo} onChange={handleChange} min="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ambiente</label>
                                    <input type="text" name="ambiente.nombre" value={formData.ambiente.nombre} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Sección Ubicación */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">📍 Ubicación</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Municipio</label>
                                    <select name="ubicacion.municipio" value={formData.ubicacion.municipio} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors">
                                        <option value="">Selecciona</option>
                                        {referencias.municipios?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                                    <input type="text" name="ubicacion.direccion" value={formData.ubicacion.direccion} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subsector económico</label>
                                    <input type="text" name="subsector_economico.nombre" value={formData.subsector_economico.nombre} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Convenio</label>
                                    <input type="text" name="convenio.nombre" value={formData.convenio.nombre} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Sección Horario */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">🗓 Horario y Fechas</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha inicio *</label>
                                    <input type="date" name="fechas.inicio" value={formData.fechas.inicio} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha fin *</label>
                                    <input type="date" name="fechas.fin" value={formData.fechas.fin} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hora inicio</label>
                                    <input type="time" name="horario.hora_inicio" value={formData.horario.hora_inicio} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hora fin</label>
                                    <input type="time" name="horario.hora_fin" value={formData.horario.hora_fin} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 transition-colors" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Días de clase</label>
                                    <div className="flex flex-wrap gap-2">
                                        {dias.map(dia => {
                                            const activo = formData.horario.dias.includes(dia);
                                            return (
                                                <button key={dia} type="button" onClick={() => toggleDia(dia)}
                                                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold text-sm transition-all border-2 select-none
                                                        ${activo ? 'bg-green-600 text-white border-green-600 shadow-md scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600'}`}
                                                >
                                                    <span className="text-base leading-none">{mapCorto[dia]}</span>
                                                    <span className="text-[10px] font-normal mt-0.5 opacity-80">{dia.slice(0,3)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {formData.horario.dias.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-2">Seleccionados: <span className="font-semibold text-green-700">{formData.horario.dias.join(', ')}</span></p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-4 pb-6">
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 transition-all disabled:opacity-60">
                                {saving
                                    ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Guardando...</>
                                    : <><FiSave /> Guardar cambios</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditarOferta;