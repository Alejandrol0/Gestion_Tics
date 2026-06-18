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
  const [procesandoOfertaId, setProcesandoOfertaId] = useState(null);
  const [formData, setFormData] = useState({
    codigo_ficha: '',
    fecha_creacion: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  // Estados para el modal de inscritos
  const [mostrarModalInscritos, setMostrarModalInscritos] = useState(false);
  const [inscritosData, setInscritosData] = useState([]);
  const [cargandoInscritos, setCargandoInscritos] = useState(false);
  const [ofertaSeleccionadaInscritos, setOfertaSeleccionadaInscritos] = useState(null);

  // Estados para el modal de datos de la oferta
  const [mostrarModalDatosOferta, setMostrarModalDatosOferta] = useState(false);
  const [ofertaDatos, setOfertaDatos] = useState(null);

  // Estados para el modal de documentos
  const [mostrarModalDocumentos, setMostrarModalDocumentos] = useState(false);
  const [documentosData, setDocumentosData] = useState({ ficha: false, carta: false, excel: false, cedulas: false });
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
  const [ofertaDocumentos, setOfertaDocumentos] = useState(null);

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
      setError('Error al cargar las ofertas en gestión');
    } finally {
      setLoading(false);
    }
  };

  // Función para ver inscritos (abre modal)
  const handleVerInscritos = async (ofertaId) => {
    try {
      setCargandoInscritos(true);
      const oferta = ofertas.find(o => o._id === ofertaId);
      setOfertaSeleccionadaInscritos(oferta);
      const response = await api.get(`/inscripciones/oferta/${ofertaId}`);
      setInscritosData(response.data.data || []);
      setMostrarModalInscritos(true);
    } catch (error) {
      console.error('Error cargando inscritos:', error);
      setError('Error al cargar los inscritos');
    } finally {
      setCargandoInscritos(false);
    }
  };

  // Función para ver datos de la oferta (sin descargar)
  const handleVerDatosOferta = (oferta) => {
    setOfertaDatos(oferta);
    setMostrarModalDatosOferta(true);
  };

  // Función para ver documentos adjuntos (abre modal)
  const handleVerDocumentos = async (ofertaId) => {
    try {
      setCargandoDocumentos(true);
      const oferta = ofertas.find(o => o._id === ofertaId);
      setOfertaDocumentos(oferta);
      const response = await api.get(`/ofertas/${ofertaId}/archivos-solicitud`);
      setDocumentosData(response.data.data);
      setMostrarModalDocumentos(true);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      setError('No hay documentos disponibles para esta oferta o la solicitud aún no ha sido aprobada.');
    } finally {
      setCargandoDocumentos(false);
    }
  };

  const descargarArchivoDocumento = async (ofertaId, tipo) => {
    try {
      const response = await api.get(`/ofertas/${ofertaId}/descargar-archivo/${tipo}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Extraer extensión del Content-Disposition o usar .pdf/.xlsx por defecto
      const disposition = response.headers['content-disposition'];
      let filename = `${tipo}_${ofertaId}`;
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) filename = match[1].replace(/['"]/g, '');
      } else {
        // Asumir extensión por tipo (ajustar según lo que suban)
        if (tipo === 'excel') filename += '.xlsx';
        else filename += '.pdf';
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(`✅ ${tipo} descargado correctamente`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      setError(`Error al descargar ${tipo}`);
    }
  };

  // Función de descarga de Excel (se mantiene pero se usa en el modal como opción secundaria)
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

  // Calcular estadísticas
  const totalEnEspera = ofertas.filter(o => o.estado?.codigo === 'lista_espera').length;
  const totalEnProceso = ofertas.filter(o => o.estado?.codigo === 'ficha_proceso').length;
  const totalMatriculados = ofertas.filter(o => o.estado?.codigo === 'matriculados').length;

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
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#00643C',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p>Cargando ofertas en gestión...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
        .stats-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .stat-card {
          flex: 1;
          min-width: 160px;
          background: #f8fafc;
          border-radius: 20px;
          padding: 18px 20px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        .stat-number {
          font-size: 32px;
          font-weight: 800;
          color: #00643C;
          line-height: 1;
        }
        .stat-label {
          font-size: 13px;
          color: #5a6e7c;
          margin-top: 6px;
          font-weight: 500;
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
        .btn-ver-inscritos {
          width: 100%;
          background: #2b6cb0;
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
        .btn-ver-inscritos:hover:not(:disabled) {
          background: #1a4f7a;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(43, 108, 176, 0.3);
        }
        .btn-ver-inscritos:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-confirmar {
          width: 100%;
          background: #2e7d32;
          color: white;
          border: none;
          border-radius: 40px;
          padding: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .btn-confirmar:hover:not(:disabled) {
          background: #1b5e20;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(46, 125, 50, 0.3);
        }
        .btn-datos-oferta {
          width: 100%;
          background: #6b7280;
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
        .btn-datos-oferta:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(107, 114, 128, 0.3);
        }
        .btn-documentos {
          width: 100%;
          background: #8B5CF6;
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
        .btn-documentos:hover:not(:disabled) {
          background: #7C3AED;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(139, 92, 246, 0.3);
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
        .estado-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 40px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .estado-lista-espera {
          background: #fef3c7;
          color: #b7791f;
        }
        .estado-ficha-proceso {
          background: #ebf8ff;
          color: #2b6cb0;
        }
        .estado-matriculados {
          background: #e8f5e9;
          color: #2e7d32;
        }
        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-container {
          background: white;
          border-radius: 32px;
          max-width: 1000px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #eef2f6;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .modal-title {
          font-size: 22px;
          font-weight: 700;
          color: #00643C;
          margin: 0;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.2s;
        }
        .modal-close:hover {
          color: #dc2626;
        }
        .modal-body {
          overflow-x: auto;
        }
        .modal-body table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .modal-body th {
          background: #f8fafc;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #2d3748;
          border-bottom: 2px solid #e2e8f0;
        }
        .modal-body td {
          padding: 10px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #334155;
        }
        .modal-body tr:hover {
          background: #f8fafc;
        }
        .modal-empty {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }
        .btn-download-excel {
          background: transparent;
          border: 1px solid #cbd5e1;
          border-radius: 40px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 6px;
        }
        .btn-download-excel:hover {
          background: #f1f5f9;
          border-color: #00643C;
        }
        .datos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .datos-item {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .datos-item-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .datos-item-value {
          font-size: 14px;
          font-weight: 600;
          color: #0d1f2d;
          margin-top: 4px;
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
          .stats-row {
            flex-direction: column;
          }
          .modal-container {
            padding: 20px;
          }
          .datos-grid {
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
              <span className="menu-icon">📋</span> Ofertas en gestión
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
                <h2 className="content-title">📋 Ofertas en gestión</h2>

                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-number">{totalEnEspera}</div>
                    <div className="stat-label">En lista de espera</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{totalEnProceso}</div>
                    <div className="stat-label">En proceso de ficha</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{totalMatriculados}</div>
                    <div className="stat-label">Matriculados</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{ofertas.length}</div>
                    <div className="stat-label">Total asignadas</div>
                  </div>
                </div>

                {ofertas.length === 0 ? (
                  <div className="no-data">
                    <p>No hay ofertas en gestión</p>
                    <p>Espera a que el coordinador te asigne ofertas</p>
                  </div>
                ) : (
                  <div className="ofertas-grid">
                    {ofertas.map((oferta) => {
                      const estado = oferta.estado?.codigo || 'desconocido';
                      let estadoClass = '';
                      let estadoLabel = '';
                      if (estado === 'lista_espera') {
                        estadoClass = 'estado-lista-espera';
                        estadoLabel = 'Lista de espera';
                      } else if (estado === 'ficha_proceso') {
                        estadoClass = 'estado-ficha-proceso';
                        estadoLabel = 'Ficha en proceso';
                      } else if (estado === 'matriculados') {
                        estadoClass = 'estado-matriculados';
                        estadoLabel = 'Matriculados';
                      } else {
                        estadoLabel = estado;
                      }
                      return (
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
                            <p>
                              <span className={`estado-tag ${estadoClass}`}>{estadoLabel}</span>
                            </p>
                          </div>
                          <div className="card-footer">
                            {estado === 'lista_espera' && (
                              <button
                                onClick={() => iniciarRevision(oferta._id)}
                                disabled={procesandoOfertaId === oferta._id}
                                className="btn-excel"
                                style={{ backgroundColor: '#3182CE' }}
                              >
                                {procesandoOfertaId === oferta._id ? 'Procesando...' : '📝 Iniciar revisión'}
                              </button>
                            )}

                            {estado === 'ficha_proceso' && (
                              <>
                                <button
                                  onClick={() => handleVerInscritos(oferta._id)}
                                  disabled={cargandoInscritos}
                                  className="btn-ver-inscritos"
                                >
                                  {cargandoInscritos ? 'Cargando...' : '👥 Ver inscritos'}
                                </button>
                                <button
                                  onClick={() => handleVerDatosOferta(oferta)}
                                  className="btn-datos-oferta"
                                >
                                  📄 Ver datos de la oferta
                                </button>
                                <button
                                  onClick={() => handleVerDocumentos(oferta._id)}
                                  className="btn-documentos"
                                >
                                  📁 Ver documentos
                                </button>
                                <button
                                  onClick={() => finalizarMatricula(oferta._id)}
                                  disabled={procesandoOfertaId === oferta._id}
                                  className="btn-confirmar"
                                >
                                  {procesandoOfertaId === oferta._id ? 'Finalizando...' : '✅ Confirmar y notificar'}
                                </button>
                              </>
                            )}

                            {estado === 'matriculados' && (
                              <div className="ficha-info">
                                <span className="ficha-codigo">Matrícula completada</span>
                                <button onClick={() => handleVerInscritos(oferta._id)} className="btn-secondary" style={{ background: '#2b6cb0', color: 'white' }}>
                                  👥 Ver inscritos
                                </button>
                                <button onClick={() => handleVerDatosOferta(oferta)} className="btn-secondary" style={{ background: '#6b7280', color: 'white' }}>
                                  📄 Ver datos
                                </button>
                                <button onClick={() => handleVerDocumentos(oferta._id)} className="btn-secondary" style={{ background: '#8B5CF6', color: 'white' }}>
                                  📁 Ver documentos
                                </button>
                              </div>
                            )}

                            {estado !== 'lista_espera' && estado !== 'ficha_proceso' && estado !== 'matriculados' && (
                              <div className="nota-pequena">Estado: {estadoLabel}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {vistaActiva === 'historial' && (
              <>
                <h2 className="content-title">📊 Historial de Fichas Creadas</h2>
                <div className="no-data">
                  <p>Próximamente...</p>
                  <p>Aquí podrás ver el historial de todas las fichas que has creado.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de inscritos */}
      {mostrarModalInscritos && (
        <div className="modal-overlay" onClick={() => setMostrarModalInscritos(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                📋 Inscritos - {ofertaSeleccionadaInscritos?.programa_formacion?.nombre_programa || 'Oferta'}
              </h3>
              <button className="modal-close" onClick={() => setMostrarModalInscritos(false)}>✕</button>
            </div>
            <div className="modal-body">
              {inscritosData.length === 0 ? (
                <div className="modal-empty">No hay inscritos registrados para esta oferta.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Documento</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritosData.map((ins, idx) => (
                      <tr key={ins._id}>
                        <td>{idx + 1}</td>
                        <td>{ins.nombres} {ins.apellidos}</td>
                        <td>{ins.numero_documento}</td>
                        <td>{ins.telefono || '—'}</td>
                        <td>{ins.correo || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de datos de la oferta - TODOS LOS DATOS */}
      {mostrarModalDatosOferta && ofertaDatos && (
        <div className="modal-overlay" onClick={() => setMostrarModalDatosOferta(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                📄 Datos completos de la oferta - {ofertaDatos.programa_formacion?.nombre_programa || 'Oferta'}
              </h3>
              <button className="modal-close" onClick={() => setMostrarModalDatosOferta(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="datos-grid">
                {/* Programa */}
                <div className="datos-item">
                  <div className="datos-item-label">Código del programa</div>
                  <div className="datos-item-value">{ofertaDatos.programa_formacion?.codigo || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Nombre del programa</div>
                  <div className="datos-item-value">{ofertaDatos.programa_formacion?.nombre_programa || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Versión</div>
                  <div className="datos-item-value">{ofertaDatos.programa_formacion?.version || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Modalidad</div>
                  <div className="datos-item-value">{ofertaDatos.modalidad?.nombre || '—'}</div>
                </div>

                {/* Oferta */}
                <div className="datos-item">
                  <div className="datos-item-label">Tipo de oferta</div>
                  <div className="datos-item-value">{ofertaDatos.tipo_oferta?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Cupo máximo</div>
                  <div className="datos-item-value">{ofertaDatos.cupo_maximo}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Cupos disponibles</div>
                  <div className="datos-item-value">{ofertaDatos.cupos_disponibles}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Duración (meses)</div>
                  <div className="datos-item-value">{ofertaDatos.duracion_meses || '—'}</div>
                </div>

                {/* Fechas */}
                <div className="datos-item">
                  <div className="datos-item-label">Fecha inicio</div>
                  <div className="datos-item-value">{new Date(ofertaDatos.fechas?.inicio).toLocaleDateString()}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Fecha fin</div>
                  <div className="datos-item-value">{new Date(ofertaDatos.fechas?.fin).toLocaleDateString()}</div>
                </div>

                {/* Ubicación */}
                <div className="datos-item">
                  <div className="datos-item-label">Departamento</div>
                  <div className="datos-item-value">{ofertaDatos.ubicacion?.departamento || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Municipio</div>
                  <div className="datos-item-value">{ofertaDatos.ubicacion?.municipio?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Dirección</div>
                  <div className="datos-item-value">{ofertaDatos.ubicacion?.direccion || '—'}</div>
                </div>

                {/* Ambiente */}
                <div className="datos-item">
                  <div className="datos-item-label">Ambiente</div>
                  <div className="datos-item-value">{ofertaDatos.ambiente?.nombre || '—'}</div>
                </div>

                {/* Horario (solo si existe) */}
                {ofertaDatos.horario && (
                  <>
                    <div className="datos-item">
                      <div className="datos-item-label">Hora inicio</div>
                      <div className="datos-item-value">{ofertaDatos.horario?.hora_inicio || '—'}</div>
                    </div>
                    <div className="datos-item">
                      <div className="datos-item-label">Hora fin</div>
                      <div className="datos-item-value">{ofertaDatos.horario?.hora_fin || '—'}</div>
                    </div>
                    <div className="datos-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="datos-item-label">Días</div>
                      <div className="datos-item-value">{ofertaDatos.horario?.dias?.join(', ') || '—'}</div>
                    </div>
                  </>
                )}

                {/* Empresa */}
                <div className="datos-item">
                  <div className="datos-item-label">Empresa solicitante</div>
                  <div className="datos-item-value">{ofertaDatos.empresa_solicitante?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">NIT</div>
                  <div className="datos-item-value">{ofertaDatos.empresa_solicitante?.nit || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Tipo de empresa</div>
                  <div className="datos-item-value">{ofertaDatos.empresa_solicitante?.tipo_empresa || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">N° empleados</div>
                  <div className="datos-item-value">{ofertaDatos.empresa_solicitante?.numero_empleados || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Representante legal</div>
                  <div className="datos-item-value">{ofertaDatos.empresa_solicitante?.representante_legal?.nombre_completo || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Contacto en empresa</div>
                  <div className="datos-item-value">{ofertaDatos.empresa_solicitante?.contacto?.nombre_completo || '—'}</div>
                </div>

                {/* Instructor */}
                <div className="datos-item">
                  <div className="datos-item-label">Instructor</div>
                  <div className="datos-item-value">{ofertaDatos.creado_por?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Correo instructor</div>
                  <div className="datos-item-value">{ofertaDatos.creado_por?.correoElectronico || '—'}</div>
                </div>

                {/* Coordinador */}
                <div className="datos-item">
                  <div className="datos-item-label">Coordinador asignado</div>
                  <div className="datos-item-value">{ofertaDatos.coordinador_asignado?.nombre || '—'}</div>
                </div>

                {/* Programa especial */}
                <div className="datos-item">
                  <div className="datos-item-label">Programa especial</div>
                  <div className="datos-item-value">{ofertaDatos.programa_especial?.nombre || 'Ninguno'}</div>
                </div>

                {/* Convenio */}
                <div className="datos-item">
                  <div className="datos-item-label">Convenio</div>
                  <div className="datos-item-value">{ofertaDatos.convenio?.nombre || '—'}</div>
                </div>

                {/* Subsector */}
                <div className="datos-item">
                  <div className="datos-item-label">Subsector económico</div>
                  <div className="datos-item-value">{ofertaDatos.subsector_economico?.nombre || '—'}</div>
                </div>

                {/* Tipo de programa (Campesena/Regular) */}
                <div className="datos-item">
                  <div className="datos-item-label">Tipo de programa</div>
                  <div className="datos-item-value">{ofertaDatos.es_campesena ? 'Campesena' : 'Regular'}</div>
                </div>

                {/* Estado */}
                <div className="datos-item">
                  <div className="datos-item-label">Estado actual</div>
                  <div className="datos-item-value">{ofertaDatos.estado?.nombre || '—'}</div>
                </div>

                {/* Ficha Sofía (si existe) */}
                {ofertaDatos.ficha_sofia && (
                  <div className="datos-item" style={{ gridColumn: '1 / -1' }}>
                    <div className="datos-item-label">Ficha Sofía Plus</div>
                    <div className="datos-item-value">
                      Código: {ofertaDatos.ficha_sofia.codigo} - Creada: {new Date(ofertaDatos.ficha_sofia.fecha_creacion).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button
                  className="btn-download-excel"
                  onClick={() => descargarExcelCompleto(ofertaDatos._id)}
                  disabled={descargandoExcel}
                >
                  {descargandoExcel ? 'Descargando...' : '📥 Descargar Excel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de documentos adjuntos */}
      {mostrarModalDocumentos && ofertaDocumentos && (
        <div className="modal-overlay" onClick={() => setMostrarModalDocumentos(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                📎 Documentos adjuntos - {ofertaDocumentos.programa_formacion?.nombre_programa || 'Oferta'}
              </h3>
              <button className="modal-close" onClick={() => setMostrarModalDocumentos(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: '#334155' }}>
                Documentos subidos por el instructor durante la solicitud de validación.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { key: 'ficha', label: 'Ficha', icon: '📄' },
                  { key: 'carta', label: 'Carta', icon: '📋' },
                  { key: 'excel', label: 'Excel', icon: '📊' },
                  { key: 'cedulas', label: 'Cédulas PDF', icon: '📑' }
                ].map(doc => (
                  <button
                    key={doc.key}
                    onClick={() => descargarArchivoDocumento(ofertaDocumentos._id, doc.key)}
                    disabled={!documentosData[doc.key]}
                    style={{
                      padding: '16px',
                      borderRadius: '20px',
                      border: '1.5px solid',
                      borderColor: documentosData[doc.key] ? '#00643C' : '#e2e8f0',
                      background: documentosData[doc.key] ? '#f0fdf4' : '#f8fafc',
                      color: documentosData[doc.key] ? '#00643C' : '#94a3b8',
                      fontWeight: 700,
                      cursor: documentosData[doc.key] ? 'pointer' : 'not-allowed',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{doc.icon}</span>
                    {doc.label}
                    {documentosData[doc.key] && <span style={{ marginLeft: '8px' }}>✓</span>}
                  </button>
                ))}
              </div>
              {Object.values(documentosData).every(v => v === false) && (
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>
                  No hay documentos disponibles para esta oferta.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioDashboard;