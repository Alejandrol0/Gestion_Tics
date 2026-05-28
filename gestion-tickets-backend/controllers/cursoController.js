// controllers/cursoController.js
import Curso from '../models/Curso.js';
import ProgramaFormacion from '../models/ProgramaFormacion.js';
import Modalidad from '../models/Modalidad.js';
import TipoPrograma from '../models/TipoPrograma.js';
import TipoOferta from '../models/TipoOferta.js';
import ProgramaEspecial from '../models/ProgramaEspecial.js';
import SectorCentro from '../models/SectorCentro.js';
import Usuario from '../models/Usuario.js';

// ============================================================
// REFERENCIAS
// ============================================================

export const getReferencias = async (req, res) => {
    try {
        const [programas, modalidades, tiposPrograma, tiposOferta, programasEspeciales, sectores] =
            await Promise.all([
                ProgramaFormacion.find().select('nombre codigo'),
                Modalidad.find().select('nombre'),
                TipoPrograma.find().select('nombre'),
                TipoOferta.find().select('nombre'),
                ProgramaEspecial.find().select('nombre codigo'),
                SectorCentro.find().select('nombre')
            ]);

        res.json({ programas, modalidades, tiposPrograma, tiposOferta, programasEspeciales, sectores });
    } catch (error) {
        console.error('Error en getReferencias:', error);
        res.status(500).json({ msg: 'Error al cargar datos de referencia' });
    }
};

// ✅ FIX: busca por role 'coordinador' (igual que antes) y devuelve { coordinadores }
export const getCoordinadores = async (req, res) => {
    try {
        const coordinadores = await Usuario.find({ role: 'coordinador' }).select('nombre email');
        res.json({ coordinadores });
    } catch (error) {
        console.error('Error en getCoordinadores:', error);
        res.status(500).json({ msg: 'Error al cargar coordinadores' });
    }
};

// ============================================================
// CREAR CURSOS
// ============================================================

export const crearCursoRegular = async (req, res) => {
    try {
        if (req.usuario.role !== 'instructor') {
            return res.status(403).json({ msg: 'Solo instructores pueden crear cursos' });
        }

        const {
            programa_formacion,
            modalidad,
            tipo_programa,
            tipo_oferta,
            cupo_maximo,
            coordinador_asignado,
            fechas,
            ambiente,
            ubicacion,
            horario,
            empresa_solicitante,
            convenio,
            subsector_economico,
            datos_regular,
        } = req.body;

        // ✅ FIX: validación explícita con mensaje claro por campo
        const faltantes = [];
        if (!programa_formacion)   faltantes.push('programa_formacion');
        if (!modalidad)            faltantes.push('modalidad');
        if (!tipo_programa)        faltantes.push('tipo_programa');
        if (!tipo_oferta)          faltantes.push('tipo_oferta');
        if (!cupo_maximo)          faltantes.push('cupo_maximo');
        if (!coordinador_asignado) faltantes.push('coordinador_asignado');

        if (faltantes.length > 0) {
            return res.status(400).json({
                msg: `Faltan campos obligatorios: ${faltantes.join(', ')}`
            });
        }

        const datosRegular = {
            fechas_ejecucion: datos_regular?.fechas_ejecucion || [],
            documentos:       datos_regular?.documentos       || []
        };

        const cursoData = {
            programa_formacion,
            modalidad,
            tipo_programa,
            tipo_oferta,
            cupo_maximo,
            cupos_disponibles:    cupo_maximo,
            coordinador_asignado,
            creado_por:           req.usuario._id,
            estado:               'pendiente',
            datos_regular:        datosRegular,
            ...(fechas              && { fechas }),
            ...(ambiente            && { ambiente }),
            ...(ubicacion           && { ubicacion }),
            ...(horario             && { horario }),
            ...(empresa_solicitante && { empresa_solicitante }),
            ...(convenio            && { convenio }),
            ...(subsector_economico && { subsector_economico }),
        };

        const curso = new Curso(cursoData);
        await curso.save();

        await curso.populate([
            { path: 'programa_formacion',  select: 'nombre codigo' },
            { path: 'modalidad',           select: 'nombre' },
            { path: 'tipo_programa',       select: 'nombre' },
            { path: 'tipo_oferta',         select: 'nombre' },
            { path: 'coordinador_asignado',select: 'nombre email' }
        ]);

        res.status(201).json({ msg: '✅ Curso regular creado exitosamente', curso });

    } catch (error) {
        console.error('Error en crearCursoRegular:', error);
        res.status(500).json({ msg: 'Error al crear el curso', error: error.message });
    }
};

export const crearCursoCampesena = async (req, res) => {
    try {
        if (req.usuario.role !== 'instructor') {
            return res.status(403).json({ msg: 'Solo instructores pueden crear cursos' });
        }

        const {
            programa_formacion,
            modalidad,
            tipo_programa,
            tipo_oferta,
            cupo_maximo,
            coordinador_asignado,
            fechas,
            ambiente,
            ubicacion,
            horario,
            empresa_solicitante,
            convenio,
            subsector_economico,
            datos_campesena,
        } = req.body;

        const faltantes = [];
        if (!programa_formacion)   faltantes.push('programa_formacion');
        if (!modalidad)            faltantes.push('modalidad');
        if (!tipo_programa)        faltantes.push('tipo_programa');
        if (!tipo_oferta)          faltantes.push('tipo_oferta');
        if (!cupo_maximo)          faltantes.push('cupo_maximo');
        if (!coordinador_asignado) faltantes.push('coordinador_asignado');

        if (faltantes.length > 0) {
            return res.status(400).json({
                msg: `Faltan campos obligatorios: ${faltantes.join(', ')}`
            });
        }

        if (!datos_campesena?.sector_centro) {
            return res.status(400).json({ msg: 'El sector centro es obligatorio para ofertas CAMPESENA' });
        }

        const datosCampesena = {
            instructor_tecnico:       datos_campesena?.instructor_tecnico       || null,
            instructor_empresarial:   datos_campesena?.instructor_empresarial   || null,
            instructor_full_popular:  datos_campesena?.instructor_full_popular  || null,
            sector_centro:            datos_campesena?.sector_centro,
            programa_especial:        datos_campesena?.programa_especial        || null,
            duracion_meses:           datos_campesena?.duracion_meses           || 5,
            documentos:               datos_campesena?.documentos               || []
        };

        const cursoData = {
            programa_formacion,
            modalidad,
            tipo_programa,
            tipo_oferta,
            cupo_maximo,
            cupos_disponibles:    cupo_maximo,
            coordinador_asignado,
            creado_por:           req.usuario._id,
            estado:               'pendiente',
            datos_campesena:      datosCampesena,
            ...(fechas              && { fechas }),
            ...(ambiente            && { ambiente }),
            ...(ubicacion           && { ubicacion }),
            ...(horario             && { horario }),
            ...(empresa_solicitante && { empresa_solicitante }),
            ...(convenio            && { convenio }),
            ...(subsector_economico && { subsector_economico }),
        };

        const curso = new Curso(cursoData);
        await curso.save();

        await curso.populate([
            { path: 'programa_formacion',              select: 'nombre codigo' },
            { path: 'modalidad',                       select: 'nombre' },
            { path: 'tipo_programa',                   select: 'nombre' },
            { path: 'tipo_oferta',                     select: 'nombre' },
            { path: 'coordinador_asignado',            select: 'nombre email' },
            { path: 'datos_campesena.programa_especial', select: 'nombre codigo' }
        ]);

        res.status(201).json({ msg: '✅ Curso CAMPESENA creado exitosamente', curso });

    } catch (error) {
        console.error('Error en crearCursoCampesena:', error);
        res.status(500).json({ msg: 'Error al crear el curso', error: error.message });
    }
};

// ============================================================
// LISTAR / OBTENER
// ============================================================

export const getMisCursos = async (req, res) => {
    try {
        const cursos = await Curso.find({ creado_por: req.usuario._id })
            .populate('programa_formacion',  'nombre codigo')
            .populate('modalidad',           'nombre')
            .populate('tipo_programa',       'nombre')
            .populate('tipo_oferta',         'nombre')
            .populate('coordinador_asignado','nombre email')
            .sort({ createdAt: -1 });

        res.json({ cursos });
    } catch (error) {
        console.error('Error en getMisCursos:', error);
        res.status(500).json({ msg: 'Error al cargar los cursos' });
    }
};

export const getCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const curso = await Curso.findOne({ _id: id, creado_por: req.usuario._id })
            .populate('programa_formacion')
            .populate('modalidad')
            .populate('tipo_programa')
            .populate('tipo_oferta')
            .populate('coordinador_asignado',  'nombre email')
            .populate('funcionario_asignado',  'nombre email')
            .populate('datos_campesena.programa_especial');

        if (!curso) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
        }

        res.json(curso);
    } catch (error) {
        console.error('Error en getCurso:', error);
        res.status(500).json({ msg: 'Error al cargar el curso' });
    }
};

// ============================================================
// ACTUALIZAR / ELIMINAR
// ============================================================

export const actualizarCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const curso = await Curso.findOne({ _id: id, creado_por: req.usuario._id });

        if (!curso) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
        }

        if (!['pendiente', 'rechazada'].includes(curso.estado)) {
            return res.status(400).json({
                msg: `No puedes modificar un curso en estado: ${curso.estado}`
            });
        }

        const camposPermitidos = [
            'programa_formacion', 'modalidad', 'tipo_programa', 'tipo_oferta',
            'cupo_maximo', 'ambiente', 'fechas', 'ubicacion', 'empresa_solicitante',
            'subsector_economico', 'convenio', 'horario', 'coordinador_asignado'
        ];

        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                curso[campo] = req.body[campo];
            }
        });

        if (req.body.datos_campesena) {
            curso.datos_campesena = { ...curso.datos_campesena, ...req.body.datos_campesena };
        } else if (req.body.datos_regular) {
            curso.datos_regular = { ...curso.datos_regular, ...req.body.datos_regular };
        }

        if (curso.estado === 'rechazada') {
            curso.estado = 'pendiente';
            curso.comentarios_rechazo = undefined;
        }

        await curso.save();
        await curso.populate([
            { path: 'programa_formacion', select: 'nombre' },
            { path: 'modalidad',          select: 'nombre' },
            { path: 'tipo_programa',      select: 'nombre' },
            { path: 'tipo_oferta',        select: 'nombre' }
        ]);

        res.json({ msg: '✅ Curso actualizado correctamente', curso });

    } catch (error) {
        console.error('Error en actualizarCurso:', error);
        res.status(500).json({ msg: 'Error al actualizar el curso' });
    }
};

export const eliminarCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const curso = await Curso.findOne({ _id: id, creado_por: req.usuario._id });

        if (!curso) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
        }

        if (curso.estado !== 'pendiente') {
            return res.status(400).json({
                msg: `No puedes eliminar un curso en estado: ${curso.estado}`
            });
        }

        await curso.deleteOne();
        res.json({ msg: '✅ Curso eliminado correctamente' });

    } catch (error) {
        console.error('Error en eliminarCurso:', error);
        res.status(500).json({ msg: 'Error al eliminar el curso' });
    }
};

// ============================================================
// FLUJO DE APROBACIÓN
// ============================================================

export const aprobarCursoCoordinacion = async (req, res) => {
    try {
        if (req.usuario.role !== 'coordinador') {
            return res.status(403).json({ msg: 'Solo coordinadores pueden aprobar cursos' });
        }

        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

        curso.estado = 'aprobada_coordinacion';
        curso.fecha_aprobacion_coordinacion = new Date();
        curso.comentarios_rechazo = undefined;

        await curso.save();
        res.json({ msg: '✅ Curso aprobado por coordinación', curso });

    } catch (error) {
        console.error('Error en aprobarCursoCoordinacion:', error);
        res.status(500).json({ msg: 'Error al aprobar el curso' });
    }
};

export const asignarFuncionario = async (req, res) => {
    try {
        if (req.usuario.role !== 'coordinador') {
            return res.status(403).json({ msg: 'Solo coordinadores pueden asignar funcionarios' });
        }

        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

        const { funcionario_id, codigo_ficha, codigo_solicitud } = req.body;

        curso.funcionario_asignado = funcionario_id;
        curso.estado = 'en_creacion_ficha';
        curso.fecha_creacion_ficha = new Date();

        const seguimiento = { codigo_ficha, codigo_solicitud };
        if (curso.datos_campesena) {
            curso.datos_campesena.seguimiento = { ...curso.datos_campesena.seguimiento, ...seguimiento };
        } else if (curso.datos_regular) {
            curso.datos_regular.seguimiento = { ...curso.datos_regular.seguimiento, ...seguimiento };
        }

        await curso.save();
        res.json({ msg: '✅ Funcionario asignado correctamente', curso });

    } catch (error) {
        console.error('Error en asignarFuncionario:', error);
        res.status(500).json({ msg: 'Error al asignar funcionario' });
    }
};

export const registrarInscripcion = async (req, res) => {
    try {
        if (req.usuario.role !== 'funcionario') {
            return res.status(403).json({ msg: 'Solo funcionarios pueden registrar inscripciones' });
        }

        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

        const { numero_inscritos, observaciones } = req.body;
        const seguimientoData = { numero_inscritos, observaciones_inscripcion: observaciones };

        if (curso.datos_campesena) {
            curso.datos_campesena.seguimiento = { ...curso.datos_campesena.seguimiento, ...seguimientoData };
        } else if (curso.datos_regular) {
            curso.datos_regular.seguimiento = { ...curso.datos_regular.seguimiento, ...seguimientoData };
        }

        await curso.save();
        res.json({ msg: '✅ Inscripción registrada correctamente', curso });

    } catch (error) {
        console.error('Error en registrarInscripcion:', error);
        res.status(500).json({ msg: 'Error al registrar inscripción' });
    }
};

export const registrarMatricula = async (req, res) => {
    try {
        if (req.usuario.role !== 'funcionario') {
            return res.status(403).json({ msg: 'Solo funcionarios pueden registrar matrículas' });
        }

        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ msg: 'Curso no encontrado' });

        const { numero_matriculados, observaciones } = req.body;
        const seguimientoData = {
            numero_matriculados,
            fecha_matricula: new Date(),
            observaciones_matricula: observaciones
        };

        if (curso.datos_campesena) {
            curso.datos_campesena.seguimiento = { ...curso.datos_campesena.seguimiento, ...seguimientoData };
        } else if (curso.datos_regular) {
            curso.datos_regular.seguimiento = { ...curso.datos_regular.seguimiento, ...seguimientoData };
        }

        curso.estado = numero_matriculados > 0 ? 'activa' : 'finalizada';
        curso.cupos_disponibles = (curso.cupo_maximo || 0) - numero_matriculados;

        await curso.save();
        res.json({ msg: '✅ Matrícula registrada correctamente', curso });

    } catch (error) {
        console.error('Error en registrarMatricula:', error);
        res.status(500).json({ msg: 'Error al registrar matrícula' });
    }
};