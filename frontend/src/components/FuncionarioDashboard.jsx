import React, { useState, useEffect } from 'react';
import api from '../services/api';

/* ─── SVG Icons (mismos que en App.jsx) ────────────────────── */
const Icon = ({ d, size = 20, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  ofertas:   'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  historial: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  logout:    ['M17 16l4-4m0 0l-4-4m4 4H7', 'M3 12a9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9 9 9 0 00-9 9z'],
  collapse:  'M11 19l-7-7 7-7m8 14l-7-7 7-7',
  expand:    'M13 5l7 7-7 7M5 5l7 7-7 7',
  user:      ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 11a4 4 0 100-8 4 4 0 000 8z'],
  chevron:   'M19 9l-7 7-7-7',
  dashboard: ['M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],
  inscritos: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z'],
  documentos:'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  info:      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  ojo:       'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
};

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e8edf2',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    flex: '1 1 180px',
    minWidth: 0,
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color,
    }}>
      <Icon d={icon} size={18} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: '#8a96a3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#0d1f2d', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8a96a3', marginTop: 4, fontWeight: 500 }}>{sub}</div>
    </div>
  </div>
);

const FuncionarioDashboard = () => {
  // ─── Estados de UI ──────────────────────────────────────────
  const getInitialSidebarState = () => {
    const saved = localStorage.getItem('funcionarioSidebarExpanded');
    if (saved !== null) return saved === 'true';
    return false;
  };

  const [vistaActiva, setVistaActiva] = useState('ofertas');
  const [sidebarExpanded, setSidebarExpanded] = useState(getInitialSidebarState);
  const [isHovering, setIsHovering] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ─── Estados de datos ──────────────────────────────────────
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [procesandoOfertaId, setProcesandoOfertaId] = useState(null);

  // Modal inscritos
  const [mostrarModalInscritos, setMostrarModalInscritos] = useState(false);
  const [inscritosData, setInscritosData] = useState([]);
  const [cargandoInscritos, setCargandoInscritos] = useState(false);
  const [ofertaSeleccionadaInscritos, setOfertaSeleccionadaInscritos] = useState(null);

  // Modal datos de la oferta
  const [mostrarModalDatosOferta, setMostrarModalDatosOferta] = useState(false);
  const [ofertaDatos, setOfertaDatos] = useState(null);
  const [descargandoExcel, setDescargandoExcel] = useState(false);

  // Modal documentos
  const [mostrarModalDocumentos, setMostrarModalDocumentos] = useState(false);
  const [documentosData, setDocumentosData] = useState({ ficha: false, carta: false, excel: false, cedulas: false });
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
  const [ofertaDocumentos, setOfertaDocumentos] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const tipoFuncionario = user.tipo_funcionario || 'regular';

  // ─── Efectos ──────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('funcionarioSidebarExpanded', sidebarExpanded.toString());
  }, [sidebarExpanded]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarOfertasAprobadas();
  }, []);

  // ─── Funciones de datos ───────────────────────────────────
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

  const handleVerDatosOferta = (oferta) => {
    setOfertaDatos(oferta);
    setMostrarModalDatosOferta(true);
  };

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
      const disposition = response.headers['content-disposition'];
      let filename = `${tipo}_${ofertaId}`;
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) filename = match[1].replace(/['"]/g, '');
      } else {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // ─── Estadísticas ─────────────────────────────────────────
  const totalEnEspera = ofertas.filter(o => o.estado?.codigo === 'lista_espera').length;
  const totalEnProceso = ofertas.filter(o => o.estado?.codigo === 'ficha_proceso').length;
  const totalMatriculados = ofertas.filter(o => o.estado?.codigo === 'matriculados').length;

  // ─── UI ────────────────────────────────────────────────────
  const initials = ((user?.nombre?.[0] || '') + (user?.apellido?.[0] || '')).toUpperCase() || 'F';

  const isExpanded = !isMobile && (sidebarExpanded || isHovering);
  const isMobileVisible = isMobile && sidebarExpanded;

  const vistaLabels = {
    ofertas: 'Ofertas en gestión',
    historial: 'Historial',
  };

  const menuItems = [
    { id: 'ofertas', label: 'Ofertas en gestión', icon: icons.ofertas },
    { id: 'historial', label: 'Historial', icon: icons.historial },
  ];

  if (loading && !mostrarModalInscritos && !mostrarModalDatosOferta && !mostrarModalDocumentos) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        color: '#00643C'
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
        * { box-sizing: border-box; }
        body { margin: 0; }
        .gyt-root {
          display: flex;
          height: 100vh;
          background: #f0f2f5;
          font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
          overflow: hidden;
          position: relative;
        }
        .gyt-sidebar {
          width: 60px;
          background: #fff;
          border-right: 1px solid #e8edf2;
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
          overflow: hidden;
          z-index: 10;
          height: 100vh;
          position: relative;
        }
        .gyt-sidebar.expanded { width: 240px; }
        .gyt-sidebar.mobile-hidden {
          transform: translateX(-100%);
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          z-index: 50;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .gyt-sidebar.mobile-visible {
          transform: translateX(0);
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          z-index: 50;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .gyt-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 16px 16px;
          border-bottom: 1px solid #f0f2f5;
          min-height: 64px;
          white-space: nowrap;
        }
        .gyt-sidebar-logo img {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          object-fit: contain;
        }
        .gyt-sidebar-brand {
          font-size: 15px;
          font-weight: 700;
          color: #00643C;
          opacity: 0;
          transition: opacity 0.2s ease;
          overflow: hidden;
        }
        .gyt-sidebar.expanded .gyt-sidebar-brand,
        .gyt-sidebar.mobile-visible .gyt-sidebar-brand {
          opacity: 1;
        }
        .gyt-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .gyt-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #5a6472;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
          width: 100%;
          overflow: hidden;
        }
        .gyt-nav-btn:hover { background: #f0f7f3; color: #00643C; }
        .gyt-nav-btn.active { background: #e8f5ee; color: #00643C; font-weight: 600; }
        .gyt-nav-btn .nav-icon { flex-shrink: 0; }
        .gyt-nav-btn .nav-label {
          opacity: 0;
          transition: opacity 0.2s;
          overflow: hidden;
        }
        .gyt-sidebar.expanded .gyt-nav-btn .nav-label,
        .gyt-sidebar.mobile-visible .gyt-nav-btn .nav-label {
          opacity: 1;
        }
        .gyt-sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid #f0f2f5;
        }
        .gyt-coord-card {
          background: #f6faf8;
          border: 1px solid #d1ead9;
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 8px;
          transition: opacity 0.2s;
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          padding: 0 12px;
        }
        .gyt-sidebar.expanded .gyt-coord-card,
        .gyt-sidebar.mobile-visible .gyt-coord-card {
          opacity: 1;
          max-height: 80px;
          padding: 10px 12px;
        }
        .gyt-coord-label { font-size: 10px; color: #8a96a3; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .gyt-coord-name { font-size: 12.5px; font-weight: 700; color: #00643C; margin-top: 3px; }
        .gyt-collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #8a96a3;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .gyt-collapse-btn:hover { background: #f0f2f5; color: #5a6472; }
        .gyt-collapse-label {
          opacity: 0;
          transition: opacity 0.2s;
          overflow: hidden;
        }
        .gyt-sidebar.expanded .gyt-collapse-label,
        .gyt-sidebar.mobile-visible .gyt-collapse-label {
          opacity: 1;
        }
        .gyt-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
        .gyt-topbar {
          height: 64px;
          background: #fff;
          border-bottom: 1px solid #e8edf2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
        }
        .gyt-topbar-left { display: flex; align-items: center; gap: 8px; }
        .gyt-hamburger {
          background: none;
          border: none;
          color: #0d1f2d;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gyt-hamburger:hover { background: #f0f2f5; }
        .gyt-topbar-title { font-size: 16px; font-weight: 600; color: #0d1f2d; }
        .gyt-topbar-sep { color: #cbd5e0; font-size: 18px; }
        .gyt-topbar-sub { font-size: 14px; color: #8a96a3; font-weight: 400; }
        .gyt-topbar-right { display: flex; align-items: center; gap: 12px; position: relative; }
        .gyt-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f6faf8;
          border: 1px solid #d1ead9;
          border-radius: 40px;
          padding: 5px 12px 5px 5px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .gyt-user-btn:hover { background: #e8f5ee; }
        .gyt-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #00643C;
          color: #FFD966;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .gyt-user-name { font-size: 13px; font-weight: 600; color: #0d1f2d; }
        .gyt-user-role { font-size: 11px; color: #8a96a3; }
        .gyt-user-chevron { color: #8a96a3; transition: transform 0.15s; }
        .gyt-user-chevron.open { transform: rotate(180deg); }
        .gyt-user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #fff;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          padding: 6px;
          min-width: 180px;
          z-index: 100;
        }
        .gyt-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          color: #5a6472;
          cursor: pointer;
          transition: background 0.12s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .gyt-dropdown-item:hover { background: #f0f2f5; color: #0d1f2d; }
        .gyt-dropdown-item.danger:hover { background: #fff5f5; color: #dc2626; }
        .gyt-content-wrap { flex: 1; overflow-y: auto; }
        .gyt-stats-bar {
          display: flex;
          gap: 14px;
          padding: 28px 24px 12px;
          flex-wrap: wrap;
        }
        .gyt-content { padding: 0; }
        .gyt-sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 40;
        }
        .gyt-sidebar-overlay.active { display: block; }
        @media (max-width: 768px) {
          .gyt-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 260px;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .gyt-sidebar.mobile-visible { transform: translateX(0); }
          .gyt-sidebar.mobile-hidden { transform: translateX(-100%); }
          .gyt-sidebar-overlay.active { display: block; }
          .gyt-stats-bar { padding: 20px 16px 8px; }
          .gyt-topbar { padding: 0 16px; }
        }
        @media (min-width: 769px) {
          .gyt-sidebar { transform: translateX(0) !important; }
        }
        /* Estilos propios del contenido */
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
          margin: 24px;
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
          padding: 8px 24px 24px;
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
          background: linear-gradient(145deg, #00643C 0%, #004d2e 100%);
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
        /* Botones verdes */
        .btn-primary {
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
        .btn-primary:hover:not(:disabled) {
          background: #004d2e;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(0, 100, 60, 0.25);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          width: 100%;
          background: #e8f5ee;
          color: #00643C;
          border: 1.5px solid #00643C;
          border-radius: 40px;
          padding: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #d1ead9;
          transform: translateY(-1px);
        }
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-gris {
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
        .btn-gris:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
        }
        .btn-morado {
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
        .btn-morado:hover:not(:disabled) {
          background: #7C3AED;
          transform: translateY(-1px);
        }
        .btn-ver-inscritos {
          width: 100%;
          background: #2563eb;
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
          background: #1d4ed8;
          transform: translateY(-1px);
        }
        .ficha-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }
        .ficha-info .btn-secondary,
        .ficha-info .btn-gris,
        .ficha-info .btn-morado {
          width: auto;
          margin-bottom: 0;
          padding: 6px 14px;
          font-size: 12px;
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
          background: #d1fae5;
          color: #065f46;
        }
        .estado-matriculados {
          background: #a7f3d0;
          color: #064e3b;
        }
        /* Modales */
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
        .modal-close:hover { color: #dc2626; }
        .modal-body { overflow-x: auto; }
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
        .modal-body tr:hover { background: #f8fafc; }
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
          color: #00643C;
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
        .nota-pequena {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          margin-top: 6px;
        }
        @media (max-width: 768px) {
          .ofertas-grid { grid-template-columns: 1fr; padding: 8px 16px 16px; }
          .datos-grid { grid-template-columns: 1fr; }
          .modal-container { padding: 20px; }
          .ficha-info .btn-secondary,
          .ficha-info .btn-gris,
          .ficha-info .btn-morado {
            width: 100%;
            margin-bottom: 6px;
          }
        }
      `}</style>

      <div className="gyt-root">
        {isMobile && (
          <div
            className={`gyt-sidebar-overlay${sidebarExpanded ? ' active' : ''}`}
            onClick={() => setSidebarExpanded(false)}
          />
        )}

        <aside
          className={`gyt-sidebar ${isExpanded ? 'expanded' : ''} ${isMobile ? (sidebarExpanded ? 'mobile-visible' : 'mobile-hidden') : ''}`}
          onMouseEnter={() => !isMobile && setIsHovering(true)}
          onMouseLeave={() => !isMobile && setIsHovering(false)}
        >
          <div className="gyt-sidebar-logo">
            <img src="/logosena.png" alt="SENA" />
            <span className="gyt-sidebar-brand">Gestionytics</span>
          </div>

          <nav className="gyt-nav">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`gyt-nav-btn${vistaActiva === item.id ? ' active' : ''}`}
                onClick={() => setVistaActiva(item.id)}
                title={item.label}
              >
                <span className="nav-icon"><Icon d={item.icon} size={18} /></span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="gyt-sidebar-footer">
            <div className="gyt-coord-card">
              <div className="gyt-coord-label">Tipo de funcionario</div>
              <div className="gyt-coord-name">{tipoFuncionario === 'campesena' ? '🌾 Campesena' : '🎓 Regular'}</div>
            </div>
            {!isMobile && (
              <button
                className="gyt-collapse-btn"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                title={sidebarExpanded ? 'Colapsar' : 'Expandir'}
              >
                <Icon d={sidebarExpanded ? icons.collapse : icons.expand} size={16} />
                <span className="gyt-collapse-label">{sidebarExpanded ? 'Colapsar' : 'Expandir'}</span>
              </button>
            )}
          </div>
        </aside>

        <div className="gyt-main">
          <header className="gyt-topbar">
            <div className="gyt-topbar-left">
              {isMobile && (
                <button className="gyt-hamburger" onClick={() => setSidebarExpanded(!sidebarExpanded)} aria-label="Toggle menu">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {sidebarExpanded ? (
                      <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    )}
                  </svg>
                </button>
              )}
              <span className="gyt-topbar-title">Gestionytics</span>
              <span className="gyt-topbar-sep">/</span>
              <span className="gyt-topbar-sub">{vistaLabels[vistaActiva] || 'Dashboard'}</span>
            </div>

            <div className="gyt-topbar-right">
              <button
                className="gyt-user-btn"
                onClick={() => setUserMenuOpen(v => !v)}
              >
                <div className="gyt-avatar">{initials}</div>
                <div>
                  <div className="gyt-user-name">{user?.nombre} {user?.apellido}</div>
                  <div className="gyt-user-role" style={{ textTransform: 'capitalize' }}>Funcionario</div>
                </div>
                <span className={`gyt-user-chevron${userMenuOpen ? ' open' : ''}`}>
                  <Icon d={icons.chevron} size={14} />
                </span>
              </button>

              {userMenuOpen && (
                <div className="gyt-user-dropdown">
                  <button className="gyt-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <Icon d={icons.user} size={15} /> Mi perfil
                  </button>
                  <div style={{ height: 1, background: '#f0f2f5', margin: '4px 0' }} />
                  <button className="gyt-dropdown-item danger" onClick={handleLogout}>
                    <Icon d={icons.logout} size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="gyt-content-wrap">
            {/* Estadísticas */}
            {vistaActiva === 'ofertas' && (
              <div className="gyt-stats-bar">
                <StatCard
                  icon={icons.ofertas}
                  label="En lista de espera"
                  value={totalEnEspera}
                  sub="Pendientes de revisión"
                  color="#00643C"
                />
                <StatCard
                  icon={icons.dashboard}
                  label="En proceso de ficha"
                  value={totalEnProceso}
                  sub="Creación de ficha"
                  color="#2d6a4f"
                />
                <StatCard
                  icon={icons.inscritos}
                  label="Matriculados"
                  value={totalMatriculados}
                  sub="Finalizados"
                  color="#2e7d32"
                />
                <StatCard
                  icon={icons.ofertas}
                  label="Total asignadas"
                  value={ofertas.length}
                  sub="Ofertas en gestión"
                  color="#004d2e"
                />
              </div>
            )}

            <div className="gyt-content">
              {error && <div className="error-alert">❌ {error}</div>}
              {success && <div className="success-alert">✅ {success}</div>}

              {vistaActiva === 'ofertas' && (
                <>
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
                              <p><span className={`estado-tag ${estadoClass}`}>{estadoLabel}</span></p>
                            </div>
                            <div className="card-footer">
                              {estado === 'lista_espera' && (
                                <button
                                  onClick={() => iniciarRevision(oferta._id)}
                                  disabled={procesandoOfertaId === oferta._id}
                                  className="btn-primary"
                                >
                                  {procesandoOfertaId === oferta._id ? 'Procesando...' : '📝 Iniciar revisión'}
                                </button>
                              )}

                              {estado === 'ficha_proceso' && (
                                <>
                                  <button
                                    onClick={() => handleVerInscritos(oferta._id)}
                                    disabled={cargandoInscritos}
                                    className="btn-secondary"
                                  >
                                    {cargandoInscritos ? 'Cargando...' : '👥 Ver inscritos'}
                                  </button>
                                  <button
                                    onClick={() => handleVerDatosOferta(oferta)}
                                    className="btn-gris"
                                  >
                                    📄 Ver datos de la oferta
                                  </button>
                                  <button
                                    onClick={() => handleVerDocumentos(oferta._id)}
                                    className="btn-morado"
                                  >
                                    📁 Ver documentos
                                  </button>
                                  <button
                                    onClick={() => finalizarMatricula(oferta._id)}
                                    disabled={procesandoOfertaId === oferta._id}
                                    className="btn-primary"
                                  >
                                    {procesandoOfertaId === oferta._id ? 'Finalizando...' : '✅ Confirmar y notificar'}
                                  </button>
                                </>
                              )}

                              {estado === 'matriculados' && (
                                <div className="ficha-info">
                                  <span className="ficha-codigo">Matrícula completada</span>
                                  <button onClick={() => handleVerInscritos(oferta._id)} className="btn-secondary" style={{ width: 'auto', marginBottom: 0 }}>
                                    👥 Ver inscritos
                                  </button>
                                  <button onClick={() => handleVerDatosOferta(oferta)} className="btn-gris" style={{ width: 'auto', marginBottom: 0 }}>
                                    📄 Ver datos
                                  </button>
                                  <button onClick={() => handleVerDocumentos(oferta._id)} className="btn-morado" style={{ width: 'auto', marginBottom: 0 }}>
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
                <div className="no-data">
                  <p>📊 Historial de Fichas Creadas</p>
                  <p>Próximamente podrás ver el historial de todas las fichas que has creado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODALES ──────────────────────────────────────────── */}

      {/* Modal inscritos */}
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

      {/* Modal datos de la oferta */}
      {mostrarModalDatosOferta && ofertaDatos && (
        <div className="modal-overlay" onClick={() => setMostrarModalDatosOferta(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                📄 Datos completos - {ofertaDatos.programa_formacion?.nombre_programa || 'Oferta'}
              </h3>
              <button className="modal-close" onClick={() => setMostrarModalDatosOferta(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="datos-grid">
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
                <div className="datos-item">
                  <div className="datos-item-label">Fecha inicio</div>
                  <div className="datos-item-value">{new Date(ofertaDatos.fechas?.inicio).toLocaleDateString()}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Fecha fin</div>
                  <div className="datos-item-value">{new Date(ofertaDatos.fechas?.fin).toLocaleDateString()}</div>
                </div>
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
                <div className="datos-item">
                  <div className="datos-item-label">Ambiente</div>
                  <div className="datos-item-value">{ofertaDatos.ambiente?.nombre || '—'}</div>
                </div>
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
                <div className="datos-item">
                  <div className="datos-item-label">Instructor</div>
                  <div className="datos-item-value">{ofertaDatos.creado_por?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Correo instructor</div>
                  <div className="datos-item-value">{ofertaDatos.creado_por?.correoElectronico || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Coordinador asignado</div>
                  <div className="datos-item-value">{ofertaDatos.coordinador_asignado?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Programa especial</div>
                  <div className="datos-item-value">{ofertaDatos.programa_especial?.nombre || 'Ninguno'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Convenio</div>
                  <div className="datos-item-value">{ofertaDatos.convenio?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Subsector económico</div>
                  <div className="datos-item-value">{ofertaDatos.subsector_economico?.nombre || '—'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Tipo de programa</div>
                  <div className="datos-item-value">{ofertaDatos.es_campesena ? 'Campesena' : 'Regular'}</div>
                </div>
                <div className="datos-item">
                  <div className="datos-item-label">Estado actual</div>
                  <div className="datos-item-value">{ofertaDatos.estado?.nombre || '—'}</div>
                </div>
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

      {/* Modal documentos */}
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