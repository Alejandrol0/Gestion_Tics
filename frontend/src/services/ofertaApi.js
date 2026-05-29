// services/ofertaApi.js
import api from './api';

const ofertaApi = {
  // ── Referencias ────────────────────────────────────────────────────────────
  getReferencias: async () => {
    const response = await api.get('/ofertas/referencias');
    return response.data;
  },

  // ── Crear oferta ────────────────────────────────────────────────────────────
  crearOferta: async (ofertaData, tipo) => {
    try {
      const formData = new FormData();

      // Determinar si es oferta cerrada (necesario para el backend)
      const esCerrada = ofertaData.tipo_oferta_nombre === 'Cerrada';
      const dataToSend = {
        ...ofertaData,
        esCerrada,
        // Asegurar que los IDs sean correctos
        programa_formacion: ofertaData.programa_formacion?._id || ofertaData.programa_formacion,
        modalidad: ofertaData.modalidad?._id || ofertaData.modalidad,
        tipo_programa: ofertaData.tipo_programa?._id || ofertaData.tipo_programa,
        tipo_oferta: ofertaData.tipo_oferta?._id || ofertaData.tipo_oferta,
        ubicacion: {
          ...ofertaData.ubicacion,
          municipio: ofertaData.ubicacion?.municipio?._id || ofertaData.ubicacion?.municipio
        }
      };

      // Agregar datos de empresa solo si es cerrada y hay datos
      if (esCerrada && ofertaData.empresa_solicitante) {
        dataToSend.empresa_solicitante = ofertaData.empresa_solicitante;
      }

      formData.append('oferta', JSON.stringify(dataToSend));

      // Agregar archivo PDF si existe
      if (ofertaData.carta_pdf_file) {
        formData.append('carta_pdf', ofertaData.carta_pdf_file);
      }

      const endpoint = tipo === 'campesena' ? '/ofertas/campesena' : '/ofertas/regular';
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error crear oferta:', error.response?.data || error.message);
      throw error;
    }
  },

  // ── Mis ofertas ────────────────────────────────────────────────────────────
  getMisOfertas: async () => {
    const response = await api.get('/ofertas/mis-ofertas');
    return response.data;
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
        modalidad: ofertaData.modalidad?._id || ofertaData.modalidad,
        tipo_programa: ofertaData.tipo_programa?._id || ofertaData.tipo_programa,
        tipo_oferta: ofertaData.tipo_oferta?._id || ofertaData.tipo_oferta,
        duracion_meses: ofertaData.duracion_meses,
        cupo_maximo: Number(ofertaData.cupo_maximo),
        ambiente: { nombre: ofertaData.ambiente?.nombre || '' },
        fechas: {
          inicio: ofertaData.fechas?.inicio || ofertaData.fechas?.inicio_curso,
          fin: ofertaData.fechas?.fin || ofertaData.fechas?.fin_curso
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