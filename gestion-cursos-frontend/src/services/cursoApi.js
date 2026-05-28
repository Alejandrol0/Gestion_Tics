import api from './api';

const cursoApi = {

    // ── Referencias ────────────────────────────────────────────────────────────
    getReferencias: async () => {
        const response = await api.get('/cursos/referencias');
        return response.data;
    },

    // ✅ FIX: endpoint alineado con cursoRoutes.js  (/cursos/coordinadores)
    getCoordinadores: async () => {
        const response = await api.get('/cursos/coordinadores');
        return response.data;
    },

    // ── Crear curso ────────────────────────────────────────────────────────────
    crearCurso: async (cursoData, tipo = 'regular') => {
        try {
            // ✅ FIX: solo incluir coordinador_asignado si tiene valor real
            //         (un string vacío '' pasaba la validación del backend y fallaba)
            const dataToSend = {
                programa_formacion: cursoData.programa_formacion?._id || cursoData.programa_formacion,
                modalidad:          cursoData.modalidad?._id          || cursoData.modalidad,
                tipo_programa:      cursoData.tipo_programa?._id      || cursoData.tipo_programa,
                tipo_oferta:        cursoData.tipo_oferta?._id        || cursoData.tipo_oferta,
                cupo_maximo:        Number(cursoData.cupo_maximo),
            };

            // Solo agregar coordinador si existe
            const coordinadorId = cursoData.coordinador_asignado?._id || cursoData.coordinador_asignado;
            if (coordinadorId) dataToSend.coordinador_asignado = coordinadorId;

            // Campos opcionales
            if (cursoData.fechas?.inicio_curso)  dataToSend.fechas    = cursoData.fechas;
            if (cursoData.ambiente?.nombre)       dataToSend.ambiente  = cursoData.ambiente;
            if (cursoData.ubicacion?.direccion)   dataToSend.ubicacion = cursoData.ubicacion;
            if (cursoData.horario?.dias?.length)  dataToSend.horario   = cursoData.horario;
            if (cursoData.empresa_solicitante?.nombre) dataToSend.empresa_solicitante = cursoData.empresa_solicitante;
            if (cursoData.convenio?.numero)            dataToSend.convenio            = cursoData.convenio;
            if (cursoData.subsector_economico?.nombre) dataToSend.subsector_economico = cursoData.subsector_economico;

            // Datos específicos según tipo
            if (tipo === 'regular'   && cursoData.datos_regular)   dataToSend.datos_regular   = cursoData.datos_regular;
            if (tipo === 'campesena' && cursoData.datos_campesena) dataToSend.datos_campesena = cursoData.datos_campesena;

            const endpoint = tipo === 'campesena' ? '/cursos/campesena' : '/cursos/regular';
            console.log(`📤 Enviando a ${endpoint}:`, dataToSend);

            const response = await api.post(endpoint, dataToSend);
            return response.data;
        } catch (error) {
            console.error('❌ Error en crearCurso:', error.response?.data || error.message);
            throw error;
        }
    },

    // ── Listar / obtener ───────────────────────────────────────────────────────
    getMisCursos: async () => {
        const response = await api.get('/cursos/mis-cursos');
        return response.data;
    },

    getCurso: async (id) => {
        const response = await api.get(`/cursos/mis-cursos/${id}`);
        return response.data;
    },

    // ── Actualizar ─────────────────────────────────────────────────────────────
    actualizarCurso: async (id, cursoData) => {
        try {
            const dataToSend = {
                programa_formacion: cursoData.programa_formacion?._id || cursoData.programa_formacion,
                modalidad:          cursoData.modalidad?._id          || cursoData.modalidad,
                tipo_programa:      cursoData.tipo_programa?._id      || cursoData.tipo_programa,
                tipo_oferta:        cursoData.tipo_oferta?._id        || cursoData.tipo_oferta,
                cupo_maximo:        Number(cursoData.cupo_maximo),
            };

            const coordinadorId = cursoData.coordinador_asignado?._id || cursoData.coordinador_asignado;
            if (coordinadorId) dataToSend.coordinador_asignado = coordinadorId;

            console.log('📤 Actualizando curso:', dataToSend);

            const response = await api.put(`/cursos/mis-cursos/${id}`, dataToSend);
            return response.data;
        } catch (error) {
            console.error('❌ Error en actualizarCurso:', error.response?.data || error.message);
            throw error;
        }
    },

    // ── Eliminar ───────────────────────────────────────────────────────────────
    eliminarCurso: async (id) => {
        const response = await api.delete(`/cursos/mis-cursos/${id}`);
        return response.data;
    }
};

export default cursoApi;