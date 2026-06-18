const CreacionOferta = require('../models/CreacionOferta');
const Inscripcion = require('../models/Inscripcion');
const SolicitudValidacion = require('../models/SolicitudValidacion');
const EstadoOferta = require('../models/EstadoOferta');

// Obtener estadísticas para el instructor autenticado
const getEstadisticasInstructor = async (req, res) => {
  try {
    const instructorId = req.usuario._id;

    // 1. Total de ofertas creadas por el instructor (todos los estados)
    const totalOfertas = await CreacionOferta.countDocuments({ creado_por: instructorId });

    // 2. Programas activos: ofertas con estado "matriculados" o "ficha_proceso" (según el flujo)
    const estadosActivos = await EstadoOferta.find({
      codigo: { $in: ['matriculados', 'ficha_proceso'] }
    });
    const idsEstadosActivos = estadosActivos.map(e => e._id);
    const programasActivos = await CreacionOferta.countDocuments({
      creado_por: instructorId,
      estado: { $in: idsEstadosActivos }
    });

    // 3. Total de inscritos en todas las ofertas del instructor
    // Obtenemos todas las ofertas del instructor
    const ofertas = await CreacionOferta.find({ creado_por: instructorId }).select('_id');
    const idsOfertas = ofertas.map(o => o._id);
    const totalInscritos = await Inscripcion.countDocuments({
      oferta_id: { $in: idsOfertas }
    });

    // 4. Validaciones pendientes (solicitudes enviadas por el instructor que aún están pendientes)
    const validacionesPendientes = await SolicitudValidacion.countDocuments({
      instructor_id: instructorId,
      estado: 'pendiente'
    });

    res.json({
      success: true,
      data: {
        totalOfertas,
        programasActivos,
        totalInscritos,
        validacionesPendientes
      }
    });
  } catch (error) {
    console.error('Error en getEstadisticasInstructor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getEstadisticasInstructor };