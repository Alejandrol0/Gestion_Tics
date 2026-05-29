import Oferta from '../models/Oferta.js';
import Usuario from '../models/Usuario.js';
import ProgramaFormacion from '../models/ProgramaFormacion.js';
import Modalidad from '../models/Modalidad.js';
import TipoPrograma from '../models/TipoPrograma.js';
import TipoOferta from '../models/TipoOferta.js';
import Municipio from '../models/Municipio.js';
import { emailEstadoCurso } from '../helpers/email.js';

// ── Catálogos para poblar los selects del formulario ──────────────────────────
const getReferencias = async (req, res) => {
    try {
        const [programas, modalidades, tiposProg, tiposOferta, municipios] = await Promise.all([
            ProgramaFormacion.find().select('nombre codigo'),
            Modalidad.find().select('nombre'),
            TipoPrograma.find().select('nombre nivel'),
            TipoOferta.find().select('nombre descripcion'),
            Municipio.find().select('nombre').sort('nombre')
        ]);

        res.json({ programas, modalidades, tiposProg, tiposOferta, municipios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener referencias' });
    }
};

// ── Crear ficha Regular ───────────────────────────────────────────────────────
const crearOfertaRegular = async (req, res) => {
    if (!req.usuario.coordinador_asignado) {
        return res.status(400).json({ msg: 'No tienes un coordinador asignado. Contacta al administrador.' });
    }
    try {
        const oferta = new Oferta({
            ...req.body,
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

        res.status(201).json({
            msg: 'Ficha Regular creada correctamente',
            oferta
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear la ficha' });
    }
};

// ── Crear ficha Campesena ─────────────────────────────────────────────────────
const crearOfertaCampesena = async (req, res) => {
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

        res.status(201).json({
            msg: 'Ficha Campesena creada correctamente',
            oferta
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear la ficha' });
    }
};

// ── Mis fichas (instructor ve solo las suyas) ─────────────────────────────────
const getMisOfertas = async (req, res) => {
    try {
        const ofertas = await Oferta.find({ creado_por: req.usuario._id })
            .populate('programa_formacion', 'nombre codigo')
            .populate('modalidad', 'nombre')
            .populate('tipo_programa', 'nombre')
            .populate('tipo_oferta', 'nombre')
            .populate('ubicacion.municipio', 'nombre')
            .sort({ createdAt: -1 });

        res.json(ofertas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener fichas' });
    }
};

// ── Ver una ficha ─────────────────────────────────────────────────────────────
const getOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id)
            .populate('programa_formacion', 'nombre codigo')
            .populate('modalidad', 'nombre')
            .populate('tipo_programa', 'nombre')
            .populate('tipo_oferta', 'nombre')
            .populate('ubicacion.municipio', 'nombre')
            .populate('coordinador_asignado', 'nombre email')
            .populate('creado_por', 'nombre email');

        if (!oferta) return res.status(404).json({ msg: 'Ficha no encontrada' });

        // Solo el instructor que la creó o su coordinador pueden verla
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

// ── Fichas pendientes (coordinador ve las de sus instructores) ────────────────
const getOfertasPendientes = async (req, res) => {
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
const revisarOferta = async (req, res) => {
    const { estado, comentario } = req.body; // estado: 'aprobado' | 'rechazado'

    if (!['aprobado', 'rechazado'].includes(estado)) {
        return res.status(400).json({ msg: 'Estado inválido' });
    }

    try {
        const oferta = await Oferta.findById(req.params.id)
            .populate('creado_por', 'nombre email');

        if (!oferta) return res.status(404).json({ msg: 'Ficha no encontrada' });

        if (oferta.coordinador_asignado.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ msg: 'No eres el coordinador de esta ficha' });
        }

        // Actualizar estado
        oferta.estado = estado;
        oferta.comentario_coordinador = comentario || '';
        oferta.historial_estados.push({
            estado,
            comentario: comentario || '',
            cambiado_por: req.usuario._id
        });

        await oferta.save();

        // Notificar al instructor por email
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

// ── Actualizar ficha (solo si está en borrador o rechazada) ──────────────────
const actualizarOferta = async (req, res) => {
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
            { ...req.body, estado: 'pendiente' }, // Al editar vuelve a pendiente
            { new: true }
        );

        res.json({ msg: 'Ficha actualizada', oferta: ofertaActualizada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar' });
    }
};

// ── Eliminar ficha ────────────────────────────────────────────────────────────
const eliminarOferta = async (req, res) => {
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

export {
    getReferencias,
    crearOfertaRegular,
    crearOfertaCampesena,
    getMisOfertas,
    getOferta,
    getOfertasPendientes,
    revisarOferta,
    actualizarOferta,
    eliminarOferta
};