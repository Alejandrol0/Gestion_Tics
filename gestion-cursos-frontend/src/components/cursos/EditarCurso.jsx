import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCursos } from '../../context/CursoContext';
import { useAuth } from '../../context/AuthContext';
import cursoApi from '../../services/cursoApi';
import { FiSave, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

const EditarCurso = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { referencias, coordinadores, cargarReferencias, cargarCoordinadores, actualizarCurso } = useCursos();
    
    const [curso, setCurso] = useState(null);
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
            await Promise.all([
                cargarReferencias(),
                cargarCoordinadores()
            ]);
            
            const cursoData = await cursoApi.getCurso(id);
            
            // Verificar que el instructor puede editar este curso
            if (user.role === 'instructor' && cursoData.creado_por?._id !== user._id) {
                setError('No tienes permiso para editar este curso');
                return;
            }

            // Verificar estado del curso
            if (cursoData.estado !== 'pendiente' && cursoData.estado !== 'rechazada') {
                setError(`No puedes editar un curso en estado: ${cursoData.estado}`);
                return;
            }

            setCurso(cursoData);
            setFormData(cursoData);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar la información del curso');
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
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const result = await actualizarCurso(id, formData);

        if (result.success) {
            navigate(`/cursos/${id}`);
        }

        setSaving(false);
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No se puede editar</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
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

    if (!formData) return null;

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

                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Editar oferta de curso</h1>
                    <p className="text-yellow-100">
                        {curso.estado === 'rechazada' 
                            ? 'Corrige los problemas señalados y vuelve a enviar' 
                            : 'Modifica la información del curso'}
                    </p>
                </div>

                {/* Advertencia para cursos rechazados */}
                {formData.estado === 'rechazada' && formData.comentarios_rechazo && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                        <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                            <FiAlertCircle /> Motivo del rechazo:
                        </h3>
                        <p className="text-red-700">{formData.comentarios_rechazo}</p>
                        <p className="text-sm text-red-600 mt-2">
                            Al guardar, el curso volverá a estado "pendiente" para revisión
                        </p>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Programa formación */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Programa de formación
                            </label>
                            <select
                                name="programa_formacion"
                                value={formData.programa_formacion?._id || formData.programa_formacion}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona un programa</option>
                                {referencias.programas?.map(p => (
                                    <option key={p._id} value={p._id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Modalidad */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Modalidad
                            </label>
                            <select
                                name="modalidad"
                                value={formData.modalidad?._id || formData.modalidad}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona una modalidad</option>
                                {referencias.modalidades?.map(m => (
                                    <option key={m._id} value={m._id}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo programa */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Tipo de programa
                            </label>
                            <select
                                name="tipo_programa"
                                value={formData.tipo_programa?._id || formData.tipo_programa}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona un tipo</option>
                                {referencias.tiposPrograma?.map(t => (
                                    <option key={t._id} value={t._id}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo oferta */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Tipo de oferta
                            </label>
                            <select
                                name="tipo_oferta"
                                value={formData.tipo_oferta?._id || formData.tipo_oferta}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona un tipo</option>
                                {referencias.tiposOferta?.map(t => (
                                    <option key={t._id} value={t._id}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cupo máximo */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Cupo máximo
                            </label>
                            <input
                                type="number"
                                name="cupo_maximo"
                                value={formData.cupo_maximo}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            />
                        </div>

                        {/* Coordinador asignado */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Coordinador asignado
                            </label>
                            <select
                                name="coordinador_asignado"
                                value={formData.coordinador_asignado?._id || formData.coordinador_asignado}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona un coordinador</option>
                                {coordinadores.map(c => (
                                    <option key={c._id} value={c._id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fechas */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Inicio del curso
                            </label>
                            <input
                                type="date"
                                name="fechas.inicio_curso"
                                value={formData.fechas?.inicio_curso?.split('T')[0] || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Fin del curso
                            </label>
                            <input
                                type="date"
                                name="fechas.fin_curso"
                                value={formData.fechas?.fin_curso?.split('T')[0] || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <FiSave className="text-xl" />
                                    <span>Guardar cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarCurso;