import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authService } from '../services/api';

const Registro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correoElectronico: '',
    coordinadorAsignado: '',
    password: '',
    confirmPassword: ''
  });

  // Cargar tipos de documento y coordinadores
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      // Estas rutas deben ser públicas o manejadas sin token
      const [tiposRes, coordinadoresRes] = await Promise.all([
        api.get('/tipos-documento'),
        api.get('/coordinadores')
      ]);

      setTiposDocumento(tiposRes.data.data || []);
      setCoordinadores(coordinadoresRes.data.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.nombreUsuario) throw new Error('El nombre de usuario es obligatorio');
      if (!formData.tipoIdentificacion) throw new Error('Seleccione un tipo de identificación');
      if (!formData.numeroIdentificacion) throw new Error('El número de identificación es obligatorio');
      if (!formData.nombre) throw new Error('El nombre es obligatorio');
      if (!formData.apellido) throw new Error('El apellido es obligatorio');
      if (!formData.telefono) throw new Error('El teléfono es obligatorio');
      if (!formData.correoElectronico) throw new Error('El correo es obligatorio');
      if (!formData.coordinadorAsignado) throw new Error('Seleccione un coordinador');
      if (!formData.password) throw new Error('La contraseña es obligatoria');
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Validar email
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.correoElectronico)) {
        throw new Error('Correo electrónico inválido');
      }

      // Crear objeto para enviar (sin confirmPassword)
      const { confirmPassword, ...datosEnvio } = formData;

      // Enviar al backend
      const response = await api.post('/auth/register', datosEnvio);
      
      setSuccess('✅ ¡Registro exitoso! Redirigiendo al login...');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registroBox}>
        <h2 style={styles.title}>Gestionytics</h2>
        <p style={styles.subtitle}>Registro de Usuario</p>
        
        {error && <div style={styles.errorAlert}>❌ {error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Nombre de Usuario:</label>
              <input
                type="text"
                name="nombreUsuario"
                value={formData.nombreUsuario}
                onChange={handleChange}
                style={styles.input}
                placeholder="ej: juan.perez"
                required
              />
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Tipo Identificación:</label>
              <select
                name="tipoIdentificacion"
                value={formData.tipoIdentificacion}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Seleccione...</option>
                {tiposDocumento.map(tipo => (
                  <option key={tipo._id} value={tipo._id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Número Identificación:</label>
              <input
                type="text"
                name="numeroIdentificacion"
                value={formData.numeroIdentificacion}
                onChange={handleChange}
                style={styles.input}
                placeholder="123456789"
                required
              />
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Teléfono:</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                style={styles.input}
                placeholder="3001234567"
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Nombres:</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={styles.input}
                placeholder="Juan Carlos"
                required
              />
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Apellidos:</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                style={styles.input}
                placeholder="Pérez González"
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Correo Electrónico:</label>
            <input
              type="email"
              name="correoElectronico"
              value={formData.correoElectronico}
              onChange={handleChange}
              style={styles.input}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Coordinador Asignado:</label>
            <select
              name="coordinadorAsignado"
              value={formData.coordinadorAsignado}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Seleccione un coordinador...</option>
              {coordinadores.map(coord => (
                <option key={coord._id} value={coord._id}>
                  {coord.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Contraseña:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="********"
                required
              />
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Confirmar Contraseña:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="********"
                required
              />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              disabled={loading}
              style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/login')}
              style={styles.secondaryButton}
            >
              Volver al Login
            </button>
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
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
  },
  registroBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px'
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '5px',
    fontSize: '28px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: '20px',
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  row: {
    display: 'flex',
    gap: '15px'
  },
  half: {
    flex: 1,
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
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  button: {
    flex: 1,
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#3498db',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  successAlert: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
  }
};

export default Registro;