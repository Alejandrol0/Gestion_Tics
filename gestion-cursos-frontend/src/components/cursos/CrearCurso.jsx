import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCursos } from '../../context/CursoContext';
import { FiSave, FiCalendar, FiMapPin, FiUsers, FiClock, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CrearCurso = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tipoOferta = new URLSearchParams(location.search).get('tipo'); // 'regular' o 'campesena'
    const { user } = useAuth();
    const { referencias, coordinadores, cargarReferencias, cargarCoordinadores, crearCurso } = useCursos();

    const [formData, setFormData] = useState({
        programa_formacion: '',
        modalidad: '',
        tipo_programa: '',
        tipo_oferta: '',
        cupo_maximo: '',
        // Campos para Regular
        fechas_ejecucion: [], // array de objetos { mes, fechas, horas }
        // Campos para Campesena
        instructor_tecnico: '',
        instructor_empresarial: '',
        instructor_full_popular: '',
        sector_centro: '',
        programa_especial: '',
        // Resto de campos
        ambiente: {
            nombre: '',
            tipo: '',
            capacidad: '',
            recursos: []
        },
        fechas: {
            inicio_inscripciones: '',
            fin_inscripciones: '',
            inicio_curso: '',
            fin_curso: ''
        },
        ubicacion: {
            direccion: '',
            ciudad: '',
            municipio: '',
            sala: ''
        },
        empresa_solicitante: {
            nombre: '',
            nit: '',
            contacto: '',
            email: '',
            telefono: ''
        },
        subsector_economico: {
            nombre: '',
            codigo: ''
        },
        convenio: {
            numero: '',
            empresa: '',
            fecha_inicio: '',
            fecha_fin: ''
        },
        horario: {
            dias: [],
            hora_inicio: '',
            hora_fin: '',
            jornada: ''
        },
        coordinador_asignado: user?.coordinador_asignado?._id || ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [recursoInput, setRecursoInput] = useState('');
    const [diaInput, setDiaInput] = useState('');

    // Para agregar fechas de ejecución (Regular)
    const [nuevaFechaEjecucion, setNuevaFechaEjecucion] = useState({ mes: '', fechas: '', horas: '' });

    const steps = [
        { number: 1, title: 'Información básica' },
        { number: 2, title: 'Fechas y ubicación' },
        { number: 3, title: 'Ambiente y recursos' },
        { number: 4, title: 'Horario' },
        { number: 5, title: 'Empresa y convenio' },
        { number: 6, title: 'Revisión' }
    ];

    useEffect(() => {
        cargarReferencias();
        cargarCoordinadores();
    }, []);

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
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleArrayInput = (field, value, action) => {
        if (action === 'add' && value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    recursos: [...(prev[field].recursos || []), value.trim()]
                }
            }));
        } else if (action === 'remove' && value) {
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    recursos: prev[field].recursos.filter(r => r !== value)
                }
            }));
        }
    };

    const handleDiasInput = (dia) => {
        if (dia && !formData.horario.dias.includes(dia)) {
            setFormData(prev => ({
                ...prev,
                horario: { ...prev.horario, dias: [...prev.horario.dias, dia] }
            }));
        }
    };

    const removeDia = (dia) => {
        setFormData(prev => ({
            ...prev,
            horario: { ...prev.horario, dias: prev.horario.dias.filter(d => d !== dia) }
        }));
    };

    // Agregar fecha de ejecución para Regular
    const agregarFechaEjecucion = () => {
        if (nuevaFechaEjecucion.mes && nuevaFechaEjecucion.fechas) {
            setFormData(prev => ({
                ...prev,
                fechas_ejecucion: [...prev.fechas_ejecucion, { ...nuevaFechaEjecucion, horas: Number(nuevaFechaEjecucion.horas) || 0 }]
            }));
            setNuevaFechaEjecucion({ mes: '', fechas: '', horas: '' });
        } else {
            toast.error('Completa mes y descripción de fechas');
        }
    };

    const eliminarFechaEjecucion = (index) => {
        setFormData(prev => ({
            ...prev,
            fechas_ejecucion: prev.fechas_ejecucion.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.programa_formacion) newErrors.programa_formacion = 'Selecciona un programa';
        if (!formData.modalidad) newErrors.modalidad = 'Selecciona una modalidad';
        if (!formData.tipo_programa) newErrors.tipo_programa = 'Selecciona un tipo de programa';
        if (!formData.tipo_oferta) newErrors.tipo_oferta = 'Selecciona un tipo de oferta';
        if (!formData.cupo_maximo) newErrors.cupo_maximo = 'Ingresa el cupo máximo';
        if (!formData.coordinador_asignado) newErrors.coordinador_asignado = 'Selecciona un coordinador';

        if (formData.fechas.inicio_curso && formData.fechas.fin_curso) {
            if (new Date(formData.fechas.inicio_curso) >= new Date(formData.fechas.fin_curso)) {
                newErrors.fechas = 'La fecha de fin debe ser posterior a la fecha de inicio';
            }
        }

        // Validaciones específicas según tipo
        if (tipoOferta === 'regular' && formData.fechas_ejecucion.length === 0) {
            newErrors.fechas_ejecucion = 'Debes agregar al menos una fecha de ejecución';
        }
        if (tipoOferta === 'campesena' && !formData.sector_centro) {
            newErrors.sector_centro = 'Debes seleccionar un sector centro';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🛡️ Guard: evita múltiples submits
        if (loading) return;

        if (!validateForm()) {
            setStep(1);
            return;
        }

        setLoading(true);

        try {
            let payload = {
                programa_formacion: formData.programa_formacion,
                modalidad: formData.modalidad,
                tipo_programa: formData.tipo_programa,
                tipo_oferta: formData.tipo_oferta,
                cupo_maximo: Number(formData.cupo_maximo),
                // ✅ Solo incluir coordinador si tiene valor real
                ...(formData.coordinador_asignado && { coordinador_asignado: formData.coordinador_asignado }),
            };

            if (formData.fechas.inicio_curso && formData.fechas.fin_curso) {
                payload.fechas = {
                    inicio_curso: formData.fechas.inicio_curso,
                    fin_curso: formData.fechas.fin_curso
                };
            }

            if (tipoOferta === 'regular') {
                payload.datos_regular = {
                    fechas_ejecucion: formData.fechas_ejecucion
                };
            } else if (tipoOferta === 'campesena') {
                payload.datos_campesena = {
                    instructor_tecnico: formData.instructor_tecnico || null,
                    instructor_empresarial: formData.instructor_empresarial || null,
                    instructor_full_popular: formData.instructor_full_popular || null,
                    sector_centro: formData.sector_centro,
                    programa_especial: formData.programa_especial || null,
                    duracion_meses: 5
                };
            }

            if (formData.ambiente?.nombre) payload.ambiente = formData.ambiente;
            if (formData.ubicacion?.direccion) payload.ubicacion = formData.ubicacion;
            if (formData.horario?.dias?.length) payload.horario = formData.horario;
            if (formData.empresa_solicitante?.nombre) payload.empresa_solicitante = formData.empresa_solicitante;
            if (formData.convenio?.numero) payload.convenio = formData.convenio;
            if (formData.subsector_economico?.nombre) payload.subsector_economico = formData.subsector_economico;

            console.log('📤 Enviando payload:', payload, 'tipo:', tipoOferta);

            const result = await crearCurso(payload, tipoOferta);

            if (result.success) {
                navigate('/cursos/mis-cursos');
            }
        } finally {
            setLoading(false); // ✅ Siempre se libera aunque falle
        }
    };

    if (user?.role !== 'instructor') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <FiBriefcase className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso denegado</h2>
                    <p className="text-gray-600">Solo los instructores pueden crear cursos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Crear nueva oferta de curso</h1>
                    <p className="text-green-100">Tipo: <span className="font-bold uppercase">{tipoOferta}</span></p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap justify-between items-center">
                        {steps.map((s) => (
                            <div key={s.number} className={`flex items-center gap-2 ${step === s.number ? 'text-green-600 font-bold' : step > s.number ? 'text-green-500' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s.number ? 'bg-green-600 text-white' : step > s.number ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s.number ? '✓' : s.number}
                                </div>
                                <span className="hidden md:inline text-sm">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    {/* Paso 1: Información básica (igual que antes) */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">Información básica del curso</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Programa, modalidad, tipo programa, tipo oferta, cupo, coordinador - igual que tu código original */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Programa de formación *</label>
                                    <select name="programa_formacion" value={formData.programa_formacion} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500">
                                        <option value="">Selecciona un programa</option>
                                        {referencias.programas?.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                                    </select>
                                    {errors.programa_formacion && <p className="text-red-500 text-sm mt-1">{errors.programa_formacion}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Modalidad *</label>
                                    <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500">
                                        <option value="">Selecciona una modalidad</option>
                                        {referencias.modalidades?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                                    </select>
                                    {errors.modalidad && <p className="text-red-500 text-sm mt-1">{errors.modalidad}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Tipo de programa *</label>
                                    <select name="tipo_programa" value={formData.tipo_programa} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500">
                                        <option value="">Selecciona un tipo</option>
                                        {referencias.tiposPrograma?.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                                    </select>
                                    {errors.tipo_programa && <p className="text-red-500 text-sm mt-1">{errors.tipo_programa}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Tipo de oferta *</label>
                                    <select name="tipo_oferta" value={formData.tipo_oferta} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500">
                                        <option value="">Selecciona un tipo</option>
                                        {referencias.tiposOferta?.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                                    </select>
                                    {errors.tipo_oferta && <p className="text-red-500 text-sm mt-1">{errors.tipo_oferta}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Cupo máximo *</label>
                                    <input type="number" name="cupo_maximo" value={formData.cupo_maximo} onChange={handleChange} min="1" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500" />
                                    {errors.cupo_maximo && <p className="text-red-500 text-sm mt-1">{errors.cupo_maximo}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Coordinador asignado *</label>
                                    <select name="coordinador_asignado" value={formData.coordinador_asignado} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500">
                                        <option value="">Selecciona un coordinador</option>
                                        {coordinadores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                                    </select>
                                    {errors.coordinador_asignado && <p className="text-red-500 text-sm mt-1">{errors.coordinador_asignado}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Fechas y ubicación + campos específicos según tipo */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">Fechas y ubicación</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-gray-700 font-semibold mb-2">Inicio de inscripciones</label><input type="date" name="fechas.inicio_inscripciones" value={formData.fechas.inicio_inscripciones} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" /></div>
                                <div><label className="block text-gray-700 font-semibold mb-2">Fin de inscripciones</label><input type="date" name="fechas.fin_inscripciones" value={formData.fechas.fin_inscripciones} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" /></div>
                                <div><label className="block text-gray-700 font-semibold mb-2">Inicio del curso</label><input type="date" name="fechas.inicio_curso" value={formData.fechas.inicio_curso} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" /></div>
                                <div><label className="block text-gray-700 font-semibold mb-2">Fin del curso</label><input type="date" name="fechas.fin_curso" value={formData.fechas.fin_curso} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" /></div>
                            </div>

                            {/* --- CAMPOS ESPECÍFICOS SEGÚN TIPO DE OFERTA --- */}
                            {tipoOferta === 'regular' && (
                                <div className="border-t pt-6 mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Fechas de ejecución (Regular)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <input type="number" placeholder="Mes (1-5)" value={nuevaFechaEjecucion.mes} onChange={(e) => setNuevaFechaEjecucion({...nuevaFechaEjecucion, mes: e.target.value})} className="px-4 py-2 border rounded-xl" />
                                        <input type="text" placeholder="Fechas (ej. Lunes y miércoles)" value={nuevaFechaEjecucion.fechas} onChange={(e) => setNuevaFechaEjecucion({...nuevaFechaEjecucion, fechas: e.target.value})} className="px-4 py-2 border rounded-xl" />
                                        <input type="number" placeholder="Horas" value={nuevaFechaEjecucion.horas} onChange={(e) => setNuevaFechaEjecucion({...nuevaFechaEjecucion, horas: e.target.value})} className="px-4 py-2 border rounded-xl" />
                                    </div>
                                    <button type="button" onClick={agregarFechaEjecucion} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700">Agregar fecha</button>
                                    {formData.fechas_ejecucion.length > 0 && (
                                        <div className="mt-4">
                                            <p className="font-semibold">Fechas agregadas:</p>
                                            <ul className="list-disc list-inside">
                                                {formData.fechas_ejecucion.map((f, idx) => (
                                                    <li key={idx} className="flex justify-between items-center">
                                                        Mes {f.mes}: {f.fechas} - {f.horas} horas
                                                        <button type="button" onClick={() => eliminarFechaEjecucion(idx)} className="text-red-500 ml-4">Eliminar</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {errors.fechas_ejecucion && <p className="text-red-500 text-sm">{errors.fechas_ejecucion}</p>}
                                </div>
                            )}

                            {tipoOferta === 'campesena' && (
                                <div className="border-t pt-6 mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Datos CAMPESENA</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Instructor técnico</label>
                                            <input type="text" name="instructor_tecnico" value={formData.instructor_tecnico} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" placeholder="Nombre del instructor técnico" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Instructor empresarial</label>
                                            <input type="text" name="instructor_empresarial" value={formData.instructor_empresarial} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" placeholder="Nombre del instructor empresarial" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Instructor Full Popular</label>
                                            <input type="text" name="instructor_full_popular" value={formData.instructor_full_popular} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" placeholder="Nombre del instructor full popular" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Sector centro *</label>
                                            <select name="sector_centro" value={formData.sector_centro} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl">
                                                <option value="">Selecciona un sector</option>
                                                {referencias.sectores?.map(s => <option key={s._id} value={s._id}>{s.nombre}</option>)}
                                            </select>
                                            {errors.sector_centro && <p className="text-red-500 text-sm">{errors.sector_centro}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Programa especial</label>
                                            <select name="programa_especial" value={formData.programa_especial} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl">
                                                <option value="">Selecciona un programa especial</option>
                                                {referencias.programasEspeciales?.map(pe => <option key={pe._id} value={pe._id}>{pe.nombre}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ubicación (igual que antes) */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubicación</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <input type="text" name="ubicacion.direccion" value={formData.ubicacion.direccion} onChange={handleChange} placeholder="Dirección" className="px-4 py-3 border rounded-xl" />
                                    <input type="text" name="ubicacion.ciudad" value={formData.ubicacion.ciudad} onChange={handleChange} placeholder="Ciudad" className="px-4 py-3 border rounded-xl" />
                                    <input type="text" name="ubicacion.sala" value={formData.ubicacion.sala} onChange={handleChange} placeholder="Sala / Aula" className="px-4 py-3 border rounded-xl" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Ambiente y recursos (igual que tu código) */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">Ambiente y recursos</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" name="ambiente.nombre" value={formData.ambiente.nombre} onChange={handleChange} placeholder="Nombre del ambiente" className="px-4 py-3 border rounded-xl" />
                                <input type="text" name="ambiente.tipo" value={formData.ambiente.tipo} onChange={handleChange} placeholder="Tipo de ambiente" className="px-4 py-3 border rounded-xl" />
                                <input type="number" name="ambiente.capacidad" value={formData.ambiente.capacidad} onChange={handleChange} placeholder="Capacidad" className="px-4 py-3 border rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Recursos</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={recursoInput} onChange={(e) => setRecursoInput(e.target.value)} className="flex-1 px-4 py-3 border rounded-xl" placeholder="Ej: Computadores" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleArrayInput('ambiente', recursoInput, 'add'); setRecursoInput(''); } }} />
                                    <button type="button" onClick={() => { handleArrayInput('ambiente', recursoInput, 'add'); setRecursoInput(''); }} className="px-6 py-3 bg-green-600 text-white rounded-xl">Agregar</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.ambiente.recursos?.map((r, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
                                            {r} <button type="button" onClick={() => handleArrayInput('ambiente', r, 'remove')} className="text-green-600">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 4: Horario (igual que tu código) */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">Horario del curso</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <input type="time" name="horario.hora_inicio" value={formData.horario.hora_inicio} onChange={handleChange} className="px-4 py-3 border rounded-xl" />
                                <input type="time" name="horario.hora_fin" value={formData.horario.hora_fin} onChange={handleChange} className="px-4 py-3 border rounded-xl" />
                                <select name="horario.jornada" value={formData.horario.jornada} onChange={handleChange} className="px-4 py-3 border rounded-xl">
                                    <option value="">Jornada</option>
                                    <option value="mañana">Mañana</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="noche">Noche</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Días de clase</label>
                                <div className="flex gap-2">
                                    <select value={diaInput} onChange={(e) => setDiaInput(e.target.value)} className="flex-1 px-4 py-3 border rounded-xl">
                                        <option value="">Selecciona un día</option>
                                        <option value="Lunes">Lunes</option>
                                        <option value="Martes">Martes</option>
                                        <option value="Miércoles">Miércoles</option>
                                        <option value="Jueves">Jueves</option>
                                        <option value="Viernes">Viernes</option>
                                        <option value="Sábado">Sábado</option>
                                    </select>
                                    <button type="button" onClick={() => { handleDiasInput(diaInput); setDiaInput(''); }} className="px-6 py-3 bg-green-600 text-white rounded-xl">Agregar</button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.horario.dias.map((dia, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
                                            {dia} <button type="button" onClick={() => removeDia(dia)} className="text-green-600">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 5: Empresa y convenio (igual que tu código, lo dejo igual) */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">Empresa solicitante y convenio</h2>
                            {referencias.tiposOferta?.find(t => t._id === formData.tipo_oferta)?.nombre?.toLowerCase() === 'cerrada' ? (
                                <>
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                                        <p className="text-blue-800 flex items-center gap-2"><FiBriefcase className="text-xl" />Oferta <strong>CERRADA</strong> - Se requieren datos de la empresa</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="text-lg font-semibold mb-4">Empresa solicitante</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input type="text" name="empresa_solicitante.nombre" value={formData.empresa_solicitante.nombre} onChange={handleChange} placeholder="Nombre empresa" className="px-4 py-3 border rounded-xl" />
                                            <input type="text" name="empresa_solicitante.nit" value={formData.empresa_solicitante.nit} onChange={handleChange} placeholder="NIT" className="px-4 py-3 border rounded-xl" />
                                            <input type="text" name="empresa_solicitante.contacto" value={formData.empresa_solicitante.contacto} onChange={handleChange} placeholder="Contacto" className="px-4 py-3 border rounded-xl" />
                                            <input type="email" name="empresa_solicitante.email" value={formData.empresa_solicitante.email} onChange={handleChange} placeholder="Email" className="px-4 py-3 border rounded-xl" />
                                            <input type="text" name="empresa_solicitante.telefono" value={formData.empresa_solicitante.telefono} onChange={handleChange} placeholder="Teléfono" className="px-4 py-3 border rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="text-lg font-semibold mb-4">Convenio</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input type="text" name="convenio.numero" value={formData.convenio.numero} onChange={handleChange} placeholder="N° convenio" className="px-4 py-3 border rounded-xl" />
                                            <input type="text" name="convenio.empresa" value={formData.convenio.empresa} onChange={handleChange} placeholder="Empresa convenio" className="px-4 py-3 border rounded-xl" />
                                            <input type="date" name="convenio.fecha_inicio" value={formData.convenio.fecha_inicio} onChange={handleChange} className="px-4 py-3 border rounded-xl" />
                                            <input type="date" name="convenio.fecha_fin" value={formData.convenio.fecha_fin} onChange={handleChange} className="px-4 py-3 border rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="text-lg font-semibold mb-4">Subsector económico</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input type="text" name="subsector_economico.nombre" value={formData.subsector_economico.nombre} onChange={handleChange} placeholder="Nombre subsector" className="px-4 py-3 border rounded-xl" />
                                            <input type="text" name="subsector_economico.codigo" value={formData.subsector_economico.codigo} onChange={handleChange} placeholder="Código" className="px-4 py-3 border rounded-xl" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                                    <FiBriefcase className="text-5xl text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Oferta no cerrada</h3>
                                    <p className="text-gray-600">Los datos de empresa, convenio y subsector económico solo son necesarios para ofertas de tipo <strong>CERRADA</strong>.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paso 6: Revisión (igual que tu código) */}
                    {step === 6 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">Revisa la información</h2>
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <p className="text-green-800 mb-4">Por favor revisa que toda la información sea correcta antes de enviar.</p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    <li>El curso quedará en estado <span className="font-bold text-yellow-600">"pendiente"</span></li>
                                    <li>Será revisado por el coordinador asignado</li>
                                    <li>Recibirás una notificación cuando sea aprobado o rechazado</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Resumen de la información:</h3>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><dt className="text-sm text-gray-500">Programa:</dt><dd className="font-medium">{referencias.programas?.find(p => p._id === formData.programa_formacion)?.nombre || 'No seleccionado'}</dd></div>
                                    <div><dt className="text-sm text-gray-500">Modalidad:</dt><dd className="font-medium">{referencias.modalidades?.find(m => m._id === formData.modalidad)?.nombre || 'No seleccionado'}</dd></div>
                                    <div><dt className="text-sm text-gray-500">Tipo de programa:</dt><dd className="font-medium">{referencias.tiposPrograma?.find(t => t._id === formData.tipo_programa)?.nombre || 'No seleccionado'}</dd></div>
                                    <div><dt className="text-sm text-gray-500">Tipo de oferta:</dt><dd className="font-medium">{referencias.tiposOferta?.find(t => t._id === formData.tipo_oferta)?.nombre || 'No seleccionado'}</dd></div>
                                    <div><dt className="text-sm text-gray-500">Cupo máximo:</dt><dd className="font-medium">{formData.cupo_maximo || 'No especificado'}</dd></div>
                                    <div><dt className="text-sm text-gray-500">Coordinador:</dt><dd className="font-medium">{coordinadores.find(c => c._id === formData.coordinador_asignado)?.nombre || 'No seleccionado'}</dd></div>
                                    {formData.fechas.inicio_curso && <div><dt className="text-sm text-gray-500">Fechas del curso:</dt><dd className="font-medium">{new Date(formData.fechas.inicio_curso).toLocaleDateString()} - {new Date(formData.fechas.fin_curso).toLocaleDateString()}</dd></div>}
                                </dl>
                            </div>
                        </div>
                    )}

                    {/* Navegación entre pasos */}
                    <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
                        <button type="button" onClick={() => setStep(step - 1)} disabled={step === 1} className={`px-6 py-3 rounded-xl font-semibold ${step === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-500 text-white hover:bg-gray-600'}`}>← Anterior</button>
                        {step < 6 ? (
                            <button type="button" onClick={() => { if (step === 1 && (!formData.programa_formacion || !formData.modalidad || !formData.tipo_programa || !formData.tipo_oferta || !formData.cupo_maximo || !formData.coordinador_asignado)) { toast.error('Completa todos los campos obligatorios'); return; } setStep(step + 1); }} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Siguiente →</button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={(e) => { if (loading) e.preventDefault(); }}  // ← guard extra
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (<> <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Creando curso... </>) : (<> <FiSave className="text-xl" /> Crear curso </>)}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearCurso;