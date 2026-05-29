import express from 'express';
import {
    getReferencias,
    crearOfertaRegular,
    crearOfertaCampesena,
    getMisOfertas,
    getOferta,
    getOfertasPendientes,
    revisarOferta,
    actualizarOferta,
    eliminarOferta
} from '../controllers/ofertaController.js';
import { checkAuth, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Catálogos — cualquier usuario autenticado
router.get('/referencias', checkAuth, getReferencias);

// Instructor — crear y gestionar sus fichas
router.get('/mis-ofertas',          checkAuth, checkRole(['instructor']), getMisOfertas);
router.get('/mis-ofertas/:id',      checkAuth, checkRole(['instructor']), getOferta);
router.post('/regular',             checkAuth, checkRole(['instructor']), crearOfertaRegular);
router.post('/campesena',           checkAuth, checkRole(['instructor']), crearOfertaCampesena);
router.put('/mis-ofertas/:id',      checkAuth, checkRole(['instructor']), actualizarOferta);
router.delete('/mis-ofertas/:id',   checkAuth, checkRole(['instructor']), eliminarOferta);

// Coordinador — revisar fichas de sus instructores
router.get('/pendientes',           checkAuth, checkRole(['coordinador']), getOfertasPendientes);
router.put('/:id/revisar',          checkAuth, checkRole(['coordinador']), revisarOferta);

export default router;