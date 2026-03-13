import mongoose from 'mongoose';

const municipioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    departamento: { type: String, required: true },
    codigo_dane: { type: String, unique: true },
    region: String,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Municipio', municipioSchema);