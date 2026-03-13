import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['aprendiz', 'instructor', 'coordinador', 'funcionario'],
        default: 'aprendiz'
    },
    tipo_instructor: {
        type: String,
        enum: ['tecnico', 'empresarial', 'full_popular', null],
        default: null
    },
    // 👇 NUEVO CAMPO
    coordinador_asignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: function() {
            return this.role === 'instructor';
        }
    },
    instructores_asociados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }]
}, {
    timestamps: true,
});

usuarioSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;