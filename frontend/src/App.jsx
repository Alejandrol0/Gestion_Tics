import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CrearOferta from './components/CrearOferta';
import SolicitarOferta from './components/SolicitarOferta';
import LinksInscripcion from './components/LinksInscripcion';
import FormularioInscripcion from './components/FormularioInscripcion';
import { authService } from './services/api';
import Registro from './components/Registro';
import VerInscritos from './components/VerInscritos';
import MisInstructores from './components/MisInstructores';
import SolicitudesPendientes from './components/SolicitudesPendientes';
import MisOfertas from './components/MisOfertas';
import OfertasRechazadas from './components/OfertasRechazadas';
import FuncionarioDashboard from './components/FuncionarioDashboard';
import api from './services/api';

/* ─── SVG Icons ──────────────────────────────────────────────── */
const Icon = ({ d, size = 20, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  crear:      ['M12 5v14', 'M5 12h14'],
  misofertas: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  solicitar:  'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  links:      ['M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101', 'M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101'],
  inscritos:  ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  solicitudes:['M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],
  instructores:['M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197'],
  rechazadas: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  dashboard:  ['M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],
  logout:     ['M17 16l4-4m0 0l-4-4m4 4H7', 'M3 12a9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9 9 9 0 00-9 9z'],
  collapse:   'M11 19l-7-7 7-7m8 14l-7-7 7-7',
  expand:     'M13 5l7 7-7 7M5 5l7 7-7 7',
  user:       ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 11a4 4 0 100-8 4 4 0 000 8z'],
  chevron:    'M19 9l-7 7-7-7',
};

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, trend, color }) => (
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
      <div style={{ fontSize: 11, color: trend?.startsWith('↑') ? '#16a34a' : trend?.startsWith('↓') ? '#dc2626' : '#8a96a3', marginTop: 4, fontWeight: 500 }}>
        {trend} <span style={{ color: '#8a96a3', fontWeight: 400 }}>{sub}</span>
      </div>
    </div>
  </div>
);

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const getInitialSidebarState = () => {
    const saved = localStorage.getItem('sidebarExpanded');
    if (saved !== null) return saved === 'true';
    return false;
  };

  const [vistaActiva, setVistaActiva] = useState('crear');
  const [sidebarExpanded, setSidebarExpanded] = useState(getInitialSidebarState);
  const [isHovering, setIsHovering] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [stats, setStats] = useState({
    totalOfertas: 0,
    programasActivos: 0,
    totalInscritos: 0,
    validacionesPendientes: 0
  });
  const [cargandoStats, setCargandoStats] = useState(true);

  const user = authService.getCurrentUser();
  const userTipo = user?.tipo || 'instructor';

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', sidebarExpanded.toString());
  }, [sidebarExpanded]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargandoStats(true);
      const res = await api.get('/estadisticas/instructor');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargandoStats(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const menuInstructor = [
    { id: 'crear',      label: 'Crear Oferta',         icon: icons.crear },
    { id: 'misofertas', label: 'Mis Ofertas',           icon: icons.misofertas },
    { id: 'solicitar',  label: 'Solicitar Validación',  icon: icons.solicitar },
    { id: 'links',      label: 'Links de Inscripción',  icon: icons.links },
    { id: 'inscritos',  label: 'Ver Inscritos',         icon: icons.inscritos },
    { id: 'rechazadas', label: 'Ofertas Rechazadas',    icon: icons.rechazadas },
  ];

  const menuCoordinador = [
    { id: 'solicitudes',  label: 'Solicitudes',     icon: icons.solicitudes },
    { id: 'instructores', label: 'Mis Instructores', icon: icons.instructores },
  ];

  const menuItems = userTipo === 'coordinador' ? menuCoordinador : menuInstructor;

  const vistaLabels = {
    crear: 'Crear Oferta', misofertas: 'Mis Ofertas', solicitar: 'Solicitar Validación',
    links: 'Links de Inscripción', inscritos: 'Ver Inscritos', rechazadas: 'Ofertas Rechazadas',
    solicitudes: 'Solicitudes Pendientes', instructores: 'Mis Instructores',
  };

  const initials = ((user?.nombre?.[0] || '') + (user?.apellido?.[0] || '')).toUpperCase() || 'U';

  const isExpanded = !isMobile && (sidebarExpanded || isHovering);
  const isMobileVisible = isMobile && sidebarExpanded;

  return (
    <>
      <style>{`
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
        .gyt-sidebar.expanded {
          width: 240px;
        }
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
          padding: 20px 24px 0;
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
          .gyt-sidebar.mobile-visible {
            transform: translateX(0);
          }
          .gyt-sidebar.mobile-hidden {
            transform: translateX(-100%);
          }
          .gyt-sidebar-overlay.active { display: block; }
          .gyt-stats-bar { padding: 16px 16px 0; }
          .gyt-topbar { padding: 0 16px; }
        }

        @media (min-width: 769px) {
          .gyt-sidebar {
            transform: translateX(0) !important;
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
          className={`
            gyt-sidebar
            ${isExpanded ? 'expanded' : ''}
            ${isMobile ? (sidebarExpanded ? 'mobile-visible' : 'mobile-hidden') : ''}
          `}
          onMouseEnter={() => !isMobile && setIsHovering(true)}
          onMouseLeave={() => !isMobile && setIsHovering(false)}
        >
          <div className="gyt-sidebar-logo">
            <img src="/logosena.png" alt="SENA" />
            <span className="gyt-sidebar-brand">Gestionytics</span>
          </div>

          <nav className="gyt-nav">
            <button
              className={`gyt-nav-btn${vistaActiva === 'home' ? ' active' : ''}`}
              onClick={() => setVistaActiva('crear')}
              title="Dashboard"
            >
              <span className="nav-icon"><Icon d={icons.dashboard} size={18} /></span>
              <span className="nav-label">Dashboard</span>
            </button>

            <div style={{ height: 1, background: '#f0f2f5', margin: '8px 4px' }} />

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
            {userTipo === 'instructor' && user?.coordinadorAsignado?.nombre && (
              <div className="gyt-coord-card">
                <div className="gyt-coord-label">Coordinador asignado</div>
                <div className="gyt-coord-name">{user.coordinadorAsignado.nombre}</div>
              </div>
            )}
            {userTipo === 'coordinador' && (
              <div className="gyt-coord-card">
                <div className="gyt-coord-label">Bienvenido</div>
                <div className="gyt-coord-name">{user?.nombre} {user?.apellido}</div>
              </div>
            )}
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
                  <div className="gyt-user-role" style={{ textTransform: 'capitalize' }}>{userTipo}</div>
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
            {(vistaActiva === 'crear' || vistaActiva === 'solicitudes') && userTipo === 'instructor' && (
              <div className="gyt-stats-bar">
                <StatCard
                  icon={icons.misofertas}
                  label="Ofertas creadas"
                  value={cargandoStats ? '...' : stats.totalOfertas}
                  sub="Este año"
                  trend=""
                  color="#00643C"
                />
                <StatCard
                  icon={icons.solicitar}
                  label="Programas activos"
                  value={cargandoStats ? '...' : stats.programasActivos}
                  sub="Matriculados"
                  trend=""
                  color="#2563eb"
                />
                <StatCard
                  icon={icons.inscritos}
                  label="Aprendices inscritos"
                  value={cargandoStats ? '...' : stats.totalInscritos}
                  sub="Total inscritos"
                  trend=""
                  color="#7c3aed"
                />
                <StatCard
                  icon={icons.links}
                  label="Validaciones pendientes"
                  value={cargandoStats ? '...' : stats.validacionesPendientes}
                  sub="Pendientes"
                  trend=""
                  color="#d97706"
                />
              </div>
            )}

            {(vistaActiva === 'crear' || vistaActiva === 'solicitudes') && userTipo === 'coordinador' && (
              <div className="gyt-stats-bar">
                <StatCard
                  icon={icons.solicitudes}
                  label="Solicitudes pendientes"
                  value="—"
                  sub="Por revisar"
                  trend=""
                  color="#d97706"
                />
                <StatCard
                  icon={icons.instructores}
                  label="Mis instructores"
                  value="—"
                  sub="Asignados"
                  trend=""
                  color="#00643C"
                />
              </div>
            )}

            <div className="gyt-content">
              {userTipo === 'instructor' && (
                <>
                  {vistaActiva === 'crear'      && <CrearOferta />}
                  {vistaActiva === 'misofertas' && <MisOfertas />}
                  {vistaActiva === 'solicitar'  && <SolicitarOferta />}
                  {vistaActiva === 'links'      && <LinksInscripcion />}
                  {vistaActiva === 'inscritos'  && <VerInscritos />}
                  {vistaActiva === 'rechazadas' && <OfertasRechazadas />}
                </>
              )}
              {userTipo === 'coordinador' && (
                <>
                  {vistaActiva === 'solicitudes'  && <SolicitudesPendientes />}
                  {vistaActiva === 'instructores' && <MisInstructores />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Protected Route ────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" />;
  return children;
};

/* ─── App ────────────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/inscribirse/:codigo" element={<FormularioInscripcion />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/funcionario" element={<ProtectedRoute><FuncionarioDashboard /></ProtectedRoute>} />
        <Route path="/"  element={<Navigate to="/login" />} />
        <Route path="*"  element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;