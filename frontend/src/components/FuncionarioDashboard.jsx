import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FuncionarioDashboard = () => {
  const [vistaActiva, setVistaActiva] = useState('ofertas');
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descargando, setDescargando] = useState(false); // ← AGREGAR ESTA LÍNEA
  const [formData, setFormData] = useState({
    codigo_ficha: '',
    fecha_creacion: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const tipoFuncionario = user.tipo_funcionario || 'regular';

  useEffect(() => {
    cargarOfertasAprobadas();
  }, []);

  const cargarOfertasAprobadas = async () => {
    try {
        setLoading(true);
        const response = await api.get(`/ofertas-funcionario/aprobadas/${tipoFuncionario}`);
        setOfertas(response.data.data || []);
    } catch (error) {
        console.error('Error cargando ofertas:', error);
        setError('Error al cargar las ofertas aprobadas');
    } finally {
        setLoading(false);
    }
  };

  // Función para descargar Excel completo de la oferta
  const descargarExcelCompleto = async (ofertaId) => {
    try {
      setDescargando(true);
      setError('');
      
      console.log('📥 Descargando Excel para oferta:', ofertaId);
      
      const response = await api.get(`/ofertas/${ofertaId}/exportar-excel`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Determinar nombre del archivo según el tipo de oferta
      const oferta = ofertas.find(o => o._id === ofertaId);
      const tipo = oferta?.es_campesena ? 'campesena' : 'regular';
      link.setAttribute('download', `oferta_${tipo}_${oferta?.programa_formacion?.codigo || ofertaId}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess('✅ Excel descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error descargando Excel:', error);
      setError(error.response?.data?.message || 'Error al descargar el Excel');
    } finally {
      setDescargando(false);
    }
  };


  // Exportar datos completos (Excel para instructor)
const exportarDatosCompletos = async () => {
  if (!ofertaSeleccionada) return;
  
  try {
    setExportando(true);
    
    const response = await api.get(`/inscripciones/oferta/${ofertaSeleccionada._id}/exportar/completo`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inscritos_${ofertaSeleccionada.programa_formacion?.codigo}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setSuccess('✅ Excel exportado correctamente');
    setTimeout(() => setSuccess(''), 3000);
    
  } catch (error) {
    console.error('Error exportando:', error);
    setError('Error al exportar los datos');
  } finally {
    setExportando(false);
  }
};


  const handleRegistrarFicha = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      await api.post(`/ofertas/${ofertaSeleccionada._id}/registrar-ficha`, {
        codigo_ficha: formData.codigo_ficha,
        fecha_creacion: formData.fecha_creacion,
        observaciones: formData.observaciones
      });

      setSuccess('✅ Ficha registrada exitosamente');
      setMostrarFormulario(false);
      setOfertaSeleccionada(null);
      cargarOfertasAprobadas();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Error al registrar ficha');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading && !mostrarFormulario) {
    return <div style={styles.loading}>Cargando ofertas aprobadas...</div>;
  }

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img 
            src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png" 
            alt="Logo SENA" 
            style={styles.logo}
          />
          <h1 style={styles.headerTitle}>Gestionytics - Funcionario</h1>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            {user?.nombre} 
            <span style={styles.userRol}> (Funcionario {tipoFuncionario})</span>
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenedor principal */}
      <div style={styles.mainContainer}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Menú Funcionario</h3>
          </div>
          
          <button 
            onClick={() => setVistaActiva('ofertas')}
            style={{
              ...styles.menuButton,
              ...(vistaActiva === 'ofertas' ? styles.menuButtonActive : {})
            }}
          >
            <span style={styles.menuIcon}>📋</span>
            Ofertas Aprobadas
          </button>
          
          <button 
            onClick={() => setVistaActiva('historial')}
            style={{
              ...styles.menuButton,
              ...(vistaActiva === 'historial' ? styles.menuButtonActive : {})
            }}
          >
            <span style={styles.menuIcon}>📊</span>
            Historial
          </button>

          <div style={styles.infoBox}>
            <p style={styles.infoLabel}>Tipo de Funcionario:</p>
            <p style={styles.infoValue}>{tipoFuncionario === 'campesena' ? '🌾 Campesena' : '🎓 Regular'}</p>
          </div>
        </div>

        {/* Contenido */}
        <div style={styles.content}>
          {error && <div style={styles.errorAlert}>❌ {error}</div>}
          {success && <div style={styles.successAlert}>✅ {success}</div>}

          {vistaActiva === 'ofertas' && (
            <>
              <h2 style={styles.title}>📋 Ofertas Aprobadas</h2>
              
              {ofertas.length === 0 ? (
                <div style={styles.noData}>
                  <p>No hay ofertas aprobadas para ti</p>
                  <p style={styles.noDataSub}>Espera a que el coordinador asigne ofertas</p>
                </div>
              ) : (
                <div style={styles.grid}>
                  {ofertas.map((oferta) => (
                    <div key={oferta._id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>
                          {oferta.programa_formacion?.nombre_programa}
                        </h3>
                        <span style={styles.cardBadge}>
                          {oferta.es_campesena ? 'Campesena' : 'Regular'}
                        </span>
                      </div>
                      
                      <div style={styles.cardBody}>
                        <p><strong>Código:</strong> {oferta.programa_formacion?.codigo}</p>
                        <p><strong>Instructor:</strong> {oferta.creado_por?.nombre}</p>
                        <p><strong>Empresa:</strong> {oferta.empresa_solicitante?.nombre}</p>
                        <p><strong>Fechas:</strong> {new Date(oferta.fechas?.inicio).toLocaleDateString()} - {new Date(oferta.fechas?.fin).toLocaleDateString()}</p>
                        <p><strong>Cupos:</strong> {oferta.cupos_disponibles}/{oferta.cupo_maximo}</p>
                      </div>
                      
                      <div style={styles.cardFooter}>
                        {!oferta.ficha_sofia ? (
                          <>
                            <button 
                              onClick={() => descargarExcelCompleto(oferta._id)}
                              disabled={descargando}
                              style={{
                                ...styles.excelButton,
                                ...(descargando ? styles.buttonDisabled : {})
                              }}
                            >
                              {descargando ? '📥 Descargando...' : '📥 Descargar Excel Completo'}
                            </button>
                            <p style={styles.notaPequeña}>
                              * Descargue este Excel y úselo para crear la ficha en Sofía Plus
                            </p>
                          </>
                        ) : (
                          <div style={styles.fichaInfo}>
                            <span style={styles.fichaCodigo}>Ficha: {oferta.ficha_sofia.codigo}</span>
                            <button 
                              onClick={() => descargarExcelCompleto(oferta._id)}
                              style={styles.secondaryButton}
                            >
                              📥 Descargar Excel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {vistaActiva === 'historial' && (
            <>
              <h2 style={styles.title}>📊 Historial de Fichas Creadas</h2>
              <div style={styles.noData}>
                <p>Próximamente...</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


const styles = {
  dashboard: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    backgroundColor: '#00643C',
    color: 'white',
    padding: '10px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0,100,60,0.2)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  logo: {
    height: '50px',
    width: 'auto',
    filter: 'brightness(0) invert(1)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '500',
    color: 'white'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white'
  },
  userRol: {
    fontSize: '12px',
    color: '#FFD700',
    marginLeft: '5px'
  },

  excelButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  notaPequeña: {
    fontSize: '12px',
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  mainContainer: {
    display: 'flex',
    padding: '20px',
    gap: '20px',
    height: 'calc(100vh - 90px)'
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,100,60,0.1)',
    padding: '25px 20px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e0e0e0'
  },
  sidebarHeader: {
    borderBottom: '3px solid #00643C',
    paddingBottom: '15px',
    marginBottom: '25px'
  },
  sidebarTitle: {
    margin: 0,
    color: '#00643C',
    fontSize: '20px',
    fontWeight: '600'
  },
  menuButton: {
    width: '100%',
    padding: '15px 20px',
    marginBottom: '10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    color: '#333',
    fontSize: '16px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s ease'
  },
  menuButtonActive: {
    backgroundColor: '#00643C',
    color: 'white',
    boxShadow: '0 4px 10px rgba(0,100,60,0.3)',
    transform: 'translateX(5px)'
  },
  menuIcon: {
    fontSize: '20px'
  },
  infoBox: {
    marginTop: 'auto',
    padding: '20px',
    backgroundColor: '#f0f8f4',
    borderRadius: '8px',
    border: '1px solid #00643C',
    borderLeft: '4px solid #00643C'
  },
  infoLabel: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#00643C'
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,100,60,0.1)',
    padding: '30px',
    overflowY: 'auto',
    border: '1px solid #e0e0e0'
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
    backgroundColor: '#2980b9',
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
  cardFooter: {
    padding: '15px',
    backgroundColor: '#f8f9fa'
  },
  primaryButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  secondaryButton: {
    padding: '8px 12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  fichaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fichaCodigo: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#27ae60'
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
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden'
  },
  modalHeader: {
    backgroundColor: '#00643C',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px'
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
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
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
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

export default FuncionarioDashboard;