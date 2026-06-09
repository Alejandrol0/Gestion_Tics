import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RevisarSolicitud = ({ solicitudId, onClose, onActualizar }) => {
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [archivos, setArchivos] = useState({
    ficha: false,
    carta: false,
    excel: false,
    cedulas: false
  });

  useEffect(() => {
    if (solicitudId) {
      cargarSolicitud();
    }
  }, [solicitudId]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/solicitudes/${solicitudId}`);
      const data = response.data.data;
      setSolicitud(data);
      
      // Verificar archivos
      try {
        const archivosRes = await api.get(`/solicitudes/${solicitudId}/archivos`);
        setArchivos(archivosRes.data.data);
      } catch (error) {
        console.log('No se pudieron verificar archivos');
      }
      
    } catch (error) {
      console.error('Error cargando solicitud:', error);
      setError('Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Aprobar solicitud
const handleAprobar = async () => {
  try {
    setEnviando(true);
    await api.put(`/solicitudes/${solicitudId}/aprobar`, {
      comentarios: 'Aprobada por coordinador'
    });
    
    if (onActualizar) onActualizar();
    if (onClose) onClose();
    
  } catch (error) {
    console.error('Error aprobando solicitud:', error);
    setError('Error al aprobar la solicitud');
  } finally {
    setEnviando(false);
  }
};


  // SOLO RECHAZAR - El coordinador no puede aprobar
  const handleRechazar = async () => {
    if (!observaciones.trim()) {
      setError('Debe escribir una observación explicando el motivo del rechazo');
      return;
    }

    try {
      setEnviando(true);
      await api.put(`/solicitudes/${solicitudId}/rechazar`, {
        comentarios: observaciones
      });
      
      if (onActualizar) onActualizar();
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      setError('Error al rechazar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  const descargarArchivo = async (tipo) => {
    try {
      const response = await api.get(`/solicitudes/${solicitudId}/descargar/${tipo}`, {
        responseType: 'blob'
      });
      
      // Determinar la extensión correcta según el tipo de archivo
      let extension = '.pdf'; // Por defecto PDF
      if (tipo === 'excel') {
        extension = '.xlsx'; // Excel
      }
      
      // Obtener el tipo de contenido de la respuesta
      const contentType = response.headers['content-type'];
      if (contentType) {
        if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
          extension = '.xlsx';
        } else if (contentType.includes('pdf')) {
          extension = '.pdf';
        }
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_${solicitud?.oferta_id?.programa_formacion?.codigo}${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Error descargando:', error);
    }
  };


  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO') + ' ' + date.toLocaleTimeString('es-CO');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Cargando solicitud...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorAlert}>❌ {error}</div>
        <button onClick={onClose} style={styles.cerrarButton}>Cerrar</button>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div style={styles.container}>
        <div style={styles.noData}>Solicitud no encontrada</div>
        <button onClick={onClose} style={styles.cerrarButton}>Cerrar</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📋 Revisar Solicitud de Validación</h2>
        <button onClick={onClose} style={styles.closeButton}>✕</button>
      </div>

      {/* Información de la Oferta */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Información de la Oferta</h3>
        
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📌</span>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Código:</span>
              <span style={styles.infoValue}>{solicitud.oferta_id?.programa_formacion?.codigo}</span>
            </div>
          </div>
          
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🎓</span>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Programa:</span>
              <span style={styles.infoValue}>{solicitud.oferta_id?.programa_formacion?.nombre_programa}</span>
            </div>
          </div>
          
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>👤</span>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Instructor:</span>
              <span style={styles.infoValue}>
                {solicitud.instructor_id?.nombre} {solicitud.instructor_id?.apellido}
              </span>
            </div>
          </div>
          
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📧</span>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{solicitud.instructor_id?.correoElectronico}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de la Solicitud */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Detalles de la Solicitud</h3>
        
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>📅 Fecha Solicitud:</span>
            <span style={styles.detailValue}>{formatFecha(solicitud.fecha_solicitud)}</span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>🏷️ Tipo de Programa:</span>
            <span style={styles.detailValue}>
              {solicitud.oferta_id?.es_campesena ? 'Campesena' : 'Regular'}
            </span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>🚪 Tipo de Oferta:</span>
            <span style={styles.detailValue}>{solicitud.oferta_id?.tipo_oferta?.nombre}</span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>📊 Estado Actual:</span>
            <span style={{
              ...styles.estadoBadge,
              backgroundColor: '#f39c12' // Siempre pendiente
            }}>
              PENDIENTE
            </span>
          </div>
          
          {solicitud.mensaje && (
            <div style={styles.detailItemFull}>
              <span style={styles.detailLabel}>💬 Mensaje del instructor:</span>
              <div style={styles.mensajeBox}>
                {solicitud.mensaje}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documentos Adjuntos */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📎 Documentos Adjuntos</h3>
        
        <div style={styles.documentosGrid}>
          <button 
            onClick={() => descargarArchivo('ficha')}
            disabled={!archivos.ficha}
            style={{
              ...styles.documentoButton,
              ...(archivos.ficha ? styles.documentoDisponible : styles.documentoNoDisponible)
            }}
          >
            <span style={styles.documentoIcon}>📄</span>
            <span style={styles.documentoNombre}>Ficha</span>
            {archivos.ficha && <span style={styles.documentoCheck}>✓</span>}
          </button>
          
          <button 
            onClick={() => descargarArchivo('carta')}
            disabled={!archivos.carta}
            style={{
              ...styles.documentoButton,
              ...(archivos.carta ? styles.documentoDisponible : styles.documentoNoDisponible)
            }}
          >
            <span style={styles.documentoIcon}>📋</span>
            <span style={styles.documentoNombre}>Carta</span>
            {archivos.carta && <span style={styles.documentoCheck}>✓</span>}
          </button>
          
          <button 
            onClick={() => descargarArchivo('excel')}
            disabled={!archivos.excel}
            style={{
              ...styles.documentoButton,
              ...(archivos.excel ? styles.documentoDisponible : styles.documentoNoDisponible)
            }}
          >
            <span style={styles.documentoIcon}>📊</span>
            <span style={styles.documentoNombre}>Excel</span>
            {archivos.excel && <span style={styles.documentoCheck}>✓</span>}
          </button>
          
          <button 
            onClick={() => descargarArchivo('cedulas')}
            disabled={!archivos.cedulas}
            style={{
              ...styles.documentoButton,
              ...(archivos.cedulas ? styles.documentoDisponible : styles.documentoNoDisponible)
            }}
          >
            <span style={styles.documentoIcon}>📑</span>
            <span style={styles.documentoNombre}>Cédulas PDF</span>
            {archivos.cedulas && <span style={styles.documentoCheck}>✓</span>}
          </button>
        </div>
        
        <p style={styles.archivosNota}>
          * Revise que todos los documentos estén completos antes de rechazar
        </p>
      </div>

      {/* ACCIÓN: SOLO RECHAZAR */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>❌ Rechazar Solicitud</h3>
        
        <div style={styles.rechazoContainer}>
          <div style={styles.observacionesGroup}>
            <label style={styles.label}>📝 Motivo del rechazo (obligatorio):</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              style={styles.textarea}
              rows="4"
              placeholder="Indique qué documentos faltan o qué debe corregir el instructor..."
            />
          </div>
          
          <button 
            onClick={handleRechazar}
            disabled={enviando || !observaciones.trim()}
            style={enviando ? {...styles.rechazarButton, ...styles.buttonDisabled} : styles.rechazarButton}
          >
            {enviando ? 'Rechazando...' : '❌ Rechazar solicitud'}
          </button>
          
          <p style={styles.nota}>
            ⚠️ Al rechazar, el instructor recibirá tus comentarios y deberá corregir los documentos.
          </p>
        </div>
      </div>

      {/* ACCIÓN: APROBAR */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>✅ Aprobar Solicitud</h3>
        
        <div style={styles.aprobarContainer}>
          <p style={styles.aprobarTexto}>
            Si todos los documentos están completos y correctos, aprueba la solicitud para que pase al funcionario correspondiente.
          </p>
          
          <button 
            onClick={handleAprobar}
            disabled={enviando}
            style={enviando ? {...styles.aprobarButton, ...styles.buttonDisabled} : styles.aprobarButton}
          >
            {enviando ? 'Aprobando...' : '✅ Aprobar solicitud'}
          </button>
          
          <p style={styles.nota}>
            ⚠️ Al aprobar, la oferta pasará al funcionario para que cree la ficha en Sofía Plus.
          </p>
        </div>
      </div>

  

    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },

  aprobarContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f0f8f4',
    borderRadius: '8px',
    border: '2px solid #27ae60'
  },
  aprobarTexto: {
    fontSize: '14px',
    color: '#2c3e50',
    margin: 0
  },
  aprobarButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '5px'
  },


  header: {
    backgroundColor: '#00643C',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '22px'
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  section: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  sectionTitle: {
    color: '#00643C',
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    borderBottom: '2px solid #00643C',
    paddingBottom: '8px'
  },
  infoGrid: {
    display: 'grid',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  infoIcon: {
    fontSize: '20px'
  },
  infoContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  detailsGrid: {
    display: 'grid',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  detailItemFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#34495e'
  },
  detailValue: {
    color: '#2c3e50'
  },
  estadoBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  mensajeBox: {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '4px',
    fontStyle: 'italic',
    border: '1px solid #e0e0e0'
  },
  documentosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '10px'
  },
  documentoButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    border: '2px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  documentoDisponible: {
    backgroundColor: '#f0f8f4',
    borderColor: '#00643C',
    color: '#00643C'
  },
  documentoNoDisponible: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ddd',
    color: '#999',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  documentoIcon: {
    fontSize: '18px'
  },
  documentoNombre: {
    flex: 1
  },
  documentoCheck: {
    color: '#27ae60',
    fontWeight: 'bold'
  },
  archivosNota: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '5px',
    fontStyle: 'italic'
  },
  rechazoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  observacionesGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#34495e'
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif'
  },
  rechazarButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '5px'
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed'
  },
  nota: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '5px',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#7f8c8d'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    margin: '20px'
  },
  cerrarButton: {
    margin: '20px',
    padding: '10px 20px',
    backgroundColor: '#00643C',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  noData: {
    textAlign: 'center',
    padding: '50px',
    color: '#7f8c8d'
  }
};

export default RevisarSolicitud;