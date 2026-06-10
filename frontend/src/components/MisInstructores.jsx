import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MisInstructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarInstructores();
  }, []);

  const cargarInstructores = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const coordinadorId = user.id;
      
      console.log('Buscando instructores para coordinador:', coordinadorId);
      
      // El token se incluye AUTOMÁTICAMENTE gracias al interceptor de api.js
      // No necesitas hacer nada especial, api.js ya lo maneja
      const response = await api.get(`/usuarios/coordinador/${coordinadorId}/instructores`);
      
      console.log('Respuesta:', response.data);
      setInstructores(response.data.data || []);
      
    } catch (error) {
      console.error('Error cargando instructores:', error);
      if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError('Error al cargar la lista de instructores');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Cargando instructores...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👥 Mis Instructores Asignados</h2>
      
      {error && <div style={styles.errorAlert}>❌ {error}</div>}

      {instructores.length === 0 ? (
        <div style={styles.noData}>
          <p>📭 No tienes instructores asignados</p>
          <p style={styles.noDataSub}>Cuando los instructores te elijan como coordinador, aparecerán aquí</p>
        </div>
      ) : (
        <>
          <p style={styles.totalInfo}>
            Total de instructores: <strong>{instructores.length}</strong>
          </p>
          
          <div style={styles.grid}>
            {instructores.map((instructor) => (
              <div key={instructor._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    {instructor.nombre} {instructor.apellido}
                  </h3>
                  <span style={styles.cardBadge}>Instructor</span>
                </div>
                
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📧 Email:</span>
                    <span style={styles.infoValue}>{instructor.correoElectronico}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📱 Teléfono:</span>
                    <span style={styles.infoValue}>{instructor.telefono}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🆔 Usuario:</span>
                    <span style={styles.infoValue}>{instructor.nombreUsuario}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📄 Documento:</span>
                    <span style={styles.infoValue}>{instructor.numeroIdentificacion}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📅 Registro:</span>
                    <span style={styles.infoValue}>
                      {new Date(instructor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button 
                    onClick={() => window.location.href = `/dashboard?instructor=${instructor._id}`}
                    style={styles.verButton}
                  >
                    Ver ofertas
                  </button>
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
  totalInfo: {
    backgroundColor: '#f0f8f4',
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '20px',
    color: '#00643C',
    border: '1px solid #00643C'
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
    border: '1px solid #e0e0e0',
    transition: 'transform 0.3s ease'
  },
  cardHeader: {
    backgroundColor: '#00643C',
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
    backgroundColor: '#FFD700',
    color: '#00643C',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cardBody: {
    padding: '15px'
  },
  infoRow: {
    display: 'flex',
    marginBottom: '10px',
    fontSize: '14px'
  },
  infoLabel: {
    width: '100px',
    color: '#666',
    fontWeight: 'bold'
  },
  infoValue: {
    flex: 1,
    color: '#333'
  },
  cardFooter: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e0e0e0'
  },
  verButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#00643C',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px'
  }
};

export default MisInstructores;