import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCursos } from '../../context/CursoContext';
import { FiSave, FiCalendar, FiMapPin, FiUsers, FiClock, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CrearCurso = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { referencias, coordinadores, cargarReferencias, cargarCoordinadores, crearCurso } = useCursos();

    const [formData, setFormData] = useState({
        programa_formacion: '',
        modalidad: '',
        tipo_programa: '',
        tipo_oferta: '',
        programa_especial: '',
        cupo_maximo: '',
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

    // ✅ PASOS DEL FORMULARIO
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

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
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
                horario: {
                    ...prev.horario,
                    dias: [...prev.horario.dias, dia]
                }
            }));
        }
    };

    const removeDia = (dia) => {
        setFormData(prev => ({
            ...prev,
            horario: {
                ...prev.horario,
                dias: prev.horario.dias.filter(d => d !== dia)
            }
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setStep(1);
            return;
        }

        setLoading(true);

        // Preparar datos mínimos (como en Postman)
        const datosMinimos = {
            programa_formacion: formData.programa_formacion,
            modalidad: formData.modalidad,
            tipo_programa: formData.tipo_programa,
            tipo_oferta: formData.tipo_oferta,
            cupo_maximo: Number(formData.cupo_maximo),
            coordinador_asignado: formData.coordinador_asignado
        };

        // Agregar fechas solo si están completas
        if (formData.fechas.inicio_curso && formData.fechas.fin_curso) {
            datosMinimos.fechas = {
                inicio_curso: formData.fechas.inicio_curso,
                fin_curso: formData.fechas.fin_curso
            };
        }

        console.log('📤 Enviando datos:', datosMinimos);

        const result = await crearCurso(datosMinimos);

        if (result.success) {
            navigate('/cursos/mis-cursos');
        }

        setLoading(false);
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
                    <p className="text-green-100">Completa el formulario para crear una nueva oferta de formación</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap justify-between items-center">
                        {steps.map((s) => (
                            <div
                                key={s.number}
                                className={`flex items-center gap-2 ${
                                    step === s.number
                                        ? 'text-green-600 font-bold'
                                        : step > s.number
                                        ? 'text-green-500'
                                        : 'text-gray-400'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    step === s.number
                                        ? 'bg-green-600 text-white'
                                        : step > s.number
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {step > s.number ? '✓' : s.number}
                                </div>
                                <span className="hidden md:inline text-sm">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    {/* Paso 1: Información básica */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                                Información básica del curso
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Programa de formación *
                                    </label>
                                    <select
                                        name="programa_formacion"
                                        value={formData.programa_formacion}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.programa_formacion ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Selecciona un programa</option>
                                        {referencias.programas?.map(p => (
                                            <option key={p._id} value={p._id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.programa_formacion && (
                                        <p className="text-red-500 text-sm mt-1">{errors.programa_formacion}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Modalidad *
                                    </label>
                                    <select
                                        name="modalidad"
                                        value={formData.modalidad}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.modalidad ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Selecciona una modalidad</option>
                                        {referencias.modalidades?.map(m => (
                                            <option key={m._id} value={m._id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.modalidad && (
                                        <p className="text-red-500 text-sm mt-1">{errors.modalidad}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Tipo de programa *
                                    </label>
                                    <select
                                        name="tipo_programa"
                                        value={formData.tipo_programa}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.tipo_programa ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Selecciona un tipo</option>
                                        {referencias.tiposPrograma?.map(t => (
                                            <option key={t._id} value={t._id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.tipo_programa && (
                                        <p className="text-red-500 text-sm mt-1">{errors.tipo_programa}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Tipo de oferta *
                                    </label>
                                    <select
                                        name="tipo_oferta"
                                        value={formData.tipo_oferta}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.tipo_oferta ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Selecciona un tipo</option>
                                        {referencias.tiposOferta?.map(t => (
                                            <option key={t._id} value={t._id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.tipo_oferta && (
                                        <p className="text-red-500 text-sm mt-1">{errors.tipo_oferta}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Cupo máximo *
                                    </label>
                                    <input
                                        type="number"
                                        name="cupo_maximo"
                                        value={formData.cupo_maximo}
                                        onChange={handleChange}
                                        min="1"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.cupo_maximo ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder="25"
                                    />
                                    {errors.cupo_maximo && (
                                        <p className="text-red-500 text-sm mt-1">{errors.cupo_maximo}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Coordinador asignado *
                                    </label>
                                    <select
                                        name="coordinador_asignado"
                                        value={formData.coordinador_asignado}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-green-500 ${
                                            errors.coordinador_asignado ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Selecciona un coordinador</option>
                                        {coordinadores.map(c => (
                                            <option key={c._id} value={c._id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.coordinador_asignado && (
                                        <p className="text-red-500 text-sm mt-1">{errors.coordinador_asignado}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Fechas y ubicación */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                                Fechas y ubicación
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Inicio de inscripciones
                                    </label>
                                    <input
                                        type="date"
                                        name="fechas.inicio_inscripciones"
                                        value={formData.fechas.inicio_inscripciones}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Fin de inscripciones
                                    </label>
                                    <input
                                        type="date"
                                        name="fechas.fin_inscripciones"
                                        value={formData.fechas.fin_inscripciones}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Inicio del curso
                                    </label>
                                    <input
                                        type="date"
                                        name="fechas.inicio_curso"
                                        value={formData.fechas.inicio_curso}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Fin del curso
                                    </label>
                                    <input
                                        type="date"
                                        name="fechas.fin_curso"
                                        value={formData.fechas.fin_curso}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                {errors.fechas && (
                                    <div className="col-span-2 text-red-500 text-sm">
                                        {errors.fechas}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 my-6 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubicación</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            name="ubicacion.direccion"
                                            value={formData.ubicacion.direccion}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                            placeholder="Calle 123 #45-67"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Ciudad
                                        </label>
                                        <input
                                            type="text"
                                            name="ubicacion.ciudad"
                                            value={formData.ubicacion.ciudad}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                            placeholder="Bogotá"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Sala / Aula
                                        </label>
                                        <input
                                            type="text"
                                            name="ubicacion.sala"
                                            value={formData.ubicacion.sala}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                            placeholder="Sala 301"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Ambiente y recursos */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                                Ambiente y recursos
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Nombre del ambiente
                                    </label>
                                    <input
                                        type="text"
                                        name="ambiente.nombre"
                                        value={formData.ambiente.nombre}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                        placeholder="Laboratorio 101"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Tipo de ambiente
                                    </label>
                                    <input
                                        type="text"
                                        name="ambiente.tipo"
                                        value={formData.ambiente.tipo}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                        placeholder="Laboratorio / Aula / Taller"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Capacidad
                                    </label>
                                    <input
                                        type="number"
                                        name="ambiente.capacidad"
                                        value={formData.ambiente.capacidad}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                        placeholder="25"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Recursos del ambiente
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={recursoInput}
                                        onChange={(e) => setRecursoInput(e.target.value)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                        placeholder="Ej: Computadores, Proyector, etc."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleArrayInput('ambiente', recursoInput, 'add');
                                                setRecursoInput('');
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleArrayInput('ambiente', recursoInput, 'add');
                                            setRecursoInput('');
                                        }}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                                    >
                                        Agregar
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.ambiente.recursos?.map((recurso, index) => (
                                        <span
                                            key={index}
                                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {recurso}
                                            <button
                                                type="button"
                                                onClick={() => handleArrayInput('ambiente', recurso, 'remove')}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 4: Horario */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                                Horario del curso
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Hora de inicio
                                    </label>
                                    <input
                                        type="time"
                                        name="horario.hora_inicio"
                                        value={formData.horario.hora_inicio}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Hora de fin
                                    </label>
                                    <input
                                        type="time"
                                        name="horario.hora_fin"
                                        value={formData.horario.hora_fin}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Jornada
                                    </label>
                                    <select
                                        name="horario.jornada"
                                        value={formData.horario.jornada}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    >
                                        <option value="">Selecciona jornada</option>
                                        <option value="mañana">Mañana</option>
                                        <option value="tarde">Tarde</option>
                                        <option value="noche">Noche</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Días de clase
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <select
                                        value={diaInput}
                                        onChange={(e) => setDiaInput(e.target.value)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                    >
                                        <option value="">Selecciona un día</option>
                                        <option value="Lunes">Lunes</option>
                                        <option value="Martes">Martes</option>
                                        <option value="Miércoles">Miércoles</option>
                                        <option value="Jueves">Jueves</option>
                                        <option value="Viernes">Viernes</option>
                                        <option value="Sábado">Sábado</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleDiasInput(diaInput);
                                            setDiaInput('');
                                        }}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                                    >
                                        Agregar
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.horario.dias.map((dia, index) => (
                                        <span
                                            key={index}
                                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {dia}
                                            <button
                                                type="button"
                                                onClick={() => removeDia(dia)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 5: Empresa y convenio (solo para ofertas cerradas) */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                                Empresa solicitante y convenio
                            </h2>

                            {/* Verificar si el tipo de oferta es "Cerrada" */}
                            {referencias.tiposOferta?.find(t => t._id === formData.tipo_oferta)?.nombre?.toLowerCase() === 'cerrada' ? (
                                <>
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                                        <p className="text-blue-800 flex items-center gap-2">
                                            <FiBriefcase className="text-xl" />
                                            <span>Oferta <strong>CERRADA</strong> - Se requieren datos de la empresa</span>
                                        </p>
                                    </div>

                                    {/* Empresa solicitante */}
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Empresa solicitante</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Nombre de la empresa
                                                </label>
                                                <input
                                                    type="text"
                                                    name="empresa_solicitante.nombre"
                                                    value={formData.empresa_solicitante.nombre}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="Empresa ABC"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    NIT
                                                </label>
                                                <input
                                                    type="text"
                                                    name="empresa_solicitante.nit"
                                                    value={formData.empresa_solicitante.nit}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="123456789-0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Contacto
                                                </label>
                                                <input
                                                    type="text"
                                                    name="empresa_solicitante.contacto"
                                                    value={formData.empresa_solicitante.contacto}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="Juan Pérez"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Email de contacto
                                                </label>
                                                <input
                                                    type="email"
                                                    name="empresa_solicitante.email"
                                                    value={formData.empresa_solicitante.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="contacto@empresa.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Teléfono
                                                </label>
                                                <input
                                                    type="text"
                                                    name="empresa_solicitante.telefono"
                                                    value={formData.empresa_solicitante.telefono}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="3001234567"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Convenio */}
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Convenio</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Número de convenio
                                                </label>
                                                <input
                                                    type="text"
                                                    name="convenio.numero"
                                                    value={formData.convenio.numero}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="CONV-2025-001"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Empresa del convenio
                                                </label>
                                                <input
                                                    type="text"
                                                    name="convenio.empresa"
                                                    value={formData.convenio.empresa}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="Empresa en convenio"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Fecha inicio convenio
                                                </label>
                                                <input
                                                    type="date"
                                                    name="convenio.fecha_inicio"
                                                    value={formData.convenio.fecha_inicio}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Fecha fin convenio
                                                </label>
                                                <input
                                                    type="date"
                                                    name="convenio.fecha_fin"
                                                    value={formData.convenio.fecha_fin}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subsector económico */}
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subsector económico</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Nombre del subsector
                                                </label>
                                                <input
                                                    type="text"
                                                    name="subsector_economico.nombre"
                                                    value={formData.subsector_economico.nombre}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="Tecnología"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Código del subsector
                                                </label>
                                                <input
                                                    type="text"
                                                    name="subsector_economico.codigo"
                                                    value={formData.subsector_economico.codigo}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                                    placeholder="TEC-001"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                                    <FiBriefcase className="text-5xl text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Oferta no cerrada</h3>
                                    <p className="text-gray-600">
                                        Los datos de empresa, convenio y subsector económico 
                                        solo son necesarios para ofertas de tipo <strong>CERRADA</strong>.
                                    </p>
                                    <p className="text-sm text-gray-500 mt-4">
                                        Puedes continuar con el siguiente paso o volver atrás para cambiar el tipo de oferta.
                                    </p>
                                </div>
                            )}

                        </div>
                    )}

                    {/* Paso 6: Revisión */}
                    {step === 6 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                                Revisa la información
                            </h2>

                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <p className="text-green-800 mb-4">
                                    Por favor revisa que toda la información sea correcta antes de enviar.
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    <li>El curso quedará en estado <span className="font-bold text-yellow-600">"pendiente"</span></li>
                                    <li>Será revisado por el coordinador asignado</li>
                                    <li>Recibirás una notificación cuando sea aprobado o rechazado</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Resumen de la información:</h3>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Programa:</dt>
                                        <dd className="font-medium">
                                            {referencias.programas?.find(p => p._id === formData.programa_formacion)?.nombre || 'No seleccionado'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Modalidad:</dt>
                                        <dd className="font-medium">
                                            {referencias.modalidades?.find(m => m._id === formData.modalidad)?.nombre || 'No seleccionado'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Tipo de programa:</dt>
                                        <dd className="font-medium">
                                            {referencias.tiposPrograma?.find(t => t._id === formData.tipo_programa)?.nombre || 'No seleccionado'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Tipo de oferta:</dt>
                                        <dd className="font-medium">
                                            {referencias.tiposOferta?.find(t => t._id === formData.tipo_oferta)?.nombre || 'No seleccionado'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Cupo máximo:</dt>
                                        <dd className="font-medium">{formData.cupo_maximo || 'No especificado'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Coordinador:</dt>
                                        <dd className="font-medium">
                                            {coordinadores.find(c => c._id === formData.coordinador_asignado)?.nombre || 'No seleccionado'}
                                        </dd>
                                    </div>
                                    {formData.fechas.inicio_curso && (
                                        <div>
                                            <dt className="text-sm text-gray-500">Fechas del curso:</dt>
                                            <dd className="font-medium">
                                                {new Date(formData.fechas.inicio_curso).toLocaleDateString()} - {new Date(formData.fechas.fin_curso).toLocaleDateString()}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    )}

                    {/* Navegación entre pasos */}
                    <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                step === 1
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-500 text-white hover:bg-gray-600'
                            }`}
                        >
                            ← Anterior
                        </button>

                        {step < 6 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (step === 1) {
                                        // Validar campos obligatorios antes de avanzar
                                        if (!formData.programa_formacion || !formData.modalidad || 
                                            !formData.tipo_programa || !formData.tipo_oferta || 
                                            !formData.cupo_maximo || !formData.coordinador_asignado) {
                                            toast.error('Completa todos los campos obligatorios antes de continuar');
                                            return;
                                        }
                                    }
                                    setStep(step + 1);
                                }}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creando curso...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="text-xl" />
                                        <span>Crear curso</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearCurso;