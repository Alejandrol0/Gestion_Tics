import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = await Usuario.findById(decoded.id).select('-password');
            if (!req.usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ msg: 'Token no válido' });
        }
    }
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }
};

const checkRole = (rolesPermitidos = []) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ msg: 'No autenticado' });
        }
        if (rolesPermitidos.includes(req.usuario.role)) {
            return next();
        }
        return res.status(403).json({ msg: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}` });
    };
};

export { checkAuth, checkRole };