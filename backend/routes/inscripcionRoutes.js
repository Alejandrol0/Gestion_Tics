const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');
const {
  inscribir,
  getInscritosPorOferta,
  exportarExcelCompleto,
  exportarExcelCedulas,
  fusionarPDFs,
  descargarPDFFusionado
} = require('../controllers/inscripcionController');

// Ruta para inscripción (pública)
router.post('/oferta/:codigo', upload.single('pdf_cedula'), inscribir);

// Rutas protegidas
router.get('/oferta/:ofertaId', protect, getInscritosPorOferta);
router.get('/oferta/:ofertaId/exportar/completo', protect, exportarExcelCompleto);
router.get('/oferta/:ofertaId/exportar/cedulas', protect, exportarExcelCedulas);
router.get('/oferta/:ofertaId/fusionar-pdf', protect, descargarPDFFusionado);

module.exports = router;