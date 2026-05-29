import mongoose from 'mongoose';

const empresaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  fecha_creacion: { type: Date },
  direccion: { type: String },
  nit: { type: String, required: true, unique: true },
  numero_empleados: { type: Number },
  tipo_empresa: {
    type: String,
    enum: ['Privada', 'Pública', 'Mixta', 'Sin ánimo de lucro'],
    default: 'Privada'
  },
  representante_legal: {
    nombre: { type: String },
    documento: { type: String },
    correo: { type: String }
  },
  contacto_empresa: {
    nombre: { type: String },
    cargo: { type: String },
    correo: { type: String }
  },
  carta_pdf_url: { type: String }, // ruta del archivo subido
  creado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // quién registró la empresa
}, { timestamps: true });

export default mongoose.model('Empresa', empresaSchema);