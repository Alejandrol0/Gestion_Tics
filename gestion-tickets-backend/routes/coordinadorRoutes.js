import express from 'express';
import { obtenerCoordinadores } from '../controllers/coordinadorController.js';

const router = express.Router();

// Ruta pública para obtener coordinadores (para el formulario de registro)
router.get('/disponibles', obtenerCoordinadores);

export default router;