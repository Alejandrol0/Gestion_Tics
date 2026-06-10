import React, { useState } from 'react';
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
import FuncionarioDashboard from './components/FuncionarioDashboard'; // ✅ IMPORTADO

// Dashboard con dos columnas
const Dashboard = () => {
  const [vistaActiva, setVistaActiva] = useState('crear');
  const user = authService.getCurrentUser();
  const userTipo = user?.tipo || 'instructor';
  
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

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
          <h1 style={styles.headerTitle}>Gestionytics - Panel de Control</h1>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            {user?.nombre} {user?.apellido} 
            <span style={styles.userRol}> ({userTipo})</span>
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenedor de dos columnas */}
      <div style={styles.mainContainer}>
        {/* Columna Izquierda - Menú */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Menú Principal</h3>
          </div>
          
          {/* ===== MENÚ PARA INSTRUCTORES ===== */}
          {userTipo === 'instructor' && (
            <>
              <button 
                onClick={() => setVistaActiva('crear')}
                style={{
                  ...styles.menuButton,
                  ...(vistaActiva === 'crear' ? styles.menuButtonActive : {})
                }}
              >
                <span style={styles.menuIcon}>➕</span>
                Crear Oferta
              </button>
              
              <button 
                onClick={() => setVistaActiva('misofertas')}
                style={{
                  ...styles.menuButton,
                  ...(vistaActiva === 'misofertas' ? styles.menuButtonActive : {})
                }}
              >
                <span style={styles.menuIcon}>📋</span>
                Mis Ofertas
              </button>
              
              <button 
                onClick={() => setVistaActiva('solicitar')}
                style={{
                  ...styles.menuButton,
                  ...(vistaActiva === 'solicitar' ? styles.menuButtonActive : {})
                }}
              >
                <span style={styles.menuIcon}>📝</span>
                Solicitar Validación
              </button>

              <button 
                onClick={() => setVistaActiva('links')}
                style={{
                  ...styles.menuButton,
                  ...(vistaActiva === 'links' ? styles.menuButtonActive : {})
                }}
              >
                <span style={styles.menuIcon}>🔗</span>
                Links de Inscripción
              </button>
              
              <button 
                onClick={() => setVistaActiva('inscritos')}
                style={{
                  ...styles.menuButton,
                  ...(vistaActiva === 'inscritos' ? styles.menuButtonActive : {})
                }}
              >
                <span style={styles.menuIcon}>👥</span>
                Ver Inscritos
              </button>

              <div style={styles.coordinadorInfo}>
                <p style={styles.coordinadorLabel}>Coordinador Asignado:</p>
                <p style={styles.coordinadorNombre}>{user?.coordinadorAsignado?.nombre}</p>
              </div>
            </>
          )}

          {/* ===== MENÚ PARA COORDINADORES ===== */}
          {userTipo === 'coordinador' && (
            <>
              <button 
                onClick={() => setVistaActiva('solicitudes')}
                style={{
                  ...styles.menuButton,
                  ...(vistaActiva === 'solicitudes' ? styles.menuButtonActive : {})
                }}
              >
                <span style={styles.menuIcon}>✅</span>
                Solicitudes de Validación
              </button>
              
              <button 
                onClick={() => setVistaActiva('instructores')}
                style={{
                  ...styles.menuButton,
                  ...(vistaActiva === 'instructores' ? styles.menuButtonActive : {})
                }}
              >
                <span style={styles.menuIcon}>👥</span>
                Mis Instructores
              </button>

              <div style={styles.coordinadorInfo}>
                <p style={styles.coordinadorLabel}>Bienvenido Coordinador:</p>
                <p style={styles.coordinadorNombre}>{user?.nombre}</p>
              </div>
            </>
          )}
        </div>

        {/* Columna Derecha - Contenido */}
        <div style={styles.content}>
          {/* ===== CONTENIDO PARA INSTRUCTORES ===== */}
          {userTipo === 'instructor' && (
            <>
              {vistaActiva === 'crear' && <CrearOferta />}
              {vistaActiva === 'misofertas' && <MisOfertas />}
              {vistaActiva === 'solicitar' && <SolicitarOferta />}
              {vistaActiva === 'links' && <LinksInscripcion />}
              {vistaActiva === 'inscritos' && <VerInscritos />}
            </>
          )}
          
          {/* ===== CONTENIDO PARA COORDINADORES ===== */}
          {userTipo === 'coordinador' && (
            <>
              {vistaActiva === 'solicitudes' && <SolicitudesPendientes />}
              {vistaActiva === 'instructores' && <MisInstructores />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Estilos con paleta de colores SENA
const styles = {
  // ... (estilos existentes) ...
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
    marginLeft: '5px',
    textTransform: 'capitalize'
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
  coordinadorInfo: {
    marginTop: 'auto',
    padding: '20px',
    backgroundColor: '#f0f8f4',
    borderRadius: '8px',
    border: '1px solid #00643C',
    borderLeft: '4px solid #00643C'
  },
  coordinadorLabel: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  coordinadorNombre: {
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
  }
};

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/inscribirse/:codigo" element={<FormularioInscripcion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* ✅ NUEVA RUTA PARA FUNCIONARIOS */}
        <Route 
          path="/funcionario" 
          element={
            <ProtectedRoute>
              <FuncionarioDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;