import express from 'express';
import { getEmpresa } from '../controllers/empresaController.js';
import { checkAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id', checkAuth, getEmpresa);

export default router;