// services/ofertaApi.js
import api from './api';

const ofertaApi = {
    // ── Referencias ────────────────────────────────────────────────────────────
    getReferencias: async () => {
        const response = await api.get('/ofertas/referencias');
        return response.data; // { programas, modalidades, tiposProg, tiposOferta, municipios }
    },

    // ── Crear oferta ────────────────────────────────────────────────────────────
    crearOferta: async (ofertaData, tipo) => {
        try {
            const payload = {
                programa_formacion: ofertaData.programa_formacion?._id || ofertaData.programa_formacion,
                modalidad:          ofertaData.modalidad?._id          || ofertaData.modalidad,
                tipo_programa:      ofertaData.tipo_programa?._id      || ofertaData.tipo_programa,
                tipo_oferta:        ofertaData.tipo_oferta?._id        || ofertaData.tipo_oferta,
                duracion_meses: ofertaData.duracion_meses || 4,
                firma_digital: ofertaData.firma_digital || { tipo: 'electronica' },
                // empresa_solicitante es un ObjectId, si no se usa enviar null
                empresa_solicitante: ofertaData.empresa_solicitante || null,

                cupo_maximo:        Number(ofertaData.cupo_maximo),
                ambiente: { nombre: ofertaData.ambiente?.nombre || '' },
                fechas: {
                    inicio: ofertaData.fechas?.inicio_curso || new Date(),
                    fin:    ofertaData.fechas?.fin_curso    || new Date()
                },
                ubicacion: {
                    departamento: ofertaData.ubicacion?.departamento || 'Cauca',
                    municipio:    ofertaData.ubicacion?.municipio?._id || ofertaData.ubicacion?.municipio,
                    direccion:    ofertaData.ubicacion?.direccion || ''
                },
                subsector_economico: { nombre: ofertaData.subsector_economico?.nombre || '' },
                convenio: { nombre: ofertaData.convenio?.nombre || '' },
                ...(ofertaData.coordinador_asignado && {
                    coordinador_asignado: ofertaData.coordinador_asignado?._id || ofertaData.coordinador_asignado
                })
            };

            // Horario solo para ofertas regulares
            if (tipo !== 'campesena') {
                payload.horario = {
                    hora_inicio: ofertaData.horario?.hora_inicio || '',
                    hora_fin:    ofertaData.horario?.hora_fin    || '',
                    dias:        ofertaData.horario?.dias        || []
                };
            }

            // Datos específicos para campesena
            if (tipo === 'campesena') {
                payload.es_campesena = true;
                payload.programa_especial = ofertaData.programa_especial?._id || ofertaData.programa_especial || null;
            }

            const endpoint = tipo === 'campesena' ? '/ofertas/campesena' : '/ofertas/regular';
            const response = await api.post(endpoint, payload);
            return response.data;
        } catch (error) {
            console.error('❌ Error crear oferta:', error.response?.data || error.message);
            throw error;
        }
    },

    // ── Mis ofertas ────────────────────────────────────────────────────────────
    getMisOfertas: async () => {
        const response = await api.get('/ofertas/mis-ofertas');
        return response.data; // array de ofertas
    },

    getOferta: async (id) => {
        const response = await api.get(`/ofertas/mis-ofertas/${id}`);
        return response.data;
    },

    // ── Actualizar oferta ───────────────────────────────────────────────────────
    actualizarOferta: async (id, ofertaData) => {
        try {
            const payload = {
                programa_formacion: ofertaData.programa_formacion?._id || ofertaData.programa_formacion,
                modalidad:          ofertaData.modalidad?._id          || ofertaData.modalidad,
                tipo_programa:      ofertaData.tipo_programa?._id      || ofertaData.tipo_programa,
                tipo_oferta:        ofertaData.tipo_oferta?._id        || ofertaData.tipo_oferta,
                duracion_meses:     ofertaData.duracion_meses,
                cupo_maximo:        Number(ofertaData.cupo_maximo),
                ambiente: { nombre: ofertaData.ambiente?.nombre || '' },
                fechas: {
                    inicio: ofertaData.fechas?.inicio || ofertaData.fechas?.inicio_curso,
                    fin:    ofertaData.fechas?.fin    || ofertaData.fechas?.fin_curso
                },
                ubicacion: {
                    municipio: ofertaData.ubicacion?.municipio?._id || ofertaData.ubicacion?.municipio,
                    direccion: ofertaData.ubicacion?.direccion || ''
                },
                subsector_economico: { nombre: ofertaData.subsector_economico?.nombre || '' },
                convenio: { nombre: ofertaData.convenio?.nombre || '' },
                horario: ofertaData.horario,
                ...(ofertaData.coordinador_asignado && {
                    coordinador_asignado: ofertaData.coordinador_asignado?._id || ofertaData.coordinador_asignado
                })
            };
            const response = await api.put(`/ofertas/mis-ofertas/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error('❌ Error actualizar oferta:', error.response?.data || error.message);
            throw error;
        }
    },

    // ── Eliminar oferta ─────────────────────────────────────────────────────────
    eliminarOferta: async (id) => {
        const response = await api.delete(`/ofertas/mis-ofertas/${id}`);
        return response.data;
    }
};

export default ofertaApi;