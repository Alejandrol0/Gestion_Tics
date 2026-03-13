// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const checkAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = await Usuario.findById(decoded.id).select('-password -token -confirmado');
            
            if (!req.usuario) {
                return res.status(401).json({ msg: 'Token no válido - usuario no existe' });
            }
            
            return next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ msg: 'Token no válido' });
        }
    }

    if (!token) {
        return res.status(401).json({ msg: 'Token no válido o inexistente' });
    }
};

export const checkRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ msg: 'No autenticado' });
        }
        
        if (rolesPermitidos.includes(req.usuario.role)) {
            next();
        } else {
            res.status(403).json({ 
                msg: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}` 
            });
        }
    };
};

// ❌ ELIMINA ESTAS LÍNEAS SI EXISTEN AL FINAL DEL ARCHIVO:
// export {
//     checkAuth,
//     checkRole
// };