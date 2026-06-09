import React, { useState, useEffect } from 'react';
import api from '../services/api';

const VerInscritos = () => {
  const [ofertas, setOfertas] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [fusionando, setFusionando] = useState(false);

  // Cargar ofertas del usuario
  useEffect(() => {
    cargarOfertas();
  }, []);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ofertas/mis-ofertas');
      setOfertas(response.data.data || []);
    } catch (error) {
      console.error('Error cargando ofertas:', error);
      setError('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar inscritos de una oferta específica
  const cargarInscritos = async (ofertaId) => {
    try {
      setLoading(true);
      const response = await api.get(`/inscripciones/oferta/${ofertaId}`);
      setInscritos(response.data.data || []);
      
      // Encontrar la oferta seleccionada
      const oferta = ofertas.find(o => o._id === ofertaId);
      setOfertaSeleccionada(oferta);
      setMostrarDetalle(true);
    } catch (error) {
      console.error('Error cargando inscritos:', error);
      setError('Error al cargar los inscritos');
    } finally {
      setLoading(false);
    }
  };

  // Exportar datos completos (Excel con ambas hojas)
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
      link.setAttribute('download', `inscripciones_completas_${ofertaSeleccionada.programa_formacion?.codigo}.xlsx`);
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

  // Exportar Excel con cédulas

const exportarExcelCedulas = async () => {
  if (!ofertaSeleccionada) return;
  
  try {
    setExportando(true);
    
    const response = await api.get(`/inscripciones/oferta/${ofertaSeleccionada._id}/exportar/cedulas`, {
      responseType: 'blob'
    });
    
    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cedulas_${ofertaSeleccionada.programa_formacion?.codigo}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setSuccess('✅ Excel de cédulas exportado correctamente');
    setTimeout(() => setSuccess(''), 3000);
    
  } catch (error) {
    console.error('Error exportando Excel de cédulas:', error);
    setError('Error al exportar el Excel de cédulas');
  } finally {
    setExportando(false);
  }
};


  // ===== NUEVA FUNCIÓN: Fusionar PDFs =====
  const fusionarPDFs = async () => {
    if (!ofertaSeleccionada) return;
    
    try {
      setFusionando(true);
      setError('');
      
      const response = await api.post(`/inscripciones/oferta/${ofertaSeleccionada._id}/fusionar-pdfs`);
      
      if (response.data.success) {
        setSuccess(`✅ PDFs fusionados exitosamente. Total: ${response.data.data.totalPaginas} páginas`);
        
        // Opcional: Abrir el PDF fusionado en una nueva pestaña
        if (response.data.data.path) {
          // Aquí podrías generar un link para descargar el PDF fusionado
          console.log('PDF fusionado:', response.data.data);
        }
      } else {
        setError(response.data.message || 'Error al fusionar PDFs');
      }
      
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Error fusionando PDFs:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error al fusionar los PDFs');
      }
    } finally {
      setFusionando(false);
    }
  };

  // Volver al listado de ofertas
  const volverAlInicio = () => {
    setMostrarDetalle(false);
    setOfertaSeleccionada(null);
    setInscritos([]);
  };

  // Limpiar filtros (vuelve al inicio)
  const limpiar = () => {
    volverAlInicio();
  };

  // Obtener estado del link
  const obtenerEstadoLink = (oferta) => {
    const disponibles = oferta.cupos_disponibles || 0;
    if (disponibles === 0) return 'Agotado';
    if (disponibles < 5) return `¡Últimos ${disponibles} cupos!`;
    return `Disponible (${disponibles} cupos)`;
  };

  if (loading && !mostrarDetalle) {
    return <div style={styles.loading}>Cargando ofertas...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header con acciones */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          {mostrarDetalle ? '👥 Lista de Inscritos' : '📊 Estado de Cupos por Oferta'}
        </h2>
        
        {mostrarDetalle && (
          <button onClick={volverAlInicio} style={styles.backButton}>
            ← Volver al Inicio
          </button>
        )}
      </div>

      {error && <div style={styles.errorAlert}>❌ {error}</div>}
      {success && <div style={styles.successAlert}>✅ {success}</div>}

      {!mostrarDetalle ? (
        /* ===== LISTADO DE OFERTAS CON CUPOS ===== */
        <div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Programa</th>
                  <th style={styles.th}>Código</th>
                  <th style={styles.th}>Cupo Total</th>
                  <th style={styles.th}>Inscritos</th>
                  <th style={styles.th}>Disponibles</th>
                  <th style={styles.th}>Estado del Link</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ofertas.map((oferta) => {
                  const inscritosCount = oferta.cupo_maximo - (oferta.cupos_disponibles || 0);
                  return (
                    <tr key={oferta._id} style={styles.tr}>
                      <td style={styles.td}>{oferta.programa_formacion?.nombre_programa}</td>
                      <td style={styles.td}>{oferta.programa_formacion?.codigo}</td>
                      <td style={styles.td}>{oferta.cupo_maximo}</td>
                      <td style={styles.td}>{inscritosCount}</td>
                      <td style={styles.td}>{oferta.cupos_disponibles}</td>
                      <td style={styles.td}>
                        <span style={oferta.cupos_disponibles === 0 ? styles.estadoAgotado : styles.estadoDisponible}>
                          {obtenerEstadoLink(oferta)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => cargarInscritos(oferta._id)}
                          style={styles.verButton}
                        >
                          👥 Ver inscritos
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ofertas.length === 0 && (
            <div style={styles.noData}>
              <p>No tienes ofertas creadas aún.</p>
            </div>
          )}
        </div>
      ) : (
        /* ===== DETALLE DE INSCRITOS DE UNA OFERTA ===== */
        <div>
          {/* Barra de acciones */}
          <div style={styles.actionsBar}>
            <button 
              onClick={exportarDatosCompletos} 
              style={styles.exportButton}
              disabled={exportando || inscritos.length === 0}
            >
              📋 Exportar Datos Completos
            </button>
            <button 
              onClick={exportarExcelCedulas} 
              style={styles.exportCedulasButton}
              disabled={exportando || inscritos.length === 0}
            >
              📊 Exportar Excel-Cedulas
            </button>
            <button 
              onClick={fusionarPDFs} 
              style={styles.fusionarButton}
              disabled={fusionando || inscritos.length === 0}
            >
              {fusionando ? '🔄 Fusionando...' : '📄 Fusionar PDFs'}
            </button>
            <button onClick={limpiar} style={styles.limpiarButton}>
              Limpiar
            </button>
          </div>

          {/* Información de la oferta seleccionada */}
          {ofertaSeleccionada && (
            <div style={styles.ofertaInfo}>
              <h3 style={styles.ofertaTitle}>
                {ofertaSeleccionada.programa_formacion?.nombre_programa}
              </h3>
              <p><strong>Código:</strong> {ofertaSeleccionada.programa_formacion?.codigo}</p>
              <p><strong>Cupos:</strong> {inscritos.length} inscritos de {ofertaSeleccionada.cupo_maximo} totales</p>
            </div>
          )}

          {/* Tabla de inscritos */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre Completo</th>
                  <th style={styles.th}>Tipo Documento</th>
                  <th style={styles.th}>Documento</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Caracterización</th>
                  <th style={styles.th}>Oferta</th>
                </tr>
              </thead>
              <tbody>
                {inscritos.map((inscrito) => (
                  <tr key={inscrito._id} style={styles.tr}>
                    <td style={styles.td}>{inscrito.nombres} {inscrito.apellidos}</td>
                    <td style={styles.td}>{inscrito.tipo_documento?.nombre || 'N/A'}</td>
                    <td style={styles.td}>{inscrito.numero_documento}</td>
                    <td style={styles.td}>{inscrito.correo}</td>
                    <td style={styles.td}>{inscrito.telefono}</td>
                    <td style={styles.td}>{inscrito.caracterizacion?.tipo_caracterizacion || 'N/A'}</td>
                    <td style={styles.td}>
                      {ofertaSeleccionada?.programa_formacion?.codigo} - {ofertaSeleccionada?.programa_formacion?.nombre_programa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inscritos.length === 0 && (
            <div style={styles.noData}>
              <p>No hay inscritos para esta oferta aún.</p>
            </div>
          )}

          {/* Total de inscritos */}
          {inscritos.length > 0 && (
            <div style={styles.totalContainer}>
              <p style={styles.totalText}>Total de inscritos: <strong>{inscritos.length}</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  title: {
    color: '#2c3e50',
    fontSize: '24px',
    margin: 0
  },
  backButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  actionsBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  exportButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  exportCedulasButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  // ===== NUEVO ESTILO PARA EL BOTÓN DE FUSIÓN =====
  fusionarButton: {
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  limpiarButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  ofertaInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0'
  },
  ofertaTitle: {
    color: '#2c3e50',
    margin: '0 0 10px 0',
    fontSize: '18px'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  th: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '13px'
  },
  tr: {
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  estadoDisponible: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  estadoAgotado: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  verButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#7f8c8d'
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    color: '#7f8c8d'
  },
  totalContainer: {
    marginTop: '20px',
    textAlign: 'right',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  totalText: {
    fontSize: '16px',
    color: '#2c3e50'
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

export default VerInscritos;