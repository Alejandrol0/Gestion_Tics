import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OfertasRechazadas = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRechazadas();
  }, []);

  const cargarRechazadas = async () => {
    try {
      const res = await api.get('/solicitudes/mis-rechazadas');
      setSolicitudes(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        Cargando ofertas rechazadas…
      </div>
    );

  return (
    <>
      <style>
        {`
          .rechazadas-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .rechazadas-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            max-width: 1200px;
            margin: 0 auto;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .rechazadas-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 28px 48px rgba(0, 0, 0, 0.12), 0 12px 28px rgba(0, 100, 60, 0.15);
          }
          .page-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 28px;
            border-bottom: 2px solid #eef2f6;
            padding-bottom: 20px;
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
            gap: 20px;
          }
          .solicitud-card {
            background: white;
            border-radius: 24px;
            border: 1px solid #fecaca;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
            transition: all 0.2s;
            display: flex;
          }
          .solicitud-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
            border-color: #f87171;
          }
          .card-stripe {
            width: 6px;
            background: #dc2626;
            flex-shrink: 0;
          }
          .card-content {
            flex: 1;
            padding: 20px 24px;
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 16px;
          }
          .programa-nombre {
            font-weight: 700;
            font-size: 16px;
            color: #0F2B46;
          }
          .rechazada-tag {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
            padding: 4px 14px;
            border-radius: 40px;
            font-size: 12px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .motivo-box {
            background: #fef2f2;
            border-radius: 20px;
            padding: 14px 18px;
            margin-bottom: 18px;
            border-left: 4px solid #dc2626;
          }
          .motivo-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #b91c1c;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .motivo-texto {
            font-size: 13.5px;
            color: #1e293b;
            margin: 0;
            line-height: 1.5;
          }
          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
          }
          .fecha-texto {
            font-size: 12px;
            color: #94a3b8;
          }
          .btn-corregir {
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
          .btn-corregir:hover {
            background: #004d2e;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 100, 60, 0.3);
          }
          @media (max-width: 768px) {
            .rechazadas-card {
              padding: 20px 16px;
            }
            .page-header {
              flex-direction: column;
              align-items: flex-start;
            }
            .card-header {
              flex-direction: column;
            }
            .card-footer {
              flex-direction: column;
              align-items: stretch;
            }
            .btn-corregir {
              text-align: center;
            }
          }
        `}
      </style>

      <div className="rechazadas-container">
        <div className="rechazadas-card">
          <div className="page-header">
            <img src="/logosena.png" alt="SENA" className="logo" />
            <div>
              <h1 className="page-title">Ofertas Rechazadas</h1>
              <p className="page-sub">
                {solicitudes.length} oferta{solicitudes.length !== 1 ? 's' : ''} con solicitud rechazada
              </p>
            </div>
          </div>

          {solicitudes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Sin rechazos</div>
              <div className="empty-sub">
                Ninguna de tus solicitudes ha sido rechazada.
              </div>
            </div>
          ) : (
            <div className="solicitudes-list">
              {solicitudes.map((sol) => (
                <div key={sol._id} className="solicitud-card">
                  <div className="card-stripe" />
                  <div className="card-content">
                    <div className="card-header">
                      <span className="programa-nombre">
                        {sol.oferta_id?.programa_formacion?.nombre_programa ||
                          'Programa sin nombre'}
                      </span>
                      <span className="rechazada-tag">Rechazada</span>
                    </div>
                    <div className="motivo-box">
                      <span className="motivo-label">Motivo del rechazo</span>
                      <p className="motivo-texto">
                        {sol.comentarios || 'Sin comentarios del coordinador.'}
                      </p>
                    </div>
                    <div className="card-footer">
                      <span className="fecha-texto">
                        Fecha de respuesta: {fmt(sol.fecha_respuesta)}
                      </span>
                      <button
                        className="btn-corregir"
                        onClick={() =>
                          alert('Función de corrección — próximamente')
                        }
                      >
                        Corregir y reenviar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OfertasRechazadas;