// routes/cursoRoutes.js
import express from 'express';
import { 
    crearCursoRegular,
    crearCursoCampesena,
    aprobarCursoCoordinacion,
    asignarFuncionario,
    registrarInscripcion,
    registrarMatricula,
    getMisCursos,
    getCurso,
    actualizarCurso,
    eliminarCurso,
    getReferencias,
    getCoordinadores
} from '../controllers/cursoController.js';
import { checkAuth, checkRole } from '../middlewares/authMiddleware.js'; // 👈 CORREGIDO: 'middlewares' con 's' y 'authMiddleware'

const router = express.Router();

// Rutas existentes
router.get('/referencias', checkAuth, getReferencias);
router.get('/coordinadores/disponibles', checkAuth, getCoordinadores);
router.get('/mis-cursos', checkAuth, getMisCursos);
router.get('/mis-cursos/:id', checkAuth, getCurso);
router.put('/mis-cursos/:id', checkAuth, actualizarCurso);
router.delete('/mis-cursos/:id', checkAuth, eliminarCurso);

// Nuevas rutas para diferentes tipos de oferta
router.post('/regular', checkAuth, checkRole(['instructor']), crearCursoRegular);
router.post('/campesena', checkAuth, checkRole(['instructor']), crearCursoCampesena);

// Rutas para flujo de aprobación y seguimiento
router.put('/:id/aprobar-coordinacion', checkAuth, checkRole(['coordinador']), aprobarCursoCoordinacion);
router.put('/:id/asignar-funcionario', checkAuth, checkRole(['coordinador']), asignarFuncionario);
router.put('/:id/inscripcion', checkAuth, checkRole(['funcionario']), registrarInscripcion);
router.put('/:id/matricula', checkAuth, checkRole(['funcionario']), registrarMatricula);

export default router;