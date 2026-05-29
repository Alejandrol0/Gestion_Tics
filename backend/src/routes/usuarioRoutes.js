import express from 'express';
import { registrar, autenticar, perfil, obtenerCoordinadores } from '../controllers/usuarioController.js';
import { checkAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registro', registrar);
router.post('/login', autenticar);
router.get('/perfil', checkAuth, perfil);
router.get('/coordinadores', obtenerCoordinadores);

export default router;