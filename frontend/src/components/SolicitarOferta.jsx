import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SolicitarOferta = () => {
  const [ofertas, setOfertas] = useState([]);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [coordinador, setCoordinador] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inscritos, setInscritos] = useState([]);

  // Cargar ofertas del usuario y datos del coordinador
  useEffect(() => {
    cargarOfertas();
    cargarCoordinador();
  }, []);

  const cargarOfertas = async () => {
    try {
      const response = await api.get('/ofertas/mis-ofertas');
      setOfertas(response.data.data || []);
    } catch (error) {
      console.error('Error cargando ofertas:', error);
      setError('Error al cargar las ofertas');
    }
  };

  const cargarCoordinador = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.coordinadorAsignado) {
        setCoordinador(user.coordinadorAsignado);
      } else {
        // Si no viene en el user, cargarlo del backend
        const response = await api.get('/usuarios/coordinador');
        setCoordinador(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando coordinador:', error);
    }
  };

  const cargarInscritos = async (ofertaId) => {
    try {
      const response = await api.get(`/inscripciones/oferta/${ofertaId}`);
      setInscritos(response.data.data || []);
    } catch (error) {
      console.error('Error cargando inscritos:', error);
    }
  };

  const handleOfertaChange = async (e) => {
    const ofertaId = e.target.value;
    if (!ofertaId) {
      setOfertaSeleccionada(null);
      setInscritos([]);
      return;
    }

    const oferta = ofertas.find(o => o._id === ofertaId);
    setOfertaSeleccionada(oferta);
    await cargarInscritos(ofertaId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ofertaSeleccionada) {
      setError('Debe seleccionar una oferta');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('oferta_id', ofertaSeleccionada._id);
      formData.append('mensaje', mensaje);
      
      // Aquí podrías adjuntar archivos adicionales si es necesario
      // formData.append('archivo_extra', archivoExtra);

      const response = await api.post('/solicitudes/validacion', {
        oferta_id: ofertaSeleccionada._id,
        mensaje: mensaje
      });

      setSuccess('✅ Solicitud enviada exitosamente al coordinador');
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      setError(error.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📤 Solicitar Validación de Oferta</h2>
      <p style={styles.subtitle}>
        Envía todos los documentos de la oferta para su revisión por tu coordinador asignado
      </p>

      {/* Información del Coordinador */}
      {coordinador && (
        <div style={styles.coordinadorCard}>
          <h3 style={styles.coordinadorTitle}>👤 Coordinador Asignado</h3>
          <div style={styles.coordinadorInfo}>
            <p><strong>Nombre:</strong> {coordinador.nombre || 'Jose Alirio Cobo Lemos'}</p>
            <p><strong>Email:</strong> {coordinador.email || 'jcobo@sena.edu.co'}</p>
            <p><strong>Teléfono:</strong> {coordinador.telefono || '3226784590'}</p>
            <p><strong>Identificación:</strong> {coordinador.identificacion || '10671330'}</p>
          </div>
        </div>
      )}

      {error && <div style={styles.errorAlert}>❌ {error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Selección de Oferta */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 Seleccionar Oferta</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Seleccione la oferta a enviar:</label>
            <select
              onChange={handleOfertaChange}
              style={styles.select}
              required
            >
              <option value="">-- Seleccione una oferta --</option>
              {ofertas.map(oferta => (
                <option key={oferta._id} value={oferta._id}>
                  {oferta.programa_formacion?.nombre_programa} - {oferta.programa_formacion?.codigo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información de la Oferta Seleccionada */}
        {ofertaSeleccionada && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📊 Información de la Oferta</h3>
            <div style={styles.ofertaGrid}>
              <div style={styles.ofertaItem}>
                <span style={styles.ofertaLabel}>Código:</span>
                <span style={styles.ofertaValue}>{ofertaSeleccionada.programa_formacion?.codigo}</span>
              </div>
              <div style={styles.ofertaItem}>
                <span style={styles.ofertaLabel}>Programa:</span>
                <span style={styles.ofertaValue}>{ofertaSeleccionada.programa_formacion?.nombre_programa}</span>
              </div>
              <div style={styles.ofertaItem}>
                <span style={styles.ofertaLabel}>Tipo de Programa:</span>
                <span style={styles.ofertaValue}>
                  {ofertaSeleccionada.es_campesena ? 'Campesena' : 'Regular'}
                </span>
              </div>
              <div style={styles.ofertaItem}>
                <span style={styles.ofertaLabel}>Tipo de Oferta:</span>
                <span style={styles.ofertaValue}>{ofertaSeleccionada.tipo_oferta?.nombre || 'N/A'}</span>
              </div>
              <div style={styles.ofertaItem}>
                <span style={styles.ofertaLabel}>Estado:</span>
                {/* 🔥 CORREGIDO: mostrar el nombre del estado */}
                <span style={styles.ofertaValue}>
                  {ofertaSeleccionada.estado?.nombre || ofertaSeleccionada.estado?.codigo || 'pendiente'}
                </span>
              </div>
              <div style={styles.ofertaItem}>
                <span style={styles.ofertaLabel}>Fecha Inicio:</span>
                <span style={styles.ofertaValue}>{formatDate(ofertaSeleccionada.fechas?.inicio)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Documentos a Enviar */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📎 Documentos para Enviar</h3>
          
          <div style={styles.documentosList}>
            {/* Ficha de Caracterización - SIEMPRE DISPONIBLE */}
            <div style={styles.documentoItem}>
              <div style={styles.documentoIcon}>📄</div>
              <div style={styles.documentoInfo}>
                <h4 style={styles.documentoTitulo}>Ficha de Caracterización</h4>
                <p style={styles.documentoDesc}>Documento PDF generado automáticamente con la información de la oferta.</p>
              </div>
              <span style={styles.documentoEstado}>✅ Disponible</span>
            </div>

            {/* Carta de Presentación - VERIFICAR SI EXISTE */}
            <div style={styles.documentoItem}>
              <div style={styles.documentoIcon}>📋</div>
              <div style={styles.documentoInfo}>
                <h4 style={styles.documentoTitulo}>Carta de Presentación</h4>
                <p style={styles.documentoDesc}>Documento PDF con la carta de presentación.</p>
              </div>
              <span style={ofertaSeleccionada?.carta_pdf ? styles.documentoEstado : styles.documentoNoDisponible}>
                {ofertaSeleccionada?.carta_pdf ? '✅ Adjunta' : '❌ No disponible'}
              </span>
            </div>

            {/* Listado de Cédulas (Excel) - VERIFICAR SI HAY INSCRITOS */}
            <div style={styles.documentoItem}>
              <div style={styles.documentoIcon}>📊</div>
              <div style={styles.documentoInfo}>
                <h4 style={styles.documentoTitulo}>Listado de Cédulas (Excel)</h4>
                <p style={styles.documentoDesc}>Archivo Excel con el listado de aspirantes inscritos.</p>
              </div>
              <span style={inscritos.length > 0 ? styles.documentoEstado : styles.documentoNoDisponible}>
                {inscritos.length > 0 ? `✅ ${inscritos.length} inscritos` : '❌ Sin inscritos'}
              </span>
            </div>

            {/* Cédulas Escaneadas (PDF) - VERIFICAR SI HAY INSCRITOS */}
            <div style={styles.documentoItem}>
              <div style={styles.documentoIcon}>📑</div>
              <div style={styles.documentoInfo}>
                <h4 style={styles.documentoTitulo}>Cédulas Escaneadas (PDF)</h4>
                <p style={styles.documentoDesc}>Documento PDF combinado con todas las cédulas de los aspirantes.</p>
              </div>
              <span style={inscritos.length > 0 ? styles.documentoEstado : styles.documentoNoDisponible}>
                {inscritos.length > 0 ? '✅ Disponible' : '❌ Sin cédulas'}
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje para el coordinador */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📝 Mensaje para el coordinador</h3>
          <div style={styles.formGroup}>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              style={styles.textarea}
              rows="4"
              placeholder="Escriba un mensaje adicional para el coordinador (opcional)..."
            />
          </div>
        </div>

        {/* Botón de envío */}
        <div style={styles.footer}>
          <div style={styles.destinatarioInfo}>
            <strong>Destinatario:</strong> {coordinador?.nombre || 'Coordinador'} - Todas las ofertas se envían al coordinador asignado
          </div>
          <button
            type="submit"
            style={loading ? {...styles.submitButton, ...styles.buttonDisabled} : styles.submitButton}
            disabled={loading || !ofertaSeleccionada}
          >
            {loading ? 'Enviando...' : '📤 Enviar Solicitud a Coordinador'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    color: '#2c3e50',
    borderBottom: '3px solid #3498db',
    paddingBottom: '10px',
    marginBottom: '10px',
    fontSize: '24px'
  },
  subtitle: {
    color: '#7f8c8d',
    marginBottom: '25px',
    fontSize: '14px'
  },
  coordinadorCard: {
    backgroundColor: '#e8f4fd',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #3498db'
  },
  coordinadorTitle: {
    color: '#2c3e50',
    margin: '0 0 15px 0',
    fontSize: '18px'
  },
  coordinadorInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #e0e0e0'
  },
  sectionTitle: {
    color: '#2c3e50',
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    borderBottom: '1px solid #3498db',
    paddingBottom: '5px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#34495e'
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  ofertaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  },
  ofertaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #e0e0e0'
  },
  ofertaLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    textTransform: 'uppercase'
  },
  ofertaValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  documentosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  documentoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  documentoIcon: {
    fontSize: '24px',
    width: '40px',
    textAlign: 'center'
  },
  documentoInfo: {
    flex: 1
  },
  documentoTitulo: {
    margin: '0 0 5px 0',
    fontSize: '15px',
    color: '#2c3e50'
  },
  documentoDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#7f8c8d'
  },
  documentoEstado: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#27ae60',
    minWidth: '100px',
    textAlign: 'right'
  },
  documentoPendiente: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#e67e22',
    minWidth: '100px',
    textAlign: 'right'
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif'
  },
  footer: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  destinatarioInfo: {
    marginBottom: '15px',
    fontSize: '14px',
    color: '#34495e',
    padding: '10px',
    backgroundColor: '#e8f4fd',
    borderRadius: '4px'
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '15px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  successAlert: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px'
  }
};

export default SolicitarOferta;