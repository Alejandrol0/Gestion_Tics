import mongoose from 'mongoose';

const coordinadorSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    centro_formacion: { type: String, required: true },
    regional: String,
    areas_asignadas: [{ type: String }],
    cursos_supervisados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Oferta' }],
    activo: { type: Boolean, default: true },
    fecha_asignacion: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Coordinador', coordinadorSchema);