import mongoose from 'mongoose';

const tipoOfertaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    }, // "Pública", "Cerrada", "Empresarial"
    descripcion: String
}, {
    timestamps: true
});

export default mongoose.model('TipoOferta', tipoOfertaSchema);