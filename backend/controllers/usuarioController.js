import Usuario from '../models/Usuario.js';

const registrar = async (req, res) => {

        // Evitar registros duplicados
    const { email } = req.body; 
    const existeUsuario = await Usuario.findOne({ email: email });
    if(existeUsuario) {
        const error = new Error('El usuario ya existe');
        return res.status(400).json({ msg: error.message });
    }
    console.log(existeUsuario);
    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();

        //Enviar el email de confirmación
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        });
        res.json({ msg: 'Usuario creado correctamente, revisa tu email para confirmar tu cuenta' });   
        
    } catch (error) {
        console.log(error);
    }
}