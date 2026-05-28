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
import { checkAuth, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Referencias y catálogos ──────────────────────────────────────────────────
router.get('/referencias', checkAuth, getReferencias);

// ✅ FIX: coordinadores dentro del mismo router (antes estaba en /coordinadores/disponibles
//         que apuntaba a otra ruta y nunca llegaba al controlador correcto)
router.get('/coordinadores', checkAuth, getCoordinadores);

// ── CRUD mis cursos ──────────────────────────────────────────────────────────
router.get('/mis-cursos',      checkAuth, getMisCursos);
router.get('/mis-cursos/:id',  checkAuth, getCurso);
router.put('/mis-cursos/:id',  checkAuth, actualizarCurso);
router.delete('/mis-cursos/:id', checkAuth, eliminarCurso);

// ── Crear según tipo ─────────────────────────────────────────────────────────
router.post('/regular',   checkAuth, checkRole(['instructor']), crearCursoRegular);
router.post('/campesena', checkAuth, checkRole(['instructor']), crearCursoCampesena);

// ── Flujo de aprobación y seguimiento ───────────────────────────────────────
router.put('/:id/aprobar-coordinacion', checkAuth, checkRole(['coordinador']), aprobarCursoCoordinacion);
router.put('/:id/asignar-funcionario',  checkAuth, checkRole(['coordinador']), asignarFuncionario);
router.put('/:id/inscripcion',          checkAuth, checkRole(['funcionario']),  registrarInscripcion);
router.put('/:id/matricula',            checkAuth, checkRole(['funcionario']),  registrarMatricula);

export default router;