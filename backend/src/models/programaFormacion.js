import mongoose from 'mongoose';

const programaFormacionSchema = new mongoose.Schema({
    nombre_programa: { type: String, required: true, unique: true },
    codigo: String,
    tipo_programa: String,          // ← ahora es string (ej: "COMPLEMENTARIA")
    duracion_maxima: Number,        // ← horas totales
    version: String,
    // otros campos que veo en tu BD:
    nivel_formacion: String,
    red_conocimientos: String,
    modalidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Modalidad' }
}, { timestamps: true });

export default mongoose.model('ProgramaFormacion', programaFormacionSchema);