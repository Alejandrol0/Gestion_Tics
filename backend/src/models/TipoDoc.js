import mongoose from 'mongoose';

const tipoDocSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    abreviatura: { type: String, required: true, unique: true },
    descripcion: String,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('TipoDoc', tipoDocSchema);