const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // ← agregar esta línea
const { protect } = require('../middlewares/authMiddleware');
const {
  crearSolicitud,
  getSolicitudesPendientes,
  getSolicitudById,
  rechazarSolicitud,
  aprobarSolicitud,  
  verificarArchivosSolicitud,
  descargarFicha,
  descargarCarta,
  descargarExcel,
  descargarCedulas
} = require('../controllers/solicitudController');

// Rutas existentes
// ✅ Agregar upload.fields para recibir los 4 archivos
router.post('/validacion', protect, upload.fields([
  { name: 'ficha', maxCount: 1 },
  { name: 'carta', maxCount: 1 },
  { name: 'excel', maxCount: 1 },
  { name: 'cedulas', maxCount: 1 }
]), crearSolicitud);

router.get('/pendientes', protect, getSolicitudesPendientes);
router.get('/:id', protect, getSolicitudById);
router.put('/:id/rechazar', protect, rechazarSolicitud);
router.get('/:id/archivos', protect, verificarArchivosSolicitud);

// Descargas
router.get('/:id/descargar/ficha', protect, descargarFicha);
router.get('/:id/descargar/carta', protect, descargarCarta);
router.get('/:id/descargar/excel', protect, descargarExcel);
router.get('/:id/descargar/cedulas', protect, descargarCedulas);
router.put('/:id/aprobar', protect, aprobarSolicitud);

module.exports = router;