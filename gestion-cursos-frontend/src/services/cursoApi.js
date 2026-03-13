import api from './api';

const cursoApi = {
    // Obtener datos de referencia
    getReferencias: async () => {
        const response = await api.get('/cursos/referencias');
        return response.data;
    },

    // Obtener coordinadores disponibles
    getCoordinadores: async () => {
        const response = await api.get('/coordinadores/disponibles');
        return response.data;
    },

    // Crear un nuevo curso
    crearCurso: async (cursoData) => {
        try {
            // IMPORTANTE: Asegurarnos de enviar SOLO los IDs
            const dataToSend = {
                programa_formacion: cursoData.programa_formacion?._id || cursoData.programa_formacion,
                modalidad: cursoData.modalidad?._id || cursoData.modalidad,
                tipo_programa: cursoData.tipo_programa?._id || cursoData.tipo_programa,
                tipo_oferta: cursoData.tipo_oferta?._id || cursoData.tipo_oferta,
                cupo_maximo: Number(cursoData.cupo_maximo),
                coordinador_asignado: cursoData.coordinador_asignado?._id || cursoData.coordinador_asignado
            };

            // Agregar campos opcionales solo si existen
            if (cursoData.programa_especial) {
                dataToSend.programa_especial = cursoData.programa_especial;
            }

            if (cursoData.ambiente) {
                dataToSend.ambiente = cursoData.ambiente;
            }

            if (cursoData.fechas) {
                dataToSend.fechas = cursoData.fechas;
            }

            if (cursoData.ubicacion) {
                dataToSend.ubicacion = cursoData.ubicacion;
            }

            if (cursoData.horario) {
                dataToSend.horario = cursoData.horario;
            }

            console.log('📤 Enviando datos al backend:', dataToSend);

            const response = await api.post('/cursos', dataToSend);
            return response.data;
        } catch (error) {
            console.error('❌ Error en crearCurso:', error.response?.data || error.message);
            throw error;
        }
    },

    // Obtener mis cursos
    getMisCursos: async () => {
        const response = await api.get('/cursos/mis-cursos');
        return response.data;
    },

    // Obtener un curso específico
    getCurso: async (id) => {
        const response = await api.get(`/cursos/mis-cursos/${id}`);
        return response.data;
    },

    // Actualizar un curso
    actualizarCurso: async (id, cursoData) => {
        try {
            // Limpiar datos antes de enviar
            const dataToSend = {
                programa_formacion: cursoData.programa_formacion?._id || cursoData.programa_formacion,
                modalidad: cursoData.modalidad?._id || cursoData.modalidad,
                tipo_programa: cursoData.tipo_programa?._id || cursoData.tipo_programa,
                tipo_oferta: cursoData.tipo_oferta?._id || cursoData.tipo_oferta,
                cupo_maximo: Number(cursoData.cupo_maximo),
                coordinador_asignado: cursoData.coordinador_asignado?._id || cursoData.coordinador_asignado
            };

            console.log('📤 Actualizando curso:', dataToSend);

            const response = await api.put(`/cursos/mis-cursos/${id}`, dataToSend);
            return response.data;
        } catch (error) {
            console.error('❌ Error en actualizarCurso:', error.response?.data || error.message);
            throw error;
        }
    },

    // Eliminar un curso
    eliminarCurso: async (id) => {
        const response = await api.delete(`/cursos/mis-cursos/${id}`);
        return response.data;
    }
};

export default cursoApi;