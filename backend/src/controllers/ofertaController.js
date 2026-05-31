import Oferta from '../models/Oferta.js';
import Usuario from '../models/Usuario.js';
import ProgramaFormacion from '../models/ProgramaFormacion.js';
import Modalidad from '../models/Modalidad.js';
import TipoPrograma from '../models/TipoPrograma.js';
import TipoOferta from '../models/TipoOferta.js';
import Municipio from '../models/Municipio.js';
import { emailEstadoCurso } from '../helpers/email.js';
import { crearEmpresa } from './empresaController.js';

// ── Catálogos para poblar los selects del formulario ──────────────────────────
export const getReferencias = async (req, res) => {
    try {
        const [programas, modalidades, tiposProg, tiposOferta, municipios] = await Promise.all([
            ProgramaFormacion.find().select('nombre_programa codigo duracion_maxima tipo_programa'), // ← duracion_maxima y tipo_programa (string)
            Modalidad.find().select('nombre'),
            TipoPrograma.find().select('nombre nivel'), // estos son los ObjectId con nombre
            TipoOferta.find().select('nombre descripcion'),
            Municipio.find().select('nombre').sort('nombre')
        ]);
        res.json({ programas, modalidades, tiposProg, tiposOferta, municipios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener referencias' });
    }
};

// ── Crear ficha Regular (con soporte para archivo y empresa) ─────────────────
export const crearOfertaRegular = async (req, res) => {
    if (!req.usuario.coordinador_asignado) {
        return res.status(400).json({ msg: 'No tienes un coordinador asignado. Contacta al administrador.' });
    }

    try {
        let empresaId = null;
        const datosOferta = JSON.parse(req.body.oferta || '{}');

        if (datosOferta.esCerrada && datosOferta.empresa_solicitante) {
            const archivoUrl = req.file ? `/uploads/empresas/${req.file.filename}` : '';
            const empresa = await crearEmpresa(datosOferta.empresa_solicitante, archivoUrl, req.usuario._id);
            empresaId = empresa._id;
        }

        const oferta = new Oferta({
            programa_formacion: datosOferta.programa_formacion,
            modalidad: datosOferta.modalidad,
            tipo_programa: datosOferta.tipo_programa,
            tipo_oferta: datosOferta.tipo_oferta,
            duracion_meses: datosOferta.duracion_meses || 4,
            cupo_maximo: datosOferta.cupo_maximo,
            ambiente: { nombre: datosOferta.ambiente?.nombre || '' },
            fechas: {
                inicio: datosOferta.fechas?.inicio,
                fin: datosOferta.fechas?.fin
            },
            ubicacion: {
                departamento: datosOferta.ubicacion?.departamento || 'Cauca',
                municipio: datosOferta.ubicacion?.municipio,
                direccion: datosOferta.ubicacion?.direccion || ''
            },
            subsector_economico: { nombre: datosOferta.subsector_economico?.nombre || '' },
            convenio: { nombre: datosOferta.convenio?.nombre || '' },
            horario: datosOferta.horario || {},
            firma_digital: datosOferta.firma_digital || { tipo: 'electronica' },
            empresa_solicitante: empresaId,
            es_campesena: false,
            creado_por: req.usuario._id,
            coordinador_asignado: req.usuario.coordinador_asignado,
            estado: 'pendiente',
            historial_estados: [{
                estado: 'pendiente',
                comentario: 'Ficha creada por instructor',
                cambiado_por: req.usuario._id
            }]
        });

        await oferta.save();
        res.status(201).json({ msg: 'Ficha Regular creada correctamente', oferta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear la ficha', error: error.message });
    }
};

// ── Crear ficha Campesena ─────────────────────────────────────────────────────
export const crearOfertaCampesena = async (req, res) => {
    if (!req.usuario.coordinador_asignado) {
        return res.status(400).json({ msg: 'No tienes un coordinador asignado. Contacta al administrador.' });
    }
    try {
        const oferta = new Oferta({
            ...req.body,
            es_campesena: true,
            creado_por: req.usuario._id,
            coordinador_asignado: req.usuario.coordinador_asignado,
            estado: 'pendiente',
            historial_estados: [{
                estado: 'pendiente',
                comentario: 'Ficha Campesena creada por instructor',
                cambiado_por: req.usuario._id
            }]
        });
        await oferta.save();
        res.status(201).json({ msg: 'Ficha Campesena creada correctamente', oferta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear la ficha' });
    }
};

// ── Mis fichas ────────────────────────────────────────────────────────────────
export const getMisOfertas = async (req, res) => {
    try {
        const ofertas = await Oferta.find({ creado_por: req.usuario._id })
            .populate('programa_formacion', 'nombre_programa codigo duracion_maxima')
            .populate('modalidad', 'nombre')
            .populate('tipo_programa', 'nombre')
            .populate('tipo_oferta', 'nombre')
            .populate('ubicacion.municipio', 'nombre')
            .populate('empresa_solicitante', 'nombre nit')
            .sort({ createdAt: -1 });
        res.json(ofertas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener fichas' });
    }
};

// ── Ver una ficha ─────────────────────────────────────────────────────────────
export const getOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id)
            .populate('programa_formacion', 'nombre_programa codigo duracion_maxima')
            .populate('modalidad', 'nombre')
            .populate('tipo_programa', 'nombre')
            .populate('tipo_oferta', 'nombre')
            .populate('ubicacion.municipio', 'nombre')
            .populate('coordinador_asignado', 'nombre email')
            .populate('creado_por', 'nombre email')
            .populate('empresa_solicitante', 'nombre nit direccion representante_legal contacto_empresa');
        if (!oferta) return res.status(404).json({ msg: 'Ficha no encontrada' });
        const esCreador = oferta.creado_por._id.toString() === req.usuario._id.toString();
        const esCoordinador = oferta.coordinador_asignado._id.toString() === req.usuario._id.toString();
        if (!esCreador && !esCoordinador) {
            return res.status(403).json({ msg: 'No tienes permiso para ver esta ficha' });
        }
        res.json(oferta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la ficha' });
    }
};

// ── Fichas pendientes (coordinador) ──────────────────────────────────────────
export const getOfertasPendientes = async (req, res) => {
    try {
        const ofertas = await Oferta.find({
            coordinador_asignado: req.usuario._id,
            estado: 'pendiente'
        })
            .populate('programa_formacion', 'nombre')
            .populate('creado_por', 'nombre email')
            .sort({ createdAt: -1 });
        res.json(ofertas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener fichas pendientes' });
    }
};

// ── Aprobar o rechazar (coordinador) ─────────────────────────────────────────
export const revisarOferta = async (req, res) => {
    const { estado, comentario } = req.body;
    if (!['aprobado', 'rechazado'].includes(estado)) {
        return res.status(400).json({ msg: 'Estado inválido' });
    }
    try {
        const oferta = await Oferta.findById(req.params.id).populate('creado_por', 'nombre email');
        if (!oferta) return res.status(404).json({ msg: 'Ficha no encontrada' });
        if (oferta.coordinador_asignado.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ msg: 'No eres el coordinador de esta ficha' });
        }
        oferta.estado = estado;
        oferta.comentario_coordinador = comentario || '';
        oferta.historial_estados.push({
            estado,
            comentario: comentario || '',
            cambiado_por: req.usuario._id
        });
        await oferta.save();
        await emailEstadoCurso({
            email: oferta.creado_por.email,
            nombre: oferta.creado_por.nombre,
            tituloCurso: oferta.ambiente.nombre,
            estado,
            comentarios: comentario
        });
        res.json({ msg: `Ficha ${estado} correctamente`, oferta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al revisar la ficha' });
    }
};

// ── Actualizar ficha (solo borrador o rechazada) ─────────────────────────────
export const actualizarOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id);
        if (!oferta) return res.status(404).json({ msg: 'Ficha no encontrada' });
        if (oferta.creado_por.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ msg: 'No puedes editar esta ficha' });
        }
        if (!['borrador', 'rechazado'].includes(oferta.estado)) {
            return res.status(400).json({ msg: 'Solo puedes editar fichas en borrador o rechazadas' });
        }
        const ofertaActualizada = await Oferta.findByIdAndUpdate(
            req.params.id,
            { ...req.body, estado: 'pendiente' },
            { new: true }
        );
        res.json({ msg: 'Ficha actualizada', oferta: ofertaActualizada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar' });
    }
};

// ── Eliminar ficha ────────────────────────────────────────────────────────────
export const eliminarOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id);
        if (!oferta) return res.status(404).json({ msg: 'Ficha no encontrada' });
        if (oferta.creado_por.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ msg: 'No puedes eliminar esta ficha' });
        }
        await oferta.deleteOne();
        res.json({ msg: 'Ficha eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar' });
    }
};