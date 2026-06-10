import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    correoElectronico: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(
        formData.correoElectronico,
        formData.password
      );
      
      console.log('Login exitoso:', response);
      
      // 🔥 REDIRECCIÓN SEGÚN EL TIPO DE USUARIO
      if (response.user.tipo === 'funcionario') {
        navigate('/funcionario');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        {/* Logo SENA desde el backend */}
        <div style={styles.logoContainer}>
          <img 
            src="/logosena.png" 
            alt="Logo SENA" 
            style={styles.logo}
          />
        </div>

        <h2 style={styles.title}>Iniciar Sesión</h2>
        
        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              name="correoElectronico"
              value={formData.correoElectronico}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="********"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
          </button>

          <div style={styles.linksContainer}>
            <Link to="/recuperar-password" style={styles.link}>
              ¿Olvidaste tu contraseña?
            </Link>
            
            <div style={styles.registerContainer}>
              <span style={styles.registerText}>¿No tienes una cuenta? </span>
              <Link to="/registro" style={styles.registerLink}>
                Registrarte aquí
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif'
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px 30px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,100,60,0.15)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #e0e0e0'
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  logo: {
    width: '120px',
    height: 'auto',
    objectFit: 'contain'
  },
  title: {
    textAlign: 'center',
    color: '#00643C',
    marginBottom: '30px',
    fontSize: '24px',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    outline: 'none',
    ':focus': {
      borderColor: '#00643C'
    }
  },
  button: {
    backgroundColor: '#00643C',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    marginBottom: '20px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#004d2e'
    }
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px'
  },
  linksContainer: {
    textAlign: 'center'
  },
  link: {
    color: '#00643C',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'block',
    marginBottom: '15px',
    transition: 'color 0.3s',
    ':hover': {
      color: '#004d2e',
      textDecoration: 'underline'
    }
  },
  registerContainer: {
    fontSize: '14px',
    color: '#666'
  },
  registerText: {
    color: '#666'
  },
  registerLink: {
    color: '#00643C',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.3s',
    ':hover': {
      color: '#004d2e',
      textDecoration: 'underline'
    }
  }
};

export default Login;