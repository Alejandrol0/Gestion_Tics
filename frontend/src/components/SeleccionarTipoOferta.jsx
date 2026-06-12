import React from 'react';

const SeleccionarTipoOferta = ({ onSeleccionar }) => (
  <>
    <style>
      {`
        .tipo-oferta-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
        }
        .tipo-oferta-card {
          background: white;
          border-radius: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
          padding: 40px 40px;
          max-width: 900px;
          width: 100%;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tipo-oferta-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 48px rgba(0, 0, 0, 0.12), 0 12px 28px rgba(0, 100, 60, 0.15);
        }
        .header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 36px;
          border-bottom: 2px solid #eef2f6;
          padding-bottom: 24px;
        }
        .logo {
          width: 56px;
          height: auto;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          color: #00643C;
          margin: 0 0 6px;
        }
        .sub {
          font-size: 14px;
          color: #5a6e7c;
          margin: 0;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 28px;
        }
        .card {
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 28px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        .card:hover {
          transform: translateY(-6px);
          border-color: #00643C;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.12);
        }
        .card-highlight {
          border: 1.5px solid #FFD966;
          box-shadow: 0 8px 20px rgba(255, 217, 102, 0.2);
        }
        .highlight-band {
          position: absolute;
          top: 0;
          right: 0;
          background: #FFD966;
          color: #0F2B46;
          font-size: 10.5px;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 0 0 0 16px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .card-type {
          font-size: 22px;
          font-weight: 800;
          color: #0F2B46;
        }
        .card-desc {
          font-size: 13.5px;
          color: #4b5563;
          line-height: 1.5;
          margin: 4px 0;
        }
        .card-tag {
          padding: 4px 14px;
          border-radius: 40px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 6px;
        }
        .card-cta {
          font-size: 13.5px;
          font-weight: 700;
          margin-top: 12px;
          transition: transform 0.1s;
        }
        .card:hover .card-cta {
          transform: translateX(4px);
        }
        @media (max-width: 720px) {
          .tipo-oferta-card {
            padding: 28px 20px;
          }
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .cards {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}
    </style>

    <div className="tipo-oferta-container">
      <div className="tipo-oferta-card">
        <div className="header">
          <img src="/logosena.png" alt="Logo SENA" className="logo" />
          <div>
            <h1 className="title">Crear nueva oferta</h1>
            <p className="sub">Selecciona el tipo de oferta de formación que deseas crear.</p>
          </div>
        </div>

        <div className="cards">
          {/* Regular */}
          <button onClick={() => onSeleccionar('regular')} className="card">
            <div className="icon-wrap" style={{ background: '#EBF8FF' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="card-type">Regular</span>
            <span className="card-desc">Formación estándar. Sin instructores adicionales requeridos.</span>
            <div className="card-tag" style={{ background: '#EBF8FF', color: '#2B6CB0' }}>
              Duración flexible
            </div>
            <div className="card-cta" style={{ color: '#2B6CB0' }}>Seleccionar Regular →</div>
          </button>

          {/* Campesena */}
          <button onClick={() => onSeleccionar('campesena')} className="card card-highlight">
            <div className="highlight-band">Incluye instructores adicionales</div>
            <div className="icon-wrap" style={{ background: '#FEF3C7', marginTop: '8px' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                  M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0
                  a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <span className="card-type">Campesena</span>
            <span className="card-desc">Requiere 2 instructores adicionales. Duración fija de 5 meses.</span>
            <div className="card-tag" style={{ background: '#FEF3C7', color: '#B7791F' }}>
              5 meses · 2 instructores
            </div>
            <div className="card-cta" style={{ color: '#B7791F' }}>Seleccionar Campesena →</div>
          </button>
        </div>
      </div>
    </div>
  </>
);

export default SeleccionarTipoOferta;