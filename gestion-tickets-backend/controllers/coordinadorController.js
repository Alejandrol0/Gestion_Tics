import Usuario from '../models/Usuario.js';

// Obtener lista de coordinadores para asignar a instructores
const obtenerCoordinadores = async (req, res) => {
    try {
        const coordinadores = await Usuario.find({ 
            role: 'coordinador' 
        }).select('nombre email');

        res.json({
            total: coordinadores.length,
            coordinadores
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

export {
    obtenerCoordinadores
};