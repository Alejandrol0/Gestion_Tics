// pages/ofertas/EditarOferta.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOfertas } from '../../context/OfertaContext';
import { useAuth } from '../../context/AuthContext';
import ofertaApi from '../../services/ofertaApi';
import { FiSave, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

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

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await cargarReferencias();
            const data = await ofertaApi.getOferta(id);
            
            // Verificar permisos
            if (user.role === 'instructor' && data.creado_por?._id !== user._id) {
                setError('No tienes permiso para editar esta oferta');
                return;
            }
            if (data.estado !== 'pendiente' && data.estado !== 'rechazado') {
                setError(`No puedes editar una oferta en estado: ${data.estado}`);
                return;
            }

            setOferta(data);
            // Mapear datos al formulario
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
        } catch (error) {
            console.error(error);
            setError('Error al cargar la oferta');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = await actualizarOferta(id, formData);
        if (result.success) {
            navigate('/ofertas/mis-ofertas');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando oferta...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No se puede editar</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/ofertas/mis-ofertas')}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
                    >
                        Volver a mis ofertas
                    </button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
                    <FiArrowLeft /> Volver
                </button>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Editar oferta</h1>
                    <p className="text-yellow-100">
                        {oferta?.estado === 'rechazado' ? 'Corrige los problemas y vuelve a enviar' : 'Modifica los datos de la oferta'}
                    </p>
                </div>

                {oferta?.estado === 'rechazado' && oferta?.comentario_coordinador && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                        <h3 className="font-bold text-red-800 mb-2">Motivo del rechazo:</h3>
                        <p className="text-red-700">{oferta.comentario_coordinador}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Programa formación */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Programa de formación *</label>
                            <select name="programa_formacion" value={formData.programa_formacion} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" required>
                                <option value="">Selecciona</option>
                                {referencias.programas?.map(p => <option key={p._id} value={p._id}>{p.nombre_programa}</option>)}
                            </select>
                        </div>
                        {/* Modalidad */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Modalidad *</label>
                            <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" required>
                                <option value="">Selecciona</option>
                                {referencias.modalidades?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                            </select>
                        </div>
                        {/* Tipo programa */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Tipo de programa *</label>
                            <select name="tipo_programa" value={formData.tipo_programa} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" required>
                                <option value="">Selecciona</option>
                                {referencias.tiposProg?.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                            </select>
                        </div>
                        {/* Tipo oferta */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Tipo de oferta *</label>
                            <select name="tipo_oferta" value={formData.tipo_oferta} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" required>
                                <option value="">Selecciona</option>
                                {referencias.tiposOferta?.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                            </select>
                        </div>
                        {/* Cupo máximo */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Cupo máximo *</label>
                            <input type="number" name="cupo_maximo" value={formData.cupo_maximo} onChange={handleChange} min="1" className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" required />
                        </div>
                        {/* Coordinador (solo si el usuario puede cambiarlo, normalmente no) */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Coordinador asignado</label>
                            <input type="text" value={user?.coordinador_asignado?.nombre || 'No asignado'} disabled className="w-full px-4 py-3 border-2 rounded-xl bg-gray-100" />
                        </div>
                        {/* Fechas */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Inicio del curso</label>
                            <input type="date" name="fechas.inicio" value={formData.fechas.inicio} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Fin del curso</label>
                            <input type="date" name="fechas.fin" value={formData.fechas.fin} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" required />
                        </div>
                        {/* Ubicación */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Municipio</label>
                            <select name="ubicacion.municipio" value={formData.ubicacion.municipio} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500">
                                <option value="">Selecciona</option>
                                {referencias.municipios?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Dirección</label>
                            <input type="text" name="ubicacion.direccion" value={formData.ubicacion.direccion} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:border-green-500" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600">Cancelar</button>
                        <button type="submit" disabled={saving} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2">
                            {saving ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Guardando...</> : <><FiSave /> Guardar cambios</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarOferta;