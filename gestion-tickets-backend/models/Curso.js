// models/Curso.js
import mongoose from 'mongoose';

// Schema para programación de instructores en CAMPESENA
const instructorProgramacionSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    celular: { type: String, required: true },
    fechas_por_mes: [{
        mes: { type: Number, min: 1, max: 5 },
        fechas: { type: String }, // Descripción textual de las fechas
        horas: { type: Number }
    }]
});

// Schema para documentos
const documentoSchema = new mongoose.Schema({
    tipo: { 
        type: String, 
        enum: ['documentos_identidad', 'formato_inscripcion', 'ficha_caracterizacion', 'carta_solicitud'],
        required: true 
    },
    url: { type: String, required: true },
    fecha_subida: { type: Date, default: Date.now }
});

// Schema para seguimiento
const seguimientoSchema = new mongoose.Schema({
    codigo_ficha: String,
    codigo_solicitud: String,
    numero_inscritos: { type: Number, default: 0 },
    observaciones_inscripcion: String,
    numero_matriculados: { type: Number, default: 0 },
    fecha_matricula: Date,
    observaciones_matricula: String
});

// Schema para CAMPESENA
const campesenaSchema = new mongoose.Schema({
    instructor_tecnico: instructorProgramacionSchema,
    instructor_empresarial: instructorProgramacionSchema,
    instructor_full_popular: instructorProgramacionSchema,
    sector_centro: { 
        type: String,
        enum: ['Agrícola', 'Pecuario', 'Agroindustrial', 'Ambiental', 'Administrativo', 'Social', 'Pedagógico', 'Financiero']
    },
    programa_especial: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgramaEspecial' },
    duracion_meses: { type: Number, default: 5 },
    documentos: [documentoSchema],
    seguimiento: seguimientoSchema
});

// Schema para REGULAR
const regularSchema = new mongoose.Schema({
    fechas_ejecucion: [{
        mes: { type: Number, min: 1, max: 5 },
        fechas: String,
        horas: Number
    }],
    documentos: [documentoSchema],
    seguimiento: seguimientoSchema
});

// Schema principal del curso
const cursoSchema = new mongoose.Schema({
    // Relaciones con otras colecciones
    programa_formacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProgramaFormacion',
        required: true
    },
    modalidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Modalidad',
        required: true
    },
    tipo_programa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoPrograma',
        required: true
    },
    tipo_oferta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoOferta',
        required: true
    },
    
    // Datos numéricos
    cupo_maximo: {
        type: Number,
        required: true,
        min: 1
    },
    cupos_disponibles: {
        type: Number,
        default: function() {
            return this.cupo_maximo;
        }
    },
    
    // Objetos anidados
    ambiente: {
        nombre: String,
        tipo: String,
        capacidad: Number,
        recursos: [String]
    },
    
    fechas: {
        inicio_inscripciones: Date,
        fin_inscripciones: Date,
        inicio_curso: Date,
        fin_curso: Date
    },
    
    ubicacion: {
        direccion: String,
        ciudad: String,
        municipio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Municipio'
        },
        sala: String
    },
    
    empresa_solicitante: {
        nombre: String,
        nit: String,
        contacto: String,
        email: String,
        telefono: String
    },
    
    subsector_economico: {
        nombre: String,
        codigo: String
    },
    
    convenio: {
        numero: String,
        empresa: String,
        fecha_inicio: Date,
        fecha_fin: Date
    },
    
    horario: {
        dias: [String],
        hora_inicio: String,
        hora_fin: String,
        jornada: String
    },
    
    firma_digital: {
        url: String,
        fecha_firma: Date,
        firmado_por: String
    },
    
    // Referencias a usuarios
    coordinador_asignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    
    creado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    
    // Campos específicos según tipo de oferta
    datos_campesena: campesenaSchema,
    datos_regular: regularSchema,
    
    // Estados y seguimiento
    estado: {
        type: String,
        enum: ['pendiente', 'aprobada_coordinacion', 'rechazada', 'en_creacion_ficha', 'activa', 'finalizada', 'cancelada'],
        default: 'pendiente'
    },
    comentarios_rechazo: String,
    fecha_aprobacion_coordinacion: Date,
    funcionario_asignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fecha_creacion_ficha: Date,
    
    link_inscripciones: {
        type: String,
        default: null
    }
    
}, {
    timestamps: true
});

// Middleware para generar link único
cursoSchema.pre('save', function(next) {
    if (!this.link_inscripciones && this.estado === 'activa') {
        const uniqueId = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
        this.link_inscripciones = `/inscribirse/${uniqueId}`;
    }
    next();
});

// Índices para búsquedas
cursoSchema.index({ tipo_oferta: 1, estado: 1 });
cursoSchema.index({ creado_por: 1, createdAt: -1 });

export default mongoose.model('Curso', cursoSchema);