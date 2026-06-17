const SolicitudValidacion = require('../models/SolicitudValidacion');
const CreacionOferta = require('../models/CreacionOferta');
const User = require('../models/User');
const Coordinador = require('../models/Coordinador');
const EstadoOferta = require('../models/EstadoOferta');
const Inscripcion = require('../models/Inscripcion');
const { cambiarEstado } = require('../services/estadoService');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// =============================================
// INSTRUCTOR: Crear solicitud
// =============================================
const crearSolicitud = async (req, res) => {
  try {
    // Multer ya procesó los archivos y están en req.files
    const { oferta_id, mensaje } = req.body;
    const instructor = req.usuario;

    console.log('📥 Crear solicitud - datos recibidos:', { oferta_id, mensaje });
    console.log('📎 Archivos recibidos:', req.files ? Object.keys(req.files) : 'ninguno');

    // Validar campos obligatorios
    if (!oferta_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la oferta es obligatorio'
      });
    }

    // Verificar que la oferta existe y pertenece al instructor
    const oferta = await CreacionOferta.findOne({
      _id: oferta_id,
      creado_por: instructor._id
    });

    if (!oferta) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada o no pertenece al instructor'
      });
    }

    // Verificar que el instructor tiene coordinador asignado
    if (!instructor.coordinadorAsignado) {
      return res.status(400).json({
        success: false,
        message: 'No tienes un coordinador asignado'
      });
    }

    // Cambiar estado de la oferta a "pendiente"
    const estadoPendiente = await EstadoOferta.findOne({ codigo: 'pendiente' });
    if (!estadoPendiente) throw new Error('Estado "pendiente" no encontrado');

    oferta.estado = estadoPendiente._id;
    if (!oferta.historial_estados) oferta.historial_estados = [];
    oferta.historial_estados.push({
      estado: estadoPendiente._id,
      comentario: mensaje || 'Enviada a revisión',
      cambiado_por: instructor._id,
      cambiado_por_modelo: 'User',
      fecha: new Date()
    });
    await oferta.save();

    // Guardar rutas de los archivos subidos (si existen)
    const archivosGuardados = {};
    if (req.files) {
      if (req.files.ficha) archivosGuardados.ficha = req.files.ficha[0].path;
      if (req.files.carta) archivosGuardados.carta = req.files.carta[0].path;
      if (req.files.excel) archivosGuardados.excel = req.files.excel[0].path;
      if (req.files.cedulas) archivosGuardados.cedulas = req.files.cedulas[0].path;
    }

    // Crear la solicitud en la base de datos
    const nuevaSolicitud = new SolicitudValidacion({
      oferta_id,
      instructor_id: instructor._id,
      coordinador_id: instructor.coordinadorAsignado,
      mensaje,
      estado: 'pendiente',
      archivos: archivosGuardados  // ← importante: guardar las rutas
    });

    await nuevaSolicitud.save();

    res.status(201).json({
      success: true,
      message: 'Solicitud enviada al coordinador',
      data: nuevaSolicitud
    });

  } catch (error) {
    console.error('Error en crearSolicitud:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================================
// COORDINADOR: Obtener solicitudes pendientes
// =============================================
const getSolicitudesPendientes = async (req, res) => {
  try {
    const coordinador = req.usuario;
    const solicitudes = await SolicitudValidacion.find({
      coordinador_id: coordinador._id,
      estado: 'pendiente'
    })
      .populate({
        path: 'oferta_id',
        populate: { path: 'programa_formacion', select: 'nombre_programa codigo' }
      })
      .populate('instructor_id', 'nombre apellido correoElectronico')
      .sort({ fecha_solicitud: -1 });

    res.json({ success: true, count: solicitudes.length, data: solicitudes });
  } catch (error) {
    console.error('Error en getSolicitudesPendientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// COORDINADOR: Obtener solicitud por ID
// =============================================
const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinador = req.usuario;
    const solicitud = await SolicitudValidacion.findOne({
      _id: id,
      coordinador_id: coordinador._id
    })
      .populate({
        path: 'oferta_id',
        populate: { path: 'programa_formacion', select: 'nombre_programa codigo' }
      })
      .populate('instructor_id', 'nombre apellido correoElectronico');

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }
    res.json({ success: true, data: solicitud });
  } catch (error) {
    console.error('Error en getSolicitudById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// COORDINADOR: Rechazar solicitud
// =============================================
const rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;
    const coordinador = req.usuario;

    if (!comentarios) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar un motivo de rechazo' });
    }

    const solicitud = await SolicitudValidacion.findOne({
      _id: id,
      coordinador_id: coordinador._id,
      estado: 'pendiente'
    });

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada o ya fue procesada' });
    }

    const oferta = await CreacionOferta.findById(solicitud.oferta_id);
    if (!oferta) {
      return res.status(404).json({ success: false, message: 'La oferta asociada no existe' });
    }

    const estadoRechazada = await EstadoOferta.findOne({ codigo: 'rechazada' });
    if (!estadoRechazada) throw new Error('Estado "rechazada" no encontrado');

    oferta.estado = estadoRechazada._id;
    if (!oferta.historial_estados) oferta.historial_estados = [];
    oferta.historial_estados.push({
      estado: estadoRechazada._id,
      comentario: comentarios,
      cambiado_por: coordinador._id,
      cambiado_por_modelo: 'Coordinador',
      fecha: new Date()
    });
    await oferta.save();

    solicitud.estado = 'rechazada';
    solicitud.comentarios = comentarios;
    solicitud.fecha_respuesta = new Date();
    await solicitud.save();

    res.json({ success: true, message: 'Solicitud rechazada exitosamente', data: solicitud });
  } catch (error) {
    console.error('Error en rechazarSolicitud:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// COORDINADOR: Aprobar solicitud (cambia a LISTA_ESPERA)
// =============================================
const aprobarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;
    const coordinador = req.usuario;

    const solicitud = await SolicitudValidacion.findOne({
      _id: id,
      coordinador_id: coordinador._id,
      estado: 'pendiente'
    }).populate('oferta_id');

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    const oferta = await CreacionOferta.findById(solicitud.oferta_id._id);
    if (!oferta) {
      return res.status(404).json({ success: false, message: 'Oferta no encontrada' });
    }

    const estadoListaEspera = await EstadoOferta.findOne({ codigo: 'lista_espera' });
    if (!estadoListaEspera) {
      throw new Error('Estado "lista_espera" no encontrado. Ejecuta el script de inserción de estados.');
    }

    oferta.estado = estadoListaEspera._id;
    if (!oferta.historial_estados) oferta.historial_estados = [];
    oferta.historial_estados.push({
      estado: estadoListaEspera._id,
      comentario: comentarios || 'Solicitud aprobada por el coordinador. Oferta en lista de espera.',
      cambiado_por: coordinador._id,
      cambiado_por_modelo: 'Coordinador',
      fecha: new Date()
    });
    await oferta.save();

    solicitud.estado = 'aprobada';
    solicitud.comentarios = comentarios;
    solicitud.fecha_respuesta = new Date();
    await solicitud.save();

    res.json({ success: true, message: 'Solicitud aprobada. Oferta en lista de espera.' });
  } catch (error) {
    console.error('Error en aprobarSolicitud:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// VERIFICAR ARCHIVOS DE LA SOLICITUD
// =============================================
const verificarArchivosSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudValidacion.findById(id).populate('oferta_id');
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    const oferta = solicitud.oferta_id;
    const archivos = { ficha: false, carta: false, excel: false, cedulas: false };

    const fichaPath = path.join(__dirname, '../uploads/fichas', `ficha-${oferta._id}.pdf`);
    archivos.ficha = fs.existsSync(fichaPath);

    if (oferta.carta_pdf) archivos.carta = fs.existsSync(oferta.carta_pdf);

    const totalInscritos = await Inscripcion.countDocuments({ oferta_id: oferta._id });
    archivos.excel = totalInscritos > 0;

    const fecha = new Date().toISOString().split('T')[0];
    const pdfFusionadoPath = path.join(__dirname, '../uploads/fusionados', `cedulas_fusionadas_${oferta._id}_${fecha}.pdf`);
    archivos.cedulas = fs.existsSync(pdfFusionadoPath);

    res.json({ success: true, data: archivos });
  } catch (error) {
    console.error('Error en verificarArchivosSolicitud:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// DESCARGAS DE ARCHIVOS
// =============================================
const descargarFicha = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudValidacion.findById(id).populate('oferta_id');
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });
    const fichaPath = path.join(__dirname, '../uploads/fichas', `ficha-${solicitud.oferta_id._id}.pdf`);
    if (!fs.existsSync(fichaPath)) return res.status(404).json({ message: 'Ficha no encontrada' });
    res.download(fichaPath, `ficha-${solicitud.oferta_id._id}.pdf`);
  } catch (error) {
    console.error('Error descargando ficha:', error);
    res.status(500).json({ message: error.message });
  }
};

const descargarCarta = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudValidacion.findById(id).populate('oferta_id');
    if (!solicitud || !solicitud.oferta_id.carta_pdf) return res.status(404).json({ message: 'Carta no disponible' });
    if (!fs.existsSync(solicitud.oferta_id.carta_pdf)) return res.status(404).json({ message: 'Archivo de carta no encontrado' });
    res.download(solicitud.oferta_id.carta_pdf, `carta-${solicitud.oferta_id._id}.pdf`);
  } catch (error) {
    console.error('Error descargando carta:', error);
    res.status(500).json({ message: error.message });
  }
};

const descargarExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudValidacion.findById(id).populate('oferta_id');
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const ofertaId = solicitud.oferta_id._id;
    const oferta = await CreacionOferta.findById(ofertaId).populate('programa_formacion');
    if (!oferta) return res.status(404).json({ message: 'Oferta no encontrada' });

    const inscritos = await Inscripcion.find({ oferta_id: ofertaId })
      .populate('tipo_documento')
      .populate('caracterizacion');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inscritos');

    worksheet.columns = [
      { header: 'Resultado del Registro (Reservado para el sistema)', key: 'resultado', width: 40 },
      { header: 'Tipo de Identificación', key: 'tipo_documento', width: 25 },
      { header: 'Numero de Identificación', key: 'numero_documento', width: 25 },
      { header: 'Código de la ficha', key: 'codigo_ficha', width: 20 },
      { header: 'Tipo Población Aspirante', key: 'tipo_poblacion', width: 25 },
      { header: 'Codigo Empresa (Solo si la ficha es cerrada)', key: 'codigo_empresa', width: 30 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00643C' } };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    inscritos.forEach(ins => {
      worksheet.addRow({
        resultado: '',
        tipo_documento: ins.tipo_documento?.nombre || '',
        numero_documento: ins.numero_documento || '',
        codigo_ficha: oferta.programa_formacion?.codigo || '',
        tipo_poblacion: ins.caracterizacion?.tipo_caracterizacion || '',
        codigo_empresa: ''
      });
    });

    if (inscritos.length === 0) {
      worksheet.addRow({
        codigo_ficha: oferta.programa_formacion?.codigo || ''
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=inscritos_${oferta.programa_formacion?.codigo || 'formato'}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error descargando excel:', error);
    res.status(500).json({ message: error.message });
  }
};

const descargarCedulas = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudValidacion.findById(id).populate('oferta_id');
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const ofertaId = solicitud.oferta_id._id;
    const files = fs.readdirSync(path.join(__dirname, '../uploads/fusionados'));
    const cedulasFile = files.find(f => f.includes(ofertaId.toString()) && f.endsWith('.pdf'));
    if (!cedulasFile) return res.status(404).json({ message: 'PDF de cédulas no encontrado' });

    const cedulasPath = path.join(__dirname, '../uploads/fusionados', cedulasFile);
    res.download(cedulasPath, `cedulas-${ofertaId}.pdf`);
  } catch (error) {
    console.error('Error descargando cédulas:', error);
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// EXPORTACIONES
// =============================================
module.exports = {
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
};