import Usuario from '../models/Usuario.js';
import generarJWT from '../helpers/generarJWT.js';

const registrar = async (req, res) => {
    const { email, role, coordinador_asignado } = req.body;
    try {
        const existeUsuario = await Usuario.findOne({ email });
        if (existeUsuario) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }
        if (role === 'instructor' && !coordinador_asignado) {
            return res.status(400).json({ msg: 'Los instructores deben tener un coordinador asignado' });
        }
        if (coordinador_asignado) {
            const coordinador = await Usuario.findOne({ _id: coordinador_asignado, role: 'coordinador' });
            if (!coordinador) {
                return res.status(400).json({ msg: 'El coordinador asignado no existe o no tiene rol de coordinador' });
            }
        }
        const usuario = new Usuario(req.body);
        await usuario.save();
        if (usuario.coordinador_asignado) {
            await usuario.populate('coordinador_asignado', 'nombre email');
        }
        res.status(201).json({
            msg: 'Usuario creado correctamente',
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                role: usuario.role,
                coordinador_asignado: usuario.coordinador_asignado
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error en el servidor' });
    }
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    try {
        const usuario = await Usuario.findOne({ email })
            .populate('coordinador_asignado', 'nombre email');
        if (!usuario) {
            return res.status(404).json({ msg: 'El usuario no existe' });
        }
        if (await usuario.comprobarPassword(password)) {
            res.json({
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                role: usuario.role,
                coordinador_asignado: usuario.coordinador_asignado,
                token: generarJWT(usuario._id)
            });
        } else {
            return res.status(403).json({ msg: 'Password incorrecto' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error en el servidor' });
    }
};

const perfil = async (req, res) => {
    const { usuario } = req;
    res.json(usuario);
};

const obtenerCoordinadores = async (req, res) => {
    try {
        const coordinadores = await Usuario.find({ role: 'coordinador' })
            .select('_id nombre email');
        res.json(coordinadores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener coordinadores' });
    }
};

// ✅ UN solo export con las 4 funciones
export {
    registrar,
    autenticar,
    perfil,
    obtenerCoordinadores
};