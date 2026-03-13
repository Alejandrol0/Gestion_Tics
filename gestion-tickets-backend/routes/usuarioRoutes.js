import express from 'express';
import { 
    registrar, 
    autenticar, 
    perfil 
} from '../controllers/usuarioController.js';
import { checkAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', registrar);
router.post('/login', autenticar);

// Rutas privadas
router.get('/perfil', checkAuth, perfil);

export default router;