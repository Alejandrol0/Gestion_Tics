import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ correoElectronico: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(formData.correoElectronico, formData.password);
      if (response.user.tipo === 'funcionario') navigate('/funcionario');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Panel izquierdo — decorativo sin logo */}
      <div style={styles.panel}>
        <div style={styles.panelInner}>
          <div style={styles.brandRow}>
            <span style={styles.brandName}>SENA</span>
          </div>
          <p style={styles.panelTagline}>
            Gestión inteligente de ofertas de formación
          </p>
          <div style={styles.panelStats}>
            {[
              { icon: "📋", label: "Ofertas", value: "Administradas" },
              { icon: "👥", label: "Inscritos", value: "Registrados" },
              { icon: "👨‍🏫", label: "Instructores", value: "Activos" }
            ].map(stat => (
              <div key={stat.label} style={styles.statCard}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statContent}>
                  <span style={styles.statLabel}>{stat.label}</span>
                  <span style={styles.statValue}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario de login */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>
          <div style={styles.mobileLogoRow}>
            <img src="/logosena.png" alt="Logo SENA" style={styles.mobileLogo} />
            <span style={styles.mobileBrandName}>SENA</span>
          </div>

          <h1 style={styles.heading}>Bienvenido de nuevo</h1>
          <p style={styles.subheading}>Ingresa con tu cuenta para continuar</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                type="email"
                name="correoElectronico"
                value={formData.correoElectronico}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="usuario@sena.edu.co"
                autoComplete="email"
              />
            </div>

            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Contraseña</label>
                <Link to="/recuperar-password" style={styles.forgotLink}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
            >
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p style={styles.registerHint}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={styles.registerLink}>Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  // Panel izquierdo (fondo verde institucional, sin logo)
  panel: {
    flex: '0 0 440px',
    background: 'linear-gradient(145deg, #00643C 0%, #004d2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  panelInner: {
    maxWidth: '320px',
    width: '100%',
  },
  brandRow: {
    marginBottom: '40px',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: '36px',
    fontWeight: '800',
    letterSpacing: '-1px',
    textAlign: 'center',
    display: 'block',
  },
  panelTagline: {
    color: '#E0F2E9',
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '48px',
    fontWeight: '400',
    textAlign: 'center',
  },
  panelStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backdropFilter: 'blur(4px)',
    transition: 'transform 0.2s ease, background 0.2s ease',
    cursor: 'default',
    ':hover': {
      background: 'rgba(255,255,255,0.15)',
      transform: 'translateX(4px)',
    },
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  statLabel: {
    color: '#D1F2E6',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  statValue: {
    color: '#FFD966',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
  },
  // Panel derecho (formulario)
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F7F8FA',
    padding: '32px 24px',
  },
  formCard: {
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
  },
  mobileLogoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  mobileLogo: {
    width: '36px',
    height: 'auto',
  },
  mobileBrandName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#00643C',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0F2B46',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '14px',
    color: '#5A6E7C',
    marginBottom: '32px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2D3748',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#00643C',
    textDecoration: 'none',
    fontWeight: '500',
  },
  input: {
    padding: '12px 16px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1A202C',
    outline: 'none',
    background: '#FAFAFA',
    transition: 'all 0.2s',
  },
  btn: {
    marginTop: '8px',
    padding: '13px',
    background: '#00643C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '40px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s',
  },
  btnDisabled: {
    background: '#9BB7A8',
    cursor: 'not-allowed',
  },
  errorBox: {
    background: '#FFF5F5',
    border: '1px solid #FEB2B2',
    color: '#C53030',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px',
    marginBottom: '20px',
  },
  registerHint: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#5A6E7C',
    marginTop: '28px',
  },
  registerLink: {
    color: '#00643C',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;