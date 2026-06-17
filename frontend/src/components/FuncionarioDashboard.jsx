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
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const [descargandoInscritos, setDescargandoInscritos] = useState(false);
  const [procesandoOfertaId, setProcesandoOfertaId] = useState(null); // NUEVO
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

  const descargarExcelCompleto = async (ofertaId) => {
    try {
      setDescargandoExcel(true);
      setError('');
      const response = await api.get(`/ofertas/${ofertaId}/exportar-excel`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
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
      setDescargandoExcel(false);
    }
  };

  const exportarDatosCompletos = async (ofertaId) => {
    if (!ofertaId) return;
    try {
      setDescargandoInscritos(true);
      const response = await api.get(`/inscripciones/oferta/${ofertaId}/exportar/completo`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const oferta = ofertas.find(o => o._id === ofertaId);
      link.setAttribute('download', `inscritos_${oferta?.programa_formacion?.codigo || ofertaId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('✅ Excel de inscritos descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exportando inscritos:', error);
      setError('Error al exportar los datos de inscritos');
    } finally {
      setDescargandoInscritos(false);
    }
  };

  // ===== NUEVA FUNCIÓN: Iniciar revisión =====
  const iniciarRevision = async (ofertaId) => {
    if (!window.confirm('¿Iniciar revisión? La oferta pasará a estado "Ficha en proceso de creación".')) return;
    try {
      setProcesandoOfertaId(ofertaId);
      await api.put(`/ofertas/${ofertaId}/iniciar-revision`);
      setSuccess('✅ Revisión iniciada. Ahora puedes crear la ficha.');
      cargarOfertasAprobadas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar revisión');
    } finally {
      setProcesandoOfertaId(null);
    }
  };

  // ===== NUEVA FUNCIÓN: Finalizar matrícula =====
  const finalizarMatricula = async (ofertaId) => {
    const mensaje = prompt('Mensaje para el instructor (opcional):', 'Los aspirantes han sido matriculados exitosamente.');
    try {
      setProcesandoOfertaId(ofertaId);
      await api.put(`/ofertas/${ofertaId}/finalizar-matricula`, { mensaje_instructor: mensaje || '' });
      setSuccess('✅ Matrícula finalizada. El instructor ha sido notificado.');
      cargarOfertasAprobadas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al finalizar matrícula');
    } finally {
      setProcesandoOfertaId(null);
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
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
        fontSize: '14px',
        color: '#2d6a4f'
      }}>
        Cargando ofertas aprobadas...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
          font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
        }
        .dashboard-header {
          background: linear-gradient(145deg, #00643C 0%, #004d2e 100%);
          padding: 12px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .logo-sena {
          height: 50px;
          width: auto;
          filter: brightness(0) invert(1);
        }
        .header-title {
          color: white;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .user-name {
          color: white;
          font-weight: 600;
        }
        .user-role {
          color: #FFD966;
          font-size: 13px;
          margin-left: 6px;
        }
        .logout-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }
        .dashboard-main {
          display: flex;
          padding: 28px 32px;
          gap: 28px;
          max-width: 1600px;
          margin: 0 auto;
        }
        .sidebar {
          width: 280px;
          background: white;
          border-radius: 32px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: fit-content;
          position: sticky;
          top: 20px;
        }
        .sidebar-title {
          font-size: 20px;
          font-weight: 700;
          color: #00643C;
          border-bottom: 2px solid #FFD966;
          padding-bottom: 10px;
          margin-bottom: 8px;
        }
        .menu-btn {
          width: 100%;
          padding: 14px 16px;
          background: #f8fafc;
          border: none;
          border-radius: 28px;
          text-align: left;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }
        .menu-btn:hover {
          background: #eef2ff;
          transform: translateX(4px);
        }
        .menu-btn-active {
          background: #00643C;
          color: white;
          box-shadow: 0 6px 14px rgba(0, 100, 60, 0.25);
        }
        .menu-icon {
          font-size: 20px;
        }
        .info-card {
          margin-top: auto;
          background: #f0fdf4;
          border-radius: 24px;
          padding: 16px;
          border-left: 4px solid #00643C;
        }
        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #2d6a4f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          font-size: 18px;
          font-weight: 800;
          color: #00643C;
          margin-top: 6px;
        }
        .content {
          flex: 1;
          background: white;
          border-radius: 32px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          padding: 28px 32px;
        }
        .content-title {
          font-size: 26px;
          font-weight: 700;
          color: #00643C;
          margin-bottom: 24px;
          border-bottom: 2px solid #eef2f6;
          padding-bottom: 12px;
        }
        .error-alert, .success-alert {
          padding: 14px 18px;
          border-radius: 28px;
          margin-bottom: 24px;
          font-size: 14px;
          font-weight: 500;
        }
        .error-alert {
          background: #fff5f5;
          border-left: 4px solid #e53e3e;
          color: #c53030;
        }
        .success-alert {
          background: #e8f5e9;
          border-left: 4px solid #2e7d32;
          color: #1b5e20;
        }
        .no-data {
          text-align: center;
          padding: 60px 20px;
          background: #fafcff;
          border-radius: 24px;
          border: 1.5px dashed #cbd5e1;
        }
        .no-data p:first-child {
          font-weight: 700;
          color: #00643C;
          margin-bottom: 8px;
        }
        .ofertas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .oferta-card {
          background: white;
          border-radius: 28px;
          border: 1px solid #edf2f7;
          overflow: hidden;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        .oferta-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.1);
        }
        .card-header {
          background: linear-gradient(145deg, #0F2B46 0%, #1A3A5C 100%);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }
        .card-title {
          font-weight: 700;
          font-size: 16px;
          margin: 0;
        }
        .card-badge {
          background: #FFD966;
          color: #0F2B46;
          padding: 4px 12px;
          border-radius: 40px;
          font-size: 12px;
          font-weight: 700;
        }
        .card-body {
          padding: 18px 20px;
          border-bottom: 1px solid #edf2f7;
        }
        .card-body p {
          margin: 8px 0;
          font-size: 13.5px;
          color: #334155;
        }
        .card-body strong {
          color: #0F2B46;
        }
        .card-footer {
          padding: 16px 20px;
          background: #fafcff;
        }
        .btn-excel {
          width: 100%;
          background: #00643C;
          color: white;
          border: none;
          border-radius: 40px;
          padding: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .btn-excel:hover:not(:disabled) {
          background: #004d2e;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(0, 100, 60, 0.25);
        }
        .btn-excel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #FFD966;
          color: #0F2B46;
          border: none;
          border-radius: 40px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: #f0bc1a;
          transform: translateY(-1px);
        }
        .nota-pequena {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          margin-top: 6px;
        }
        .ficha-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ficha-codigo {
          background: #e6f7e6;
          color: #2e7d32;
          padding: 4px 12px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 700;
        }
        @media (max-width: 768px) {
          .dashboard-main {
            flex-direction: column;
            padding: 20px;
          }
          .sidebar {
            width: 100%;
            position: static;
          }
          .content {
            padding: 20px;
          }
          .ofertas-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <img src="/logosena.png" alt="SENA" className="logo-sena" />
            <h1 className="header-title">Gestionytics - Funcionario</h1>
          </div>
          <div className="user-info">
            <span className="user-name">
              {user?.nombre}
              <span className="user-role">(Funcionario {tipoFuncionario === 'campesena' ? 'Campesena' : 'Regular'})</span>
            </span>
            <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>

        <div className="dashboard-main">
          <div className="sidebar">
            <h3 className="sidebar-title">Menú Funcionario</h3>
            <button
              onClick={() => setVistaActiva('ofertas')}
              className={`menu-btn ${vistaActiva === 'ofertas' ? 'menu-btn-active' : ''}`}
            >
              <span className="menu-icon">📋</span> Ofertas Aprobadas
            </button>
            <button
              onClick={() => setVistaActiva('historial')}
              className={`menu-btn ${vistaActiva === 'historial' ? 'menu-btn-active' : ''}`}
            >
              <span className="menu-icon">📊</span> Historial
            </button>
            <div className="info-card">
              <div className="info-label">Tipo de Funcionario</div>
              <div className="info-value">
                {tipoFuncionario === 'campesena' ? '🌾 Campesena' : '🎓 Regular'}
              </div>
            </div>
          </div>

          <div className="content">
            {error && <div className="error-alert">❌ {error}</div>}
            {success && <div className="success-alert">✅ {success}</div>}

            {vistaActiva === 'ofertas' && (
              <>
                <h2 className="content-title">📋 Ofertas Aprobadas</h2>
                {ofertas.length === 0 ? (
                  <div className="no-data">
                    <p>No hay ofertas aprobadas para ti</p>
                    <p>Espera a que el coordinador asigne ofertas</p>
                  </div>
                ) : (
                  <div className="ofertas-grid">
                    {ofertas.map((oferta) => (
                      <div key={oferta._id} className="oferta-card">
                        <div className="card-header">
                          <h3 className="card-title">{oferta.programa_formacion?.nombre_programa}</h3>
                          <span className="card-badge">{oferta.es_campesena ? 'Campesena' : 'Regular'}</span>
                        </div>
                        <div className="card-body">
                          <p><strong>Código:</strong> {oferta.programa_formacion?.codigo}</p>
                          <p><strong>Instructor:</strong> {oferta.creado_por?.nombre}</p>
                          <p><strong>Empresa:</strong> {oferta.empresa_solicitante?.nombre}</p>
                          <p><strong>Fechas:</strong> {new Date(oferta.fechas?.inicio).toLocaleDateString()} - {new Date(oferta.fechas?.fin).toLocaleDateString()}</p>
                          <p><strong>Cupos:</strong> {oferta.cupos_disponibles}/{oferta.cupo_maximo}</p>
                        </div>
                        <div className="card-footer">
                          {oferta.estado?.codigo === 'lista_espera' && (
                            <button
                              onClick={() => iniciarRevision(oferta._id)}
                              disabled={procesandoOfertaId === oferta._id}
                              className="btn-excel"
                              style={{ backgroundColor: '#3182CE' }}
                            >
                              {procesandoOfertaId === oferta._id ? 'Procesando...' : '📝 Iniciar revisión'}
                            </button>
                          )}

                          {oferta.estado?.codigo === 'ficha_proceso' && (
                            <>
                              <button
                                onClick={() => descargarExcelCompleto(oferta._id)}
                                disabled={descargandoExcel}
                                className="btn-excel"
                              >
                                {descargandoExcel ? '📥 Descargando...' : '📥 Descargar Excel Completo'}
                              </button>
                              <button
                                onClick={() => exportarDatosCompletos(oferta._id)}
                                disabled={descargandoInscritos}
                                className="btn-excel"
                                style={{ backgroundColor: '#FFD966', color: '#0F2B46', marginTop: '8px' }}
                              >
                                {descargandoInscritos ? '📊 Exportando...' : '📊 Exportar Inscritos'}
                              </button>
                              <button
                                onClick={() => finalizarMatricula(oferta._id)}
                                disabled={procesandoOfertaId === oferta._id}
                                className="btn-excel"
                                style={{ backgroundColor: '#2E7D32', marginTop: '8px' }}
                              >
                                {procesandoOfertaId === oferta._id ? 'Finalizando...' : '✅ Confirmar y notificar'}
                              </button>
                            </>
                          )}

                          {oferta.estado?.codigo === 'matriculados' && (
                            <div className="ficha-info">
                              <span className="ficha-codigo">Matrícula completada</span>
                              <button onClick={() => descargarExcelCompleto(oferta._id)} className="btn-secondary">
                                📥 Descargar Excel
                              </button>
                            </div>
                          )}

                          {!oferta.estado || (oferta.estado.codigo !== 'lista_espera' && oferta.estado.codigo !== 'ficha_proceso' && oferta.estado.codigo !== 'matriculados') && (
                            <div className="nota-pequena">Esperando aprobación del coordinador</div>
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
                <h2 className="content-title">📊 Historial de Fichas Creadas</h2>
                <div className="no-data">
                  <p>Próximamente...</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FuncionarioDashboard;