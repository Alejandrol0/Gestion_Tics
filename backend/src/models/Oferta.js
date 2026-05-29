import mongoose from 'mongoose';

const ofertaSchema = new mongoose.Schema({
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
  duracion_meses: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  es_campesena: {
    type: Boolean,
    default: false
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
  cupo_maximo: {
    type: Number,
    required: true,
    min: 1
  },
  cupos_disponibles: {
    type: Number,
    default: function() { return this.cupo_maximo; }
  },
  ambiente: {
    nombre: { type: String, required: true }
  },
  fechas: {
    inicio: { type: Date, required: true },
    fin: { type: Date, required: true }
  },
  ubicacion: {
    departamento: { type: String, default: 'Cauca' },
    municipio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Municipio',
      required: true
    },
    direccion: { type: String, required: true }
  },
  // ✅ Referencia a la colección Empresa (solo para ofertas cerradas)
  empresa_solicitante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    default: null
  },
  subsector_economico: {
    nombre: { type: String, required: true }
  },
  programa_especial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramaEspecial',
    default: null
  },
  convenio: {
    nombre: { type: String, required: true }
  },
  horario: {
    hora_inicio: {
      type: String,
      required: function() { return !this.es_campesena; },
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM']
    },
    hora_fin: {
      type: String,
      required: function() { return !this.es_campesena; },
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM']
    },
    dias: [{
      type: String,
      enum: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
    }]
  },
  firma_digital: {
    tipo: { type: String, enum: ['digital','escaneada','electronica'], default: 'electronica' }
  },
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
  link_inscripciones: {
    type: String,
    unique: true,
    sparse: true
  },
  carta_pdf: { type: String },
  firma_digital_pdf: { type: String },
  estado: {
    type: String,
    enum: ['borrador', 'pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  comentario_coordinador: { type: String, default: '' },
  historial_estados: [{
    estado: String,
    comentario: String,
    cambiado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fecha: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Oferta = mongoose.model('Oferta', ofertaSchema);
export default Oferta;