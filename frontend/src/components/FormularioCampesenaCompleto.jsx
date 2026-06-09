import React, { useState } from 'react';

const FormularioCampesenaCompleto = ({ formData, setFormData }) => {
  const [instructores, setInstructores] = useState([
    {
      id: Date.now(), // ID único temporal
      tipo: 'Técnico',
      tipo_identificacion: 'CC',
      identificacion: '',
      nombre: '',
      correo: '',
      celular: '',
      programacion: [] // Array de meses con rangos de fechas
    }
  ]);

  // ===== FUNCIONES PARA MANEJAR INSTRUCTORES =====

  // Agregar un nuevo instructor
  const agregarInstructor = () => {
    const nuevoInstructor = {
      id: Date.now() + Math.random(), // ID único
      tipo: 'Técnico',
      tipo_identificacion: 'CC',
      identificacion: '',
      nombre: '',
      correo: '',
      celular: '',
      programacion: []
    };
    const nuevosInstructores = [...instructores, nuevoInstructor];
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // Eliminar un instructor
  const eliminarInstructor = (id) => {
    const nuevosInstructores = instructores.filter(inst => inst.id !== id);
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // Actualizar campos de un instructor específico
  const actualizarCampo = (id, campo, valor) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        return { ...inst, [campo]: valor };
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // Agregar un nuevo mes a un instructor específico
  const agregarMes = (id) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const numMes = inst.programacion.length + 1;
        const nuevoInstructor = { ...inst };
        nuevoInstructor.programacion.push({
          mes: numMes,
          rangos: []
        });
        return nuevoInstructor;
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // Agregar un nuevo rango a un mes específico
  const agregarRango = (id, indexMes) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevoInstructor = { ...inst };
        nuevoInstructor.programacion[indexMes].rangos.push({
          desde: '',
          hasta: '',
          hora_inicio: '08:00',
          hora_fin: '16:00'
        });
        return nuevoInstructor;
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // Actualizar un campo de rango específico
  const actualizarRango = (id, indexMes, indexRango, campo, valor) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevoInstructor = { ...inst };
        nuevoInstructor.programacion[indexMes].rangos[indexRango][campo] = valor;
        return nuevoInstructor;
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // Eliminar un rango específico
  const eliminarRango = (id, indexMes, indexRango) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevoInstructor = { ...inst };
        nuevoInstructor.programacion[indexMes].rangos.splice(indexRango, 1);
        return nuevoInstructor;
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // Eliminar un mes completo
  const eliminarMes = (id, indexMes) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevoInstructor = { ...inst };
        nuevoInstructor.programacion.splice(indexMes, 1);
        // Reordenar números de mes
        nuevoInstructor.programacion.forEach((mes, idx) => {
          mes.mes = idx + 1;
        });
        return nuevoInstructor;
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  // ===== FUNCIÓN DE VALIDACIÓN =====
  const validarProgramacion = () => {
    const errores = [];

    instructores.forEach((instructor, idx) => {
      if (instructor.programacion.length === 0) {
        errores.push(`Instructor ${idx + 1}: Debe agregar al menos un mes de programación`);
      }

      instructor.programacion.forEach((mes, mIdx) => {
        if (mes.rangos.length === 0) {
          errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Debe agregar al menos un rango de fechas`);
        }

        mes.rangos.forEach((rango, rIdx) => {
          if (!rango.desde) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}, Rango ${rIdx + 1}: La fecha "desde" es obligatoria`);
          }
          if (!rango.hasta) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}, Rango ${rIdx + 1}: La fecha "hasta" es obligatoria`);
          }

          if (rango.desde && rango.hasta) {
            const fechaDesde = new Date(rango.desde);
            const fechaHasta = new Date(rango.hasta);
            if (fechaHasta <= fechaDesde) {
              errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: La fecha "hasta" debe ser posterior a la fecha "desde"`);
            }
          }

          // Validar horarios
          const [hInicio, mInicio] = rango.hora_inicio.split(':').map(Number);
          const [hFin, mFin] = rango.hora_fin.split(':').map(Number);
          const minutosInicio = hInicio * 60 + mInicio;
          const minutosFin = hFin * 60 + mFin;

          if (minutosFin <= minutosInicio) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: La hora fin debe ser mayor a la hora inicio`);
          }
          if (minutosFin - minutosInicio < 60) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: La duración mínima es 1 hora`);
          }
          if (minutosFin - minutosInicio > 600) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: La duración máxima es 10 horas`);
          }
          if (minutosInicio < 6 * 60) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: La hora inicio no puede ser antes de las 06:00`);
          }
          if (minutosFin > 22 * 60) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: La hora fin no puede ser después de las 22:00`);
          }
        });

        // Validar que los rangos no se solapen
        if (mes.rangos.length > 1) {
          const rangosOrdenados = [...mes.rangos].sort((a, b) => new Date(a.desde) - new Date(b.desde));
          for (let i = 0; i < rangosOrdenados.length - 1; i++) {
            if (new Date(rangosOrdenados[i + 1].desde) <= new Date(rangosOrdenados[i].hasta)) {
              errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Los rangos de fechas no pueden solaparse`);
            }
          }
        }
      });
    });

    return errores;
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>👨‍🏫 Instructores Campesena</h3>
      <p style={styles.subtitle}>Agregue los instructores necesarios y su programación</p>
      
      {instructores.map((instructor, idx) => (
        <div key={instructor.id} style={styles.instructorBox}>
          <div style={styles.instructorHeader}>
            <h4 style={styles.instructorTitle}>Instructor {idx + 1}</h4>
            {instructores.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarInstructor(instructor.id)}
                style={styles.removeInstructorButton}
              >
                ✕ Eliminar instructor
              </button>
            )}
          </div>

          {/* ===== SELECCIÓN DE TIPO ===== */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Instructor:</label>
            <select
              value={instructor.tipo}
              onChange={(e) => actualizarCampo(instructor.id, 'tipo', e.target.value)}
              style={styles.select}
            >
              <option value="Técnico">🔧 Técnico</option>
              <option value="Empresarial">💼 Empresarial</option>
              <option value="Popular">👥 Popular</option>
            </select>
          </div>

          {/* ===== DATOS PERSONALES ===== */}
          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Tipo ID:</label>
              <select
                value={instructor.tipo_identificacion}
                onChange={(e) => actualizarCampo(instructor.id, 'tipo_identificacion', e.target.value)}
                style={styles.select}
              >
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
                <option value="PAP">PAP</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Identificación:</label>
              <input
                type="text"
                value={instructor.identificacion}
                onChange={(e) => actualizarCampo(instructor.id, 'identificacion', e.target.value)}
                style={styles.input}
                placeholder="12345678"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre completo:</label>
            <input
              type="text"
              value={instructor.nombre}
              onChange={(e) => actualizarCampo(instructor.id, 'nombre', e.target.value)}
              style={styles.input}
              placeholder="Nombre completo"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Correo:</label>
              <input
                type="email"
                value={instructor.correo}
                onChange={(e) => actualizarCampo(instructor.id, 'correo', e.target.value)}
                style={styles.input}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Celular:</label>
              <input
                type="tel"
                value={instructor.celular}
                onChange={(e) => actualizarCampo(instructor.id, 'celular', e.target.value)}
                style={styles.input}
                placeholder="3001234567"
              />
            </div>
          </div>

          {/* ===== PROGRAMACIÓN POR MESES ===== */}
          <h5 style={styles.programacionTitle}>📅 Programación por Meses</h5>
          
          {instructor.programacion.map((mes, mIdx) => (
            <div key={mIdx} style={styles.mesBox}>
              <div style={styles.mesHeader}>
                <h6 style={styles.mesTitle}>Mes {mes.mes}</h6>
                <button
                  type="button"
                  onClick={() => eliminarMes(instructor.id, mIdx)}
                  style={styles.removeMesButton}
                  title="Eliminar este mes"
                >
                  ✕ Eliminar mes
                </button>
              </div>

              {/* RANGOS DE FECHAS */}
              {mes.rangos.map((rango, rIdx) => (
                <div key={rIdx} style={styles.rangoBox}>
                  <div style={styles.rangoHeader}>
                    <span style={styles.rangoTitle}>Rango {rIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => eliminarRango(instructor.id, mIdx, rIdx)}
                      style={styles.removeRangoButton}
                      title="Eliminar este rango"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={styles.row}>
                    <div style={styles.half}>
                      <label style={styles.label}>Desde:</label>
                      <input
                        type="date"
                        value={rango.desde}
                        onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'desde', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.half}>
                      <label style={styles.label}>Hasta:</label>
                      <input
                        type="date"
                        value={rango.hasta}
                        onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'hasta', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.half}>
                      <label style={styles.label}>Hora inicio:</label>
                      <input
                        type="time"
                        value={rango.hora_inicio}
                        onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'hora_inicio', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.half}>
                      <label style={styles.label}>Hora fin:</label>
                      <input
                        type="time"
                        value={rango.hora_fin}
                        onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'hora_fin', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => agregarRango(instructor.id, mIdx)}
                style={styles.addRangoButton}
              >
                + Agregar rango de fechas
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => agregarMes(instructor.id)}
            style={styles.addMesButton}
          >
            + Agregar nuevo mes
          </button>
        </div>
      ))}

      {/* Botón para agregar nuevo instructor */}
      <button
        type="button"
        onClick={agregarInstructor}
        style={styles.addInstructorButton}
      >
        + Agregar nuevo instructor
      </button>

      {/* Botón para validar */}
      <div style={styles.validationBox}>
        <button
          type="button"
          onClick={() => {
            const errores = validarProgramacion();
            if (errores.length > 0) {
              alert('❌ Errores de validación:\n- ' + errores.join('\n- '));
            } else {
              alert('✅ Validación exitosa');
            }
          }}
          style={styles.validateButton}
        >
          Validar programación
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    marginTop: '20px'
  },
  title: {
    color: '#2c3e50',
    marginBottom: '5px',
    fontSize: '20px'
  },
  subtitle: {
    color: '#7f8c8d',
    marginBottom: '20px',
    fontSize: '14px'
  },
  instructorBox: {
    backgroundColor: '#f0f7ff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '2px solid #3498db'
  },
  instructorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  instructorTitle: {
    color: '#3498db',
    margin: 0,
    fontSize: '18px'
  },
  removeInstructorButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  programacionTitle: {
    color: '#2c3e50',
    margin: '20px 0 10px 0',
    fontSize: '16px',
    borderBottom: '1px solid #3498db',
    paddingBottom: '5px'
  },
  mesBox: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #3498db'
  },
  mesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  mesTitle: {
    color: '#27ae60',
    margin: 0,
    fontSize: '15px',
    fontWeight: 'bold'
  },
  removeMesButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  rangoBox: {
    backgroundColor: '#f9f9f9',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '10px',
    border: '1px solid #e0e0e0'
  },
  rangoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  rangoTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#34495e'
  },
  removeRangoButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '15px'
  },
  row: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'flex-end'
  },
  half: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#34495e'
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px'
  },
  select: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'white'
  },
  addRangoButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    marginTop: '5px'
  },
  addMesButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  addInstructorButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    marginBottom: '20px'
  },
  validationBox: {
    marginTop: '20px',
    textAlign: 'center'
  },
  validateButton: {
    padding: '12px 24px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default FormularioCampesenaCompleto;