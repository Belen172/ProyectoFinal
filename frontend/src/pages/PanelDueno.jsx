// React y useState, useEffect probablemente ya están importados arriba.
// IMPORTANTE: Asegúrate de que tienes `import api from '../api';` al inicio del archivo, si no, ponlo tú arriba.

import { useState, useEffect } from 'react';
import api from '../api';

const ESTADOS_SERVICIO = [
  'INGRESADO',
  'PENDIENTE',
  'EN_REPARACION',
  'TERMINADO',
  'ENTREGADO',
];

function textoDueño(usuario, sinAsignar) {
  if (!usuario) return sinAsignar;
  const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim();
  if (nombreCompleto) {
    return `${nombreCompleto} (ID: ${usuario.id})`;
  }
  return `ID: ${usuario.id}`;
}

export default function PanelDueno() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('');
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [nuevoUsuarioId, setNuevoUsuarioId] = useState('');
  const [bicicletas, setBicicletas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [biciSeleccionada, setBiciSeleccionada] = useState(null); // null significa que no hay ninguna seleccionada al principio
  const [serviciosBici, setServiciosBici] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [mostrandoFormServicio, setMostrandoFormServicio] = useState(false);
  const [nuevoProblema, setNuevoProblema] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [cargandoUsuariosModal, setCargandoUsuariosModal] = useState(false);

  // Simula la llamada a la API para obtener bicicletas
  async function traerBicicletas() {
    setCargando(true);
    try {
      const res = await api.get('/bicicletas');
      setBicicletas(res.data);
    } catch (error) {
      console.error(error);
    }
    setCargando(false);
  }

  // Cargar bicicletas al iniciar
  useEffect(() => {
    traerBicicletas();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function traerServiciosDeBici() {
      // 1. Si no hay bici, limpiamos y cortamos acá
      if (!biciSeleccionada) {
        setServiciosBici([]);
        setCargandoServicios(false);
        return;
      }

      setCargandoServicios(true);
      try {
        // 2. Pedimos TODOS los servicios al backend
        const res = await api.get('/servicios');
        const todosServicios = Array.isArray(res.data) ? res.data : [];
        
        // 3. Filtramos a mano acá en React
        const serviciosFiltrados = todosServicios.filter(
          (servicio) => servicio.bicicleta && servicio.bicicleta.id === biciSeleccionada.id
        );

        // 4. Guardamos solo los que pasaron el filtro
        setServiciosBici(serviciosFiltrados);
        
      } catch (error) {
        console.error("Error al traer servicios:", error);
        setServiciosBici([]);
      } finally {
        setCargandoServicios(false);
      }
    }

    traerServiciosDeBici();
  }, [biciSeleccionada]);

  useEffect(() => {
    if (!modalAbierto) return;
    let cancelado = false;
    async function cargarUsuariosParaDueño() {
      setCargandoUsuariosModal(true);
      try {
        const res = await api.get('/usuarios');
        if (!cancelado) {
          setUsuariosDisponibles(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error(error);
        if (!cancelado) {
          setUsuariosDisponibles([]);
          alert('No se pudo cargar la lista de dueños');
        }
      } finally {
        if (!cancelado) setCargandoUsuariosModal(false);
      }
    }
    cargarUsuariosParaDueño();
    return () => {
      cancelado = true;
    };
  }, [modalAbierto]);

  // Manejar apertura/cierre del modal
  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => {
    setModalAbierto(false);
    setNuevaMarca('');
    setNuevoModelo('');
    setNuevoTipo('');
    setNuevaObservacion('');
    setNuevoUsuarioId('');
  };

  // Manejar creación
  const manejarCrearBici = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bicicletas', {
        marca: nuevaMarca,
        modelo: nuevoModelo,
        tipo: nuevoTipo,
        observaciones: nuevaObservacion,
        usuarioId: Number(nuevoUsuarioId)
      });
      cerrarModal();
      await traerBicicletas();
    } catch (error) {
      alert('Error creando la bici');
      console.error(error);
    }
  };

  // Manejar eliminación
  const manejarEliminarBici = async (id) => {

    const confirmacion = window.confirm('¿Estás segura de que querés eliminar esta bicicleta?');
    
    if (confirmacion) {
      try {
        // Le mandamos el método DELETE a NestJS con el ID de la bici en la URL
        await api.delete(`/bicicletas/${id}`);
        
        // Si todo salió bien, volvemos a pedir la lista actualizada
        await traerBicicletas();
      } catch (error) {
        alert('Hubo un error al eliminar la bicicleta');
        console.error(error);
      }
    }
  };

  const cerrarModalDetalles = () => {
    setBiciSeleccionada(null);
    setMostrandoFormServicio(false);
    setNuevoProblema('');
    setNuevoPrecio('');
  };

  const cancelarFormServicio = () => {
    setMostrandoFormServicio(false);
    setNuevoProblema('');
    setNuevoPrecio('');
  };

  const manejarCrearServicio = async (e) => {
    e.preventDefault();
    if (!biciSeleccionada) return;
    try {
      await api.post('/servicios', {
        problema_informado: nuevoProblema,
        precio: Number(nuevoPrecio),
        bicicletaId: biciSeleccionada.id,
        estado: 'INGRESADO',
      });
      setMostrandoFormServicio(false);
      setNuevoProblema('');
      setNuevoPrecio('');
      setCargandoServicios(true);
      try {
        const res = await api.get('/servicios');
        const todosServicios = Array.isArray(res.data) ? res.data : [];
        const serviciosFiltrados = todosServicios.filter(
          (servicio) => servicio.bicicleta && servicio.bicicleta.id === biciSeleccionada.id
        );
        setServiciosBici(serviciosFiltrados);
      } catch (error) {
        console.error(error);
        setServiciosBici([]);
      } finally {
        setCargandoServicios(false);
      }
    } catch (error) {
      alert('Error al crear el servicio');
      console.error(error);
    }
  };

  const manejarCambioEstado = async (servicioId, nuevoEstado) => {
    try {
      await api.patch(`/servicios/${servicioId}`, { estado: nuevoEstado });
      setServiciosBici((prev) =>
        prev.map((s) => (s.id === servicioId ? { ...s, estado: nuevoEstado } : s))
      );
    } catch (error) {
      alert('No se pudo actualizar el estado del servicio');
      console.error(error);
    }
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Panel de Control - Dueño</h2>
        <button className="btn btn-success" onClick={abrirModal}>+ Nueva Bicicleta</button>
      </div>
      {/* Modal Bootstrap 5 */}
      {modalAbierto && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={manejarCrearBici}>
                <div className="modal-header">
                  <h5 className="modal-title">Registrar Bicicleta</h5>
                  <button type="button" className="btn-close" onClick={cerrarModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nuevaMarca}
                      onChange={e => setNuevaMarca(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Modelo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nuevoModelo}
                      onChange={e => setNuevoModelo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo de Bicicleta</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Pista, Paseo, Ruta..."
                      value={nuevoTipo}
                      onChange={e => setNuevoTipo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Observaciones Generales</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dueño de la bicicleta</label>
                    {cargandoUsuariosModal ? (
                      <div className="text-center py-2">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status">
                          <span className="visually-hidden">Cargando dueños...</span>
                        </div>
                      </div>
                    ) : usuariosDisponibles.length === 0 ? (
                      <p className="form-text text-danger mb-0">
                        No hay usuarios registrados. Creá un usuario antes de asignar una bicicleta.
                      </p>
                    ) : (
                      <select
                        className="form-select"
                        value={nuevoUsuarioId}
                        onChange={(e) => setNuevoUsuarioId(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Seleccioná el dueño…
                        </option>
                        {usuariosDisponibles.map((u) => (
                          <option key={u.id} value={String(u.id)}>
                            {textoDueño(u, '')}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={cargandoUsuariosModal || usuariosDisponibles.length === 0}
                  >
                    Crear Bicicleta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de la Bicicleta */}
      {biciSeleccionada && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Ficha Técnica - Bici #{biciSeleccionada.id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarModalDetalles}></button>
              </div>
              
              <div className="modal-body">
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Información General</h6>
                  <p className="mb-1"><strong>Marca:</strong> {biciSeleccionada.marca}</p>
                  <p className="mb-1"><strong>Modelo:</strong> {biciSeleccionada.modelo}</p>
                  <p className="mb-1"><strong>Tipo:</strong> {biciSeleccionada.tipo}</p>
                  <p className="mb-1"><strong>Dueño:</strong> {textoDueño(biciSeleccionada.usuario, 'No registrado')}</p>
                </div>
                
                <hr />
                
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <h6 className="text-muted mb-0">Historial de Servicios</h6>
                    {!mostrandoFormServicio && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setMostrandoFormServicio(true)}
                      >
                        + Cargar Servicio
                      </button>
                    )}
                  </div>
                  {cargandoServicios && !mostrandoFormServicio ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Cargando servicios...</span>
                      </div>
                    </div>
                  ) : mostrandoFormServicio ? (
                    <form onSubmit={manejarCrearServicio} className="border rounded p-3 bg-light">
                      <div className="mb-3">
                        <label className="form-label">Problema Informado</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={nuevoProblema}
                          onChange={(e) => setNuevoProblema(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Precio</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={nuevoPrecio}
                          onChange={(e) => setNuevoPrecio(e.target.value)}
                          required
                        />
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={cancelarFormServicio}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-success btn-sm">
                          Guardar
                        </button>
                      </div>
                    </form>
                  ) : serviciosBici.length === 0 ? (
                    <div className="alert alert-light border text-center p-3 mb-0">
                      <small className="text-muted">No hay historial de servicios para esta bicicleta.</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-striped align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Fecha ingreso</th>
                            <th>Problema</th>
                            <th>Estado</th>
                            <th>Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviciosBici.map((servicio) => (
                            <tr key={servicio.id}>
                              <td>{new Date(servicio.fecha_ingreso).toLocaleDateString() || '-'}</td>
                              <td>{servicio.problema_informado || '-'}</td>
                              <td style={{ minWidth: '11rem' }}>
                                <select
                                  className="form-select form-select-sm"
                                  value={servicio.estado}
                                  onChange={(e) =>
                                    manejarCambioEstado(servicio.id, e.target.value)
                                  }
                                >
                                  {ESTADOS_SERVICIO.map((estado) => (
                                    <option key={estado} value={estado}>
                                      {estado}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>{servicio.precio ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModalDetalles}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Bicicletas Registradas</h5>

          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : bicicletas.length === 0 ? (
            <p className="text-center text-muted my-4">No hay bicicletas registradas todavía.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Dueño</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bicicletas.map((bici) => (
                    <tr key={bici.id}>
                      <td>#{bici.id}</td>
                      <td><strong>{bici.marca}</strong></td>
                      <td>{bici.modelo}</td>
                      <td>{textoDueño(bici.usuario, 'Sin asignar')}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setBiciSeleccionada(bici)}
                        >
                          Ver Detalles
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => manejarEliminarBici(bici.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}