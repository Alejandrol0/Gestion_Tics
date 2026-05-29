import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email:  { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'instructor', 'coordinador', 'aprendiz', 'funcionario'],
        required: true
    },
    coordinador_asignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        default: null
    }
}, { timestamps: true });

usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;
