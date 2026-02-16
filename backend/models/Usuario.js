import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

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
        trim: true
    },
    role: {
        type: String,
        enum: ['aprendiz', 'instructor', 'coordinador', 'otro'],
        default: 'aprendiz'
    },

    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
}
);
usuarioSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcryot.genSalt(10);
    this.password = await bcryot.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;