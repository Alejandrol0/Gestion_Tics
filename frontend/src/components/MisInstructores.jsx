import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MisInstructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarInstructores();
  }, []);

  const cargarInstructores = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.get(`/usuarios/coordinador/${user.id}/instructores`);
      setInstructores(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Sesión expirada. Inicia sesión nuevamente.'
          : 'Error al cargar la lista de instructores'
      );
    } finally {
      setLoading(false);
    }
  };

  const filtrados = instructores.filter((i) =>
    `${i.nombre} ${i.apellido} ${i.correoElectronico}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';

  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', 'Roboto', sans-serif",
          fontSize: '14px',
          color: '#2d6a4f',
        }}
      >
        Cargando instructores…
      </div>
    );

  return (
    <>
      <style>
        {`
          .instructores-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .instructores-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            max-width: 1400px;
            margin: 0 auto;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .instructores-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 28px 48px rgba(0, 0, 0, 0.12), 0 12px 28px rgba(0, 100, 60, 0.15);
          }
          .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 28px;
            border-bottom: 2px solid #eef2f6;
            padding-bottom: 20px;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          .logo {
            width: 56px;
            height: auto;
          }
          .page-title {
            font-size: 28px;
            font-weight: 700;
            color: #00643C;
            margin: 0;
          }
          .page-sub {
            font-size: 14px;
            color: #5a6e7c;
            margin: 6px 0 0;
          }
          .search-input {
            padding: 10px 18px;
            border: 1.5px solid #e2e8f0;
            border-radius: 40px;
            font-size: 13.5px;
            color: #1e293b;
            outline: none;
            background: #fefefe;
            min-width: 240px;
            transition: all 0.2s;
          }
          .search-input:focus {
            border-color: #00643C;
            box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
          }
          .error-box {
            background: #fff5f5;
            border-left: 4px solid #e53e3e;
            color: #c53030;
            border-radius: 16px;
            padding: 12px 18px;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: #fafcff;
            border-radius: 24px;
            border: 1.5px dashed #cbd5e1;
          }
          .empty-title {
            font-weight: 700;
            color: #00643C;
            margin-bottom: 8px;
            font-size: 18px;
          }
          .empty-sub {
            color: #64748b;
            font-size: 13px;
          }
          .instructores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
          }
          .instructor-card {
            background: white;
            border-radius: 24px;
            border: 1px solid #edf2f7;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
            transition: all 0.2s;
          }
          .instructor-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          }
          .card-header {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 18px 20px;
            border-bottom: 1px solid #edf2f7;
          }
          .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #00643C;
            color: #FFD966;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            flex-shrink: 0;
          }
          .info {
            flex: 1;
            overflow: hidden;
          }
          .nombre {
            font-weight: 700;
            font-size: 15px;
            color: #0F2B46;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .email {
            font-size: 12px;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .rol-badge {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 4px 12px;
            border-radius: 40px;
            font-size: 11px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .card-body {
            padding: 14px 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f2f5;
            font-size: 13px;
          }
          .info-label {
            color: #94a3b8;
            font-weight: 600;
          }
          .info-value {
            color: #1e293b;
            font-weight: 500;
          }
          .card-footer {
            padding: 14px 20px;
            background: #fafcff;
            border-top: 1px solid #edf2f7;
          }
          .btn-ver {
            width: 100%;
            padding: 10px;
            background: #00643C;
            color: white;
            border: none;
            border-radius: 40px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-ver:hover {
            background: #004d2e;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 100, 60, 0.3);
          }
          @media (max-width: 768px) {
            .instructores-card {
              padding: 20px 16px;
            }
            .page-header {
              flex-direction: column;
              align-items: stretch;
            }
            .header-left {
              flex-direction: column;
              align-items: flex-start;
            }
            .search-input {
              width: 100%;
            }
            .instructores-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="instructores-container">
        <div className="instructores-card">
          <div className="page-header">
            <div className="header-left">
              <img src="/logosena.png" alt="SENA" className="logo" />
              <div>
                <h1 className="page-title">Mis Instructores</h1>
                <p className="page-sub">
                  {instructores.length} instructor
                  {instructores.length !== 1 ? 'es' : ''} asignado
                  {instructores.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {instructores.length > 0 && (
              <input
                type="text"
                placeholder="Buscar instructor…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
            )}
          </div>

          {error && <div className="error-box">{error}</div>}

          {instructores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Sin instructores asignados</div>
              <div className="empty-sub">
                Cuando los instructores te seleccionen como coordinador,
                aparecerán aquí.
              </div>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Sin resultados</div>
              <div className="empty-sub">
                Ningún instructor coincide con "{busqueda}".
              </div>
            </div>
          ) : (
            <div className="instructores-grid">
              {filtrados.map((inst) => {
                const initials = (
                  (inst.nombre?.[0] || '') + (inst.apellido?.[0] || '')
                ).toUpperCase();
                return (
                  <div key={inst._id} className="instructor-card">
                    <div className="card-header">
                      <div className="avatar">{initials}</div>
                      <div className="info">
                        <div className="nombre">
                          {inst.nombre} {inst.apellido}
                        </div>
                        <div className="email">{inst.correoElectronico}</div>
                      </div>
                      <span className="rol-badge">Instructor</span>
                    </div>

                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Usuario</span>
                        <span className="info-value">
                          {inst.nombreUsuario || '—'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Teléfono</span>
                        <span className="info-value">{inst.telefono || '—'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Documento</span>
                        <span className="info-value">
                          {inst.numeroIdentificacion || '—'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Registro</span>
                        <span className="info-value">{fmt(inst.createdAt)}</span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        className="btn-ver"
                        onClick={() =>
                          (window.location.href = `/dashboard?instructor=${inst._id}`)
                        }
                      >
                        Ver sus ofertas
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MisInstructores;