// models/ProgramaEspecial.js
import mongoose from 'mongoose';  // 👈 ESTA LÍNEA ES LA QUE FALTA

const programaEspecialSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    codigo: { type: String, required: true },
    descripcion: String,
    empresa: {
        nombre: String,
        nit: String,
        convenio: String
    },
    fecha_inicio: Date,
    fecha_fin: Date,
    duracion_meses: { type: Number, default: 5 },
    instructores_requeridos: { type: Number, default: 3 },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('ProgramaEspecial', programaEspecialSchema);