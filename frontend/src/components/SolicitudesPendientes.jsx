import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RevisarSolicitud from './RevisarSolicitud';

const SolicitudesPendientes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/solicitudes/pendientes');
      setSolicitudes(res.data.data || []);
    } catch {
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizada = () => {
    setSolicitudSeleccionada(null);
    cargarSolicitudes();
  };

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
        Cargando solicitudes…
      </div>
    );

  return (
    <>
      <style>
        {`
          .solicitudes-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .solicitudes-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            max-width: 1200px;
            margin: 0 auto;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .solicitudes-card:hover {
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
          .pendiente-badge {
            background: #fff8e1;
            color: #b76e0e;
            border: 1px solid #ffe082;
            border-radius: 40px;
            padding: 6px 18px;
            font-size: 13px;
            font-weight: 700;
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
          .solicitudes-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .solicitud-card {
            background: white;
            border-radius: 24px;
            border: 1px solid #edf2f7;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
            transition: all 0.2s;
          }
          .solicitud-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e1;
          }
          .solicitud-info {
            flex: 1;
          }
          .programa-nombre {
            font-weight: 700;
            font-size: 16px;
            color: #0F2B46;
            margin-bottom: 10px;
          }
          .meta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 12px;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
          }
          .meta-label {
            color: #94a3b8;
            font-weight: 600;
          }
          .meta-value {
            color: #1e293b;
            font-weight: 500;
          }
          .code-badge {
            background: #edf2f7;
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 11.5px;
            font-family: monospace;
            color: #2d3748;
          }
          .mensaje-box {
            background: #f8fafc;
            border-radius: 16px;
            padding: 10px 14px;
            font-size: 12.5px;
            color: #334155;
            margin-top: 8px;
            border-left: 3px solid #FFD966;
          }
          .mensaje-label {
            font-weight: 700;
            color: #00643C;
            margin-right: 6px;
          }
          .solicitud-actions {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
            flex-shrink: 0;
          }
          .estado-tag {
            background: #fff8e1;
            color: #b76e0e;
            padding: 4px 14px;
            border-radius: 40px;
            font-size: 12px;
            font-weight: 700;
          }
          .btn-revisar {
            padding: 8px 24px;
            background: #00643C;
            color: white;
            border: none;
            border-radius: 40px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-revisar:hover {
            background: #004d2e;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 100, 60, 0.3);
          }
          /* Modal */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }
          .modal-container {
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 32px;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
          }
          @media (max-width: 768px) {
            .solicitudes-card {
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
            .solicitud-card {
              flex-direction: column;
              align-items: stretch;
            }
            .solicitud-actions {
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }
          }
        `}
      </style>

      <div className="solicitudes-container">
        <div className="solicitudes-card">
          <div className="page-header">
            <div className="header-left">
              <img src="/logosena.png" alt="SENA" className="logo" />
              <div>
                <h1 className="page-title">Solicitudes Pendientes</h1>
                <p className="page-sub">
                  {solicitudes.length} solicitud
                  {solicitudes.length !== 1 ? 'es' : ''} en espera de revisión
                </p>
              </div>
            </div>
            {solicitudes.length > 0 && (
              <span className="pendiente-badge">
                {solicitudes.length} pendiente{solicitudes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {error && <div className="error-box">{error}</div>}

          {solicitudes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Sin solicitudes pendientes</div>
              <div className="empty-sub">
                Los instructores aún no han enviado solicitudes de validación.
              </div>
            </div>
          ) : (
            <div className="solicitudes-list">
              {solicitudes.map((sol) => (
                <div key={sol._id} className="solicitud-card">
                  <div className="solicitud-info">
                    <div className="programa-nombre">
                      {sol.oferta_id?.programa_formacion?.nombre_programa ||
                        'Programa sin nombre'}
                    </div>
                    <div className="meta-row">
                      <div className="meta-item">
                        <span className="meta-label">Instructor:</span>
                        <span className="meta-value">
                          {sol.instructor_id?.nombre || ''}{' '}
                          {sol.instructor_id?.apellido || ''}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Código:</span>
                        <code className="code-badge">
                          {sol.oferta_id?.programa_formacion?.codigo || '—'}
                        </code>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Solicitado:</span>
                        <span className="meta-value">
                          {fmt(sol.fecha_solicitud)}
                        </span>
                      </div>
                    </div>
                    {sol.mensaje && (
                      <div className="mensaje-box">
                        <span className="mensaje-label">Mensaje:</span> {sol.mensaje}
                      </div>
                    )}
                  </div>

                  <div className="solicitud-actions">
                    <span className="estado-tag">Pendiente</span>
                    <button
                      className="btn-revisar"
                      onClick={() => setSolicitudSeleccionada(sol._id)}
                    >
                      Revisar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {solicitudSeleccionada && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setSolicitudSeleccionada(null)}
        >
          <div className="modal-container">
            <RevisarSolicitud
              solicitudId={solicitudSeleccionada}
              onClose={() => setSolicitudSeleccionada(null)}
              onActualizar={handleActualizada}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesPendientes;