import mongoose from 'mongoose';

const programaFormacionSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    codigo: String,
    descripcion: String,
    duracion_horas: Number,
    version: String
}, {
    timestamps: true
});

export default mongoose.model('ProgramaFormacion', programaFormacionSchema);