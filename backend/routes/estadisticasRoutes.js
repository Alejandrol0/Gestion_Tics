const express = require('express');
const router = express.Router();
const { getEstadisticasInstructor } = require('../controllers/estadisticasController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/instructor', protect, getEstadisticasInstructor);

module.exports = router;