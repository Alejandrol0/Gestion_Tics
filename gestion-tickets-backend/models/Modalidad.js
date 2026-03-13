import mongoose from 'mongoose';

const modalidadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    }, // "Presencial", "Virtual", "Mixta"
    descripcion: String
}, {
    timestamps: true
});

export default mongoose.model('Modalidad', modalidadSchema);