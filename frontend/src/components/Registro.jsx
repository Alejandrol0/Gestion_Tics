import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Registro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [step, setStep] = useState(1);

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
    confirmPassword: '',
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [tiposRes, coordRes] = await Promise.all([
        api.get('/tipos-documento'),
        api.get('/coordinadores'),
      ]);
      setTiposDocumento(tiposRes.data.data || []);
      setCoordinadores(coordRes.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const nextStep = () => {
    if (!formData.nombreUsuario)
      return setError('El nombre de usuario es obligatorio');
    if (!formData.tipoIdentificacion)
      return setError('Seleccione un tipo de identificación');
    if (!formData.numeroIdentificacion)
      return setError('El número de identificación es obligatorio');
    if (!formData.nombre)
      return setError('El nombre es obligatorio');
    if (!formData.apellido)
      return setError('El apellido es obligatorio');
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!formData.telefono)
        throw new Error('El teléfono es obligatorio');
      if (!formData.correoElectronico)
        throw new Error('El correo es obligatorio');
      if (!formData.coordinadorAsignado)
        throw new Error('Seleccione un coordinador');
      if (!formData.password)
        throw new Error('La contraseña es obligatoria');
      if (formData.password !== formData.confirmPassword)
        throw new Error('Las contraseñas no coinciden');
      if (formData.password.length < 6)
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      const emailOk = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
        formData.correoElectronico
      );
      if (!emailOk) throw new Error('Correo electrónico inválido');

      const { confirmPassword, ...datos } = formData;
      await api.post('/auth/register', datos);
      setSuccess('✅ Registro exitoso. Redirigiendo al inicio de sesión…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .registro-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 20px;
          }
          .registro-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 40px 36px;
            width: 100%;
            max-width: 680px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .registro-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 28px 48px rgba(0, 0, 0, 0.12), 0 12px 28px rgba(0, 100, 60, 0.15);
          }
          .header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;
            border-bottom: 2px solid #eef2f6;
            padding-bottom: 20px;
          }
          .logo {
            width: 48px;
            height: auto;
          }
          .heading {
            font-size: 24px;
            font-weight: 700;
            color: #00643C;
            margin: 0;
          }
          .sub {
            font-size: 14px;
            color: #5a6e7c;
            margin: 4px 0 0;
          }
          /* Stepper */
          .stepper {
            display: flex;
            align-items: center;
            margin-bottom: 32px;
          }
          .step-item {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
          }
          .step-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #edf2f7;
            color: #a0aec0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .step-circle-active {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #00643C;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .step-circle-done {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #FFD966;
            color: #00643C;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .step-label {
            font-size: 12px;
            color: #a0aec0;
            font-weight: 500;
          }
          .step-label-active {
            font-size: 12px;
            color: #00643C;
            font-weight: 700;
          }
          .connector {
            flex: 0 0 32px;
            height: 2px;
            background: #e2e8f0;
            margin: 0 8px;
          }
          .connector-done {
            flex: 0 0 32px;
            height: 2px;
            background: #FFD966;
            margin: 0 8px;
          }
          /* Formulario */
          .field-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .field-full {
            grid-column: span 2;
          }
          .label {
            font-size: 13px;
            font-weight: 600;
            color: #2d3748;
          }
          .input, .select {
            padding: 12px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 16px;
            font-size: 14px;
            font-family: inherit;
            background: #fefefe;
            outline: none;
            transition: all 0.2s;
            width: 100%;
            box-sizing: border-box;
          }
          .input:focus, .select:focus {
            border-color: #00643C;
            box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
            background: white;
          }
          .actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 16px;
            grid-column: span 2;
          }
          .btn-primary {
            padding: 12px 28px;
            background: #00643C;
            color: white;
            border: none;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(0, 100, 60, 0.2);
          }
          .btn-primary:hover:not(:disabled) {
            background: #004d2e;
            transform: translateY(-1px);
            box-shadow: 0 8px 18px rgba(0, 100, 60, 0.25);
          }
          .btn-primary:active:not(:disabled) {
            transform: translateY(1px);
          }
          .btn-primary:disabled {
            background: #9bb7a8;
            cursor: not-allowed;
          }
          .btn-ghost {
            padding: 12px 24px;
            background: transparent;
            color: #4a5568;
            border: 1.5px solid #e2e8f0;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-ghost:hover {
            background: #f7fafc;
            border-color: #cbd5e0;
          }
          .error-box {
            background: #fff5f5;
            border-left: 4px solid #e53e3e;
            color: #c53030;
            border-radius: 16px;
            padding: 12px 16px;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .success-box {
            background: #e8f5e9;
            border-left: 4px solid #2e7d32;
            color: #1b5e20;
            border-radius: 16px;
            padding: 12px 16px;
            font-size: 13px;
            margin-bottom: 24px;
          }
          @media (max-width: 640px) {
            .registro-card {
              padding: 28px 20px;
            }
            .field-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            .field-full {
              grid-column: span 1;
            }
            .actions {
              grid-column: span 1;
              flex-direction: column;
            }
            .btn-primary, .btn-ghost {
              width: 100%;
              text-align: center;
            }
            .step-label, .step-label-active {
              display: none;
            }
          }
        `}
      </style>

      <div className="registro-container">
        <div className="registro-card">
          <div className="header">
            <img src="/logosena.png" alt="SENA" className="logo" />
            <div>
              <h1 className="heading">Crear cuenta</h1>
              <p className="sub">SENA · Formación profesional</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="stepper">
            {['Información personal', 'Contacto y acceso'].map((label, i) => (
              <React.Fragment key={i}>
                <div className="step-item">
                  <div
                    className={
                      step > i + 1
                        ? 'step-circle-done'
                        : i + 1 === step
                        ? 'step-circle-active'
                        : 'step-circle'
                    }
                  >
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={i + 1 === step ? 'step-label-active' : 'step-label'}>
                    {label}
                  </span>
                </div>
                {i < 1 && (
                  <div className={step > 1 ? 'connector-done' : 'connector'} />
                )}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Paso 1 */}
            {step === 1 && (
              <div className="field-grid">
                <div className="field field-full">
                  <label className="label">Nombre de usuario</label>
                  <input
                    type="text"
                    name="nombreUsuario"
                    value={formData.nombreUsuario}
                    onChange={handleChange}
                    className="input"
                    placeholder="ej: juan.perez"
                    required
                  />
                </div>

                <div className="field">
                  <label className="label">Tipo de identificación</label>
                  <select
                    name="tipoIdentificacion"
                    value={formData.tipoIdentificacion}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value="">Seleccione…</option>
                    {tiposDocumento.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label">Número de identificación</label>
                  <input
                    type="text"
                    name="numeroIdentificacion"
                    value={formData.numeroIdentificacion}
                    onChange={handleChange}
                    className="input"
                    placeholder="123456789"
                    required
                  />
                </div>

                <div className="field">
                  <label className="label">Nombres</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="input"
                    placeholder="Juan Carlos"
                    required
                  />
                </div>

                <div className="field">
                  <label className="label">Apellidos</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="input"
                    placeholder="Pérez González"
                    required
                  />
                </div>

                <div className="actions">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button type="button" onClick={nextStep} className="btn-primary">
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2 */}
            {step === 2 && (
              <div className="field-grid">
                <div className="field">
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="input"
                    placeholder="3001234567"
                    required
                  />
                </div>

                <div className="field">
                  <label className="label">Correo electrónico</label>
                  <input
                    type="email"
                    name="correoElectronico"
                    value={formData.correoElectronico}
                    onChange={handleChange}
                    className="input"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="field field-full">
                  <label className="label">Coordinador asignado</label>
                  <select
                    name="coordinadorAsignado"
                    value={formData.coordinadorAsignado}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value="">Seleccione un coordinador…</option>
                    {coordinadores.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="field">
                  <label className="label">Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="actions">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    className="btn-ghost"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Registrando…' : 'Crear cuenta'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default Registro;