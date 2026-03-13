import mongoose from 'mongoose';

const inscripcionSchema = new mongoose.Schema({
    curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
    aprendiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha_inscripcion: { type: Date, default: Date.now },
    estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'rechazada'], default: 'pendiente' },
    caracterizacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Caracterizacion' },
    asistencia: [{
        fecha: Date,
        presente: Boolean,
        justificacion: String
    }],
    calificacion: { type: Number, min: 0, max: 100 },
    certificado_generado: { type: Boolean, default: false },
    link_inscripcion: String,
    observaciones: String
}, { timestamps: true });

inscripcionSchema.index({ curso: 1, aprendiz: 1 }, { unique: true });

export default mongoose.model('Inscripcion', inscripcionSchema);