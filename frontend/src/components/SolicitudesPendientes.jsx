import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RevisarSolicitud from './RevisarSolicitud';

const SolicitudesPendientes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/solicitudes/pendientes');
      setSolicitudes(response.data.data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitudActualizada = () => {
    setSolicitudSeleccionada(null);
    cargarSolicitudes();
  };

  if (loading) {
    return <div style={styles.loading}>Cargando solicitudes...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✅ Solicitudes de Validación Pendientes</h2>
      
      {error && <div style={styles.errorAlert}>❌ {error}</div>}

      {solicitudes.length === 0 ? (
        <div style={styles.noData}>
          <p>📭 No hay solicitudes pendientes</p>
          <p style={styles.noDataSub}>Los instructores aún no han enviado solicitudes</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {solicitudes.map((solicitud) => (
            <div key={solicitud._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  {solicitud.oferta_id?.programa_formacion?.nombre_programa}
                </h3>
                <span style={styles.cardBadge}>Pendiente</span>
              </div>
              
              <div style={styles.cardBody}>
                <p><strong>👤 Instructor:</strong> {solicitud.instructor_id?.nombre} {solicitud.instructor_id?.apellido}</p>
                <p><strong>📧 Email:</strong> {solicitud.instructor_id?.correoElectronico}</p>
                <p><strong>📌 Código:</strong> {solicitud.oferta_id?.programa_formacion?.codigo}</p>
                <p><strong>📅 Fecha:</strong> {new Date(solicitud.fecha_solicitud).toLocaleDateString()}</p>
                {solicitud.mensaje && (
                  <div style={styles.mensaje}>
                    <strong>💬 Mensaje:</strong>
                    <p>{solicitud.mensaje}</p>
                  </div>
                )}
              </div>
              
              <div style={styles.cardFooter}>
                <button 
                  onClick={() => setSolicitudSeleccionada(solicitud._id)}
                  style={styles.revisarButton}
                >
                  Revisar Solicitud
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para revisar solicitud */}
      {solicitudSeleccionada && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <RevisarSolicitud
              solicitudId={solicitudSeleccionada}
              onClose={() => setSolicitudSeleccionada(null)}
              onActualizar={handleSolicitudActualizada}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    color: '#2c3e50',
    borderBottom: '3px solid #00643C',
    paddingBottom: '10px',
    marginBottom: '20px',
    fontSize: '24px'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#7f8c8d'
  },
  noData: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    color: '#2c3e50',
    border: '1px dashed #00643C'
  },
  noDataSub: {
    color: '#7f8c8d',
    fontSize: '14px',
    marginTop: '10px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  cardHeader: {
    backgroundColor: '#f39c12',
    color: 'white',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold'
  },
  cardBadge: {
    backgroundColor: '#2c3e50',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cardBody: {
    padding: '15px',
    borderBottom: '1px solid #e0e0e0'
  },
  mensaje: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    fontStyle: 'italic',
    fontSize: '13px'
  },
  cardFooter: {
    padding: '15px',
    backgroundColor: '#f8f9fa'
  },
  revisarButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#00643C',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '12px'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px'
  }
};

export default SolicitudesPendientes;