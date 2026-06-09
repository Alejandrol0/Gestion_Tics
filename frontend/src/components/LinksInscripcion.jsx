import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LinksInscripcion = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUsuario(user);
    cargarMisOfertas();
  }, []);

  // ===== CAMBIADO: Ahora carga SOLO las ofertas del usuario actual =====
  const cargarMisOfertas = async () => {
    try {
      // Usar la ruta /mis-ofertas que ya existe en el backend
      const response = await api.get('/ofertas/mis-ofertas');
      setOfertas(response.data.data || []);
    } catch (error) {
      console.error('Error cargando mis ofertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = (link) => {
    const urlCompleta = `http://localhost:3000${link}`;
    navigator.clipboard.writeText(urlCompleta);
    setCopiado(link);
    setTimeout(() => setCopiado(null), 2000);
  };

  const abrirLink = (link) => {
    window.open(`http://localhost:3000${link}`, '_blank');
  };

  const descargarPDF = async (ofertaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/ofertas/${ofertaId}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ficha-${ofertaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Cargando mis ofertas...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔗 Mis Ofertas - Links de Inscripción</h2>
      
      {ofertas.length === 0 ? (
        <div style={styles.noDataContainer}>
          <p style={styles.noData}>No tienes ofertas creadas aún.</p>
          <p style={styles.noDataSub}>Ve a "Crear Oferta" para comenzar.</p>
        </div>
      ) : (
        <>
          <p style={styles.userInfo}>
            Mostrando ofertas de: <strong>{usuario?.nombreUsuario}</strong>
          </p>
          <div style={styles.grid}>
            {ofertas.map((oferta) => (
              <div key={oferta._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    {oferta.programa_formacion?.nombre_programa || 'Programa sin nombre'}
                  </h3>
                  <span style={styles.cupos}>
                    Cupos: {oferta.cupos_disponibles}/{oferta.cupo_maximo}
                  </span>
                </div>
                
                <div style={styles.cardBody}>
                  <p><strong>Código:</strong> {oferta.programa_formacion?.codigo || 'N/A'}</p>
                  <p><strong>Fechas:</strong> {new Date(oferta.fechas?.inicio).toLocaleDateString()} - {new Date(oferta.fechas?.fin).toLocaleDateString()}</p>
                  <p><strong>Ubicación:</strong> {oferta.ubicacion?.municipio?.nombre || 'N/A'}</p>
                  <p><strong>Coordinador:</strong> {oferta.coordinador_asignado?.nombre || 'N/A'}</p>
                </div>
                
                <div style={styles.linkSection}>
                  <div style={styles.linkBox}>
                    <span style={styles.linkTexto}>
                      {`localhost:3000${oferta.link_inscripciones || '/inscribirse/error'}`}
                    </span>
                  </div>
                  
                  <div style={styles.buttonGroup}>
                    <button 
                      onClick={() => copiarLink(oferta.link_inscripciones)}
                      style={styles.copyButton}
                      title="Copiar link"
                    >
                      {copiado === oferta.link_inscripciones ? '✅ Copiado!' : '📋 Copiar'}
                    </button>
                    <button 
                      onClick={() => abrirLink(oferta.link_inscripciones)}
                      style={styles.openButton}
                      title="Abrir formulario"
                    >
                      🔗 Abrir
                    </button>
                    <button 
                      onClick={() => descargarPDF(oferta._id)}
                      style={styles.pdfButton}
                      title="Descargar ficha de caracterización"
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    color: '#2c3e50',
    borderBottom: '3px solid #3498db',
    paddingBottom: '10px',
    marginBottom: '20px'
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: '10px 15px',
    borderRadius: '4px',
    marginBottom: '20px',
    color: '#34495e',
    border: '1px solid #e0e0e0'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#7f8c8d'
  },
  noDataContainer: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px dashed #3498db'
  },
  noData: {
    color: '#2c3e50',
    fontSize: '18px',
    marginBottom: '10px'
  },
  noDataSub: {
    color: '#7f8c8d',
    fontSize: '14px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
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
    backgroundColor: '#3498db',
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
  cupos: {
    backgroundColor: '#2c3e50',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  cardBody: {
    padding: '15px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px'
  },
  linkSection: {
    padding: '15px',
    backgroundColor: '#f8f9fa'
  },
  linkBox: {
    backgroundColor: '#ecf0f1',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    overflow: 'hidden'
  },
  linkTexto: {
    fontSize: '12px',
    color: '#2c3e50',
    wordBreak: 'break-all'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  copyButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  openButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  pdfButton: {
    flex: 0.5,
    padding: '8px',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  }
};

export default LinksInscripcion;