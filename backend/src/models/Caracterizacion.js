import mongoose from 'mongoose';

const caracterizacionSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    tipo_documento: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoDoc' },
    numero_documento: { type: String, unique: true, sparse: true },
    fecha_nacimiento: Date,
    genero: { type: String, enum: ['Masculino', 'Femenino', 'Otro', 'No especifica'] },
    telefono: String,
    direccion: String,
    municipio: { type: mongoose.Schema.Types.ObjectId, ref: 'Municipio' },
    nivel_educativo: { type: String, enum: ['Primaria', 'Secundaria', 'Técnico', 'Tecnólogo', 'Profesional', 'Postgrado'] },
    ocupacion: String,
    empresa_donde_labora: String,
    estrato: { type: Number, min: 1, max: 6 },
    discapacidad: String,
    poblacion_vulnerable: String,
    sisben: String
}, { timestamps: true });

export default mongoose.model('Caracterizacion', caracterizacionSchema);