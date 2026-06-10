import mongoose from 'mongoose';

const tipoProgramaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    }, // "Técnico", "Tecnólogo", "Complementario"
    nivel: String,
    descripcion: String
}, {
    timestamps: true
});

export default mongoose.model('TipoPrograma', tipoProgramaSchema);