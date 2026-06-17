import React, { useState, useEffect } from 'react';
import api from '../services/api';

const estadoConfig = {
  borrador:     { label: 'Borrador',      bg: '#EDF2F7', color: '#4A5568' },
  pendiente:    { label: 'Pendiente',     bg: '#FFFBEB', color: '#B7791F' },
  rechazada:    { label: 'Rechazada',     bg: '#FFF5F5', color: '#C53030' },
  aprobada:     { label: 'Aprobada',      bg: '#EAF7EE', color: '#2D7D46' },
  lista_espera: { label: 'Lista de espera', bg: '#FEF3C7', color: '#B7791F' },
  ficha_proceso:{ label: 'Ficha en proceso', bg: '#EBF8FF', color: '#2B6CB0' },
  matriculados: { label: 'Matriculados',  bg: '#E8F5E9', color: '#2E7D32' },
  ficha_creada: { label: 'Ficha Creada',  bg: '#EBF8FF', color: '#2B6CB0' },
  con_inscritos:{ label: 'Con Inscritos', bg: '#FAF5FF', color: '#6B46C1' },
  completada:   { label: 'Completada',    bg: '#EDF2F7', color: '#1A202C' },
};

const MisOfertas = () => {
  const [ofertas, setOfertas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filtro, setFiltro]     = useState('todos');

  useEffect(() => { cargarOfertas(); }, []);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ofertas/mis-ofertas');
      setOfertas(res.data.data || []);
    } catch {
      setError('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const filtradas = filtro === 'todos' ? ofertas
    : ofertas.filter(o => o.estado?.codigo === filtro);

  const conteos = {};
  ofertas.forEach(o => { const c = o.estado?.codigo || 'sin_estado'; conteos[c] = (conteos[c] || 0) + 1; });

  if (loading) return <PageLoading />;

  return (
    <>
      <style>
        {`
          .mis-ofertas-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .mis-ofertas-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            max-width: 1400px;
            margin: 0 auto;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .mis-ofertas-card:hover {
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
          .page-desc {
            font-size: 14px;
            color: #5a6e7c;
            margin: 6px 0 0;
          }
          .filter-bar {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 28px;
          }
          .chip {
            padding: 6px 18px;
            border-radius: 40px;
            border: 1.5px solid #e2e8f0;
            background: white;
            color: #4a5568;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
          }
          .chip:hover {
            background: #f7fafc;
            border-color: #cbd5e0;
          }
          .chip-active {
            background: #00643C;
            color: white;
            border-color: #00643C;
            box-shadow: 0 2px 8px rgba(0, 100, 60, 0.3);
          }
          .chip-count {
            background: rgba(255,255,255,0.25);
            border-radius: 40px;
            padding: 2px 8px;
            font-size: 11px;
            font-weight: 700;
          }
          .table-wrapper {
            background: white;
            border-radius: 24px;
            border: 1px solid #edf2f7;
            overflow-x: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          }
          .ofertas-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
          }
          .table-header {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .table-header th {
            padding: 14px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            color: #2d3748;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .table-row {
            border-bottom: 1px solid #f0f2f5;
            transition: background 0.1s;
          }
          .table-row:hover {
            background: #fefce8;
          }
          .table-cell {
            padding: 14px 16px;
            font-size: 13.5px;
            color: #1a202c;
            vertical-align: middle;
          }
          .programa-nombre {
            font-weight: 600;
            color: #0F2B46;
            max-width: 220px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
          }
          .codigo-badge {
            background: #edf2f7;
            color: #2d3748;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-family: monospace;
          }
          .tipo-badge {
            padding: 4px 12px;
            border-radius: 40px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }
          .tipo-regular {
            background: #e8f5e9;
            color: #2e7d32;
          }
          .tipo-campesena {
            background: #fff8e1;
            color: #b76e0e;
          }
          .cupos-text {
            font-weight: 600;
            color: #1e293b;
          }
          .cupos-slash {
            color: #94a3b8;
            margin: 0 2px;
          }
          .estado-badge {
            padding: 4px 12px;
            border-radius: 40px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }
          .btn-ver {
            background: transparent;
            border: 1.5px solid #cbd5e1;
            border-radius: 30px;
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 600;
            color: #1e293b;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-ver:hover {
            background: #00643C;
            border-color: #00643C;
            color: white;
          }
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: #fafcff;
            border-radius: 24px;
            border: 1.5px dashed #cbd5e1;
          }
          .empty-state-title {
            font-weight: 700;
            color: #00643C;
            margin-bottom: 8px;
            font-size: 18px;
          }
          .empty-state-desc {
            color: #64748b;
            font-size: 13px;
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
          @media (max-width: 768px) {
            .mis-ofertas-card {
              padding: 20px 16px;
            }
            .page-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
          }
        `}
      </style>

      <div className="mis-ofertas-container">
        <div className="mis-ofertas-card">
          <div className="page-header">
            <img src="/logosena.png" alt="SENA" className="logo" />
            <div>
              <h1 className="page-title">Mis Ofertas</h1>
              <p className="page-desc">
                {ofertas.length} oferta{ofertas.length !== 1 ? 's' : ''} registrada{ofertas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          {/* Filtros rápidos */}
          <div className="filter-bar">
            <button
              onClick={() => setFiltro('todos')}
              className={`chip ${filtro === 'todos' ? 'chip-active' : ''}`}
            >
              Todas
            </button>
            {Object.entries(estadoConfig)
              .filter(([k]) => conteos[k])
              .map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFiltro(k)}
                  className={`chip ${filtro === k ? 'chip-active' : ''}`}
                >
                  {v.label}
                  <span className="chip-count">{conteos[k]}</span>
                </button>
              ))}
          </div>

          {filtradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No hay ofertas</div>
              <div className="empty-state-desc">
                Ve a "Crear Oferta" para registrar la primera.
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="ofertas-table">
                <thead className="table-header">
                  <tr>
                    <th>Programa</th>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Cupos</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((oferta, idx) => {
                    const cfg = estadoConfig[oferta.estado?.codigo] || estadoConfig.borrador;
                    return (
                      <tr key={oferta._id} className="table-row">
                        <td className="table-cell">
                          <span className="programa-nombre" title={oferta.programa_formacion?.nombre_programa}>
                            {oferta.programa_formacion?.nombre_programa || '—'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <code className="codigo-badge">{oferta.programa_formacion?.codigo || '—'}</code>
                        </td>
                        <td className="table-cell">
                          <span className={`tipo-badge ${oferta.es_campesena ? 'tipo-campesena' : 'tipo-regular'}`}>
                            {oferta.es_campesena ? 'Campesena' : 'Regular'}
                          </span>
                        </td>
                        <td className="table-cell">{fmt(oferta.fechas?.inicio)}</td>
                        <td className="table-cell">{fmt(oferta.fechas?.fin)}</td>
                        <td className="table-cell">
                          <span className="cupos-text">
                            {oferta.cupos_disponibles ?? 0}
                            <span className="cupos-slash">/</span>
                            {oferta.cupo_maximo ?? 0}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span
                            className="estado-badge"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            className="btn-ver"
                            onClick={() => alert(`Detalle de oferta ${oferta._id} — próximamente`)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const PageLoading = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    fontSize: '14px',
    color: '#2d6a4f'
  }}>
    Cargando ofertas…
  </div>
);

export default MisOfertas;