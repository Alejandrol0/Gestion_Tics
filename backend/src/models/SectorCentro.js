import mongoose from 'mongoose';

const sectorCentroSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: String,
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('SectorCentro', sectorCentroSchema);