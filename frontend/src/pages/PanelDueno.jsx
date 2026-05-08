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
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [biciEditando, setBiciEditando] = useState(null);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [nuevoColor, setNuevoColor] = useState('');
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
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrandoFormCliente, setMostrandoFormCliente] = useState(false);
  const [nuevoCliNombre, setNuevoCliNombre] = useState('');
  const [nuevoCliApellido, setNuevoCliApellido] = useState('');
  const [nuevoCliCuit, setNuevoCliCuit] = useState('');
  const [nuevoCliDni, setNuevoCliDni] = useState('');
  const [nuevoCliTelefono, setNuevoCliTelefono] = useState('');
  const [nuevoCliEmail, setNuevoCliEmail] = useState('');
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [errorCrearCliente, setErrorCrearCliente] = useState('');
  const [errorEditarBici, setErrorEditarBici] = useState('');
  const [busquedaBici, setBusquedaBici] = useState('');

  /* const busquedaClienteNormalizada = busquedaCliente.trim().toLowerCase();
  const usuariosFiltrados = usuariosDisponibles.filter((u) => {
    if (!busquedaClienteNormalizada) return true;
    const textoBusqueda = `${u?.nombre ?? ''} ${u?.apellido ?? ''} ${u?.dni ?? ''}`.toLowerCase();
    return textoBusqueda.includes(busquedaClienteNormalizada);
  }); */

  const usuariosFiltrados = usuariosDisponibles.filter((u) => {
    if (!busquedaCliente) return true;

    // Mini-función que saca mayúsculas y tildes (ej: "José" -> "jose")
    const limpiarTexto = (texto) => {
      return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Esto borra los acentos invisibles
    };

    // Limpiamos lo que escribió el usuario en el buscador
    const busqueda = limpiarTexto(busquedaCliente.trim());

    // Juntamos y limpiamos los datos del cliente de la base de datos
    const datosCliente = limpiarTexto(`${u.nombre || ''} ${u.apellido || ''} ${u.dni || ''}`);

    return datosCliente.includes(busqueda);
  });

  const bicicletasFiltradas = (() => {
    const limpiarTexto = (texto) =>
      String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const busquedaLimpia = limpiarTexto(busquedaBici.trim());

    const obtenerUltimaActividad = (bici) => {
      const servicios = Array.isArray(bici?.servicios) ? bici.servicios : [];
      if (servicios.length === 0) {
        return -Number(bici?.id || 0);
      }

      const maxIdServicio = servicios.reduce((maxId, servicio) => {
        const idNumerico = Number(servicio?.id);
        return Number.isFinite(idNumerico) ? Math.max(maxId, idNumerico) : maxId;
      }, Number.NEGATIVE_INFINITY);

      if (maxIdServicio !== Number.NEGATIVE_INFINITY) {
        return maxIdServicio;
      }

      const maxFechaServicio = servicios.reduce((maxFecha, servicio) => {
        const fechaMs = new Date(servicio?.fecha_ingreso || servicio?.createdAt || 0).getTime();
        return Number.isFinite(fechaMs) ? Math.max(maxFecha, fechaMs) : maxFecha;
      }, Number.NEGATIVE_INFINITY);

      if (maxFechaServicio !== Number.NEGATIVE_INFINITY) {
        return maxFechaServicio;
      }

      return -Number(bici?.id || 0);
    };

    return bicicletas
      .filter((bici) => {
        if (!busquedaLimpia) return true;
        const textoBici = limpiarTexto(`${bici?.marca || ''} ${bici?.modelo || ''} ${bici?.color || ''}`);
        const textoDueño = limpiarTexto(`${bici?.usuario?.nombre || ''} ${bici?.usuario?.apellido || ''}`);
        return textoBici.includes(busquedaLimpia) || textoDueño.includes(busquedaLimpia);
      })
      .sort((a, b) => obtenerUltimaActividad(b) - obtenerUltimaActividad(a))
      .slice(0, 10);
  })();

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
    setNuevoColor('');
    setNuevoTipo('');
    setNuevaObservacion('');
    setNuevoUsuarioId('');
    setBusquedaCliente('');
    setMostrandoFormCliente(false);
    setNuevoCliNombre('');
    setNuevoCliApellido('');
    setNuevoCliCuit('');
    setNuevoCliDni('');
    setNuevoCliTelefono('');
    setNuevoCliEmail('');
    setGuardandoCliente(false);
    setErrorCrearCliente('');
  };

  // Manejar creación
  const manejarCrearBici = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bicicletas', {
        marca: nuevaMarca,
        modelo: nuevoModelo,
        color: nuevoColor,
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

  const manejarCrearCliente = async () => {
    setErrorCrearCliente('');
    setGuardandoCliente(true);
    try {
      const resCreado = await api.post('/usuarios', {
        nombre: nuevoCliNombre,
        apellido: nuevoCliApellido,
        dni: nuevoCliDni,
        telefono: nuevoCliTelefono,
        email: nuevoCliEmail,
        password: nuevoCliDni,
      });

      const resUsuarios = await api.get('/usuarios');
      const listaActualizada = Array.isArray(resUsuarios.data) ? resUsuarios.data : [];
      setUsuariosDisponibles(listaActualizada);

      const creadoDesdePost = resCreado?.data?.id;
      const usuarioCreado =
        listaActualizada.find((u) => String(u.id) === String(creadoDesdePost)) ||
        listaActualizada.find(
          (u) =>
            String(u?.dni ?? '') === String(nuevoCliDni).trim() &&
            String(u?.email ?? '').toLowerCase() === String(nuevoCliEmail).trim().toLowerCase()
        );

      if (usuarioCreado?.id !== undefined) {
        setNuevoUsuarioId(String(usuarioCreado.id));
      }

      setNuevoCliNombre('');
      setNuevoCliApellido('');
      setNuevoCliCuit('');
      setNuevoCliDni('');
      setNuevoCliTelefono('');
      setNuevoCliEmail('');
      setBusquedaCliente('');
      setMostrandoFormCliente(false);
      setErrorCrearCliente('');
    } catch (error) {
      console.error(error);
      const mensajeBackend = error?.response?.data?.message;
      const mensajeFinal = Array.isArray(mensajeBackend)
        ? mensajeBackend.join(' ')
        : mensajeBackend || 'No se pudo crear el cliente. Revisá los datos e intentá nuevamente.';
      setErrorCrearCliente(mensajeFinal);
    } finally {
      setGuardandoCliente(false);
    }
  };

  const manejarCambioCuitCliente = (valorCuit) => {
    setNuevoCliCuit(valorCuit);

    const cuitLimpio = valorCuit.replace(/[^\d]/g, '');
    if (cuitLimpio.length === 11) {
      const dniDesdeCuit = cuitLimpio.slice(2, 10);
      setNuevoCliDni(dniDesdeCuit);
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

  const abrirModalEditar = (bici) => {
    setBiciEditando({
      id: bici?.id,
      marca: bici?.marca || '',
      modelo: bici?.modelo || '',
      tipo: bici?.tipo || '',
      color: bici?.color || '',
      observaciones: bici?.observaciones || '',
    });
    setErrorEditarBici('');
    setModalEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setBiciEditando(null);
    setErrorEditarBici('');
  };

  const guardarEdicionBici = async (e) => {
    e.preventDefault();
    if (!biciEditando?.id) return;

    try {
      await api.patch(`/bicicletas/${biciEditando.id}`, {
        marca: biciEditando.marca,
        modelo: biciEditando.modelo,
        tipo: biciEditando.tipo,
        color: biciEditando.color,
        observaciones: biciEditando.observaciones,
      });
      await traerBicicletas();
      cerrarModalEditar();
      setErrorEditarBici('');
    } catch (error) {
      console.error(error);
      setErrorEditarBici('No se pudo guardar la edición de la bicicleta');
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

  const actualizarDetalleServicio = async (servicioId, nuevoTexto) => {
    try {
      await api.patch(`/servicios/${servicioId}`, { trabajo_realizado: nuevoTexto });
      setServiciosBici((prev) =>
        prev.map((s) =>
          s.id === servicioId ? { ...s, trabajo_realizado: nuevoTexto } : s
        )
      );
    } catch (error) {
      alert('No se pudo actualizar el trabajo realizado');
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
                    <label className="form-label">Color</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nuevoColor}
                      onChange={e => setNuevoColor(e.target.value)}
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
                      <>
                        {!mostrandoFormCliente ? (
                          <>
                            {/* CONTENEDOR PRINCIPAL DEL AUTOCOMPLETE */}
                            <div className="position-relative mb-3">
                              
                              {/* 1. EL BUSCADOR Y EL BOTÓN NUEVO */}
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Buscar o seleccionar dueño..."
                                  value={busquedaCliente}
                                  onChange={(e) => {
                                    setBusquedaCliente(e.target.value);
                                    setNuevoUsuarioId(''); // Limpiamos el ID si vuelve a escribir
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setMostrandoFormCliente(true);
                                    setErrorCrearCliente('');
                                  }}
                                >
                                  + Nuevo
                                </button>
                              </div>

                              {/* 2. LA LISTA DESPLEGABLE FLOTANTE (Solo se ve si está buscando y no eligió a nadie) */}
                              {busquedaCliente && !nuevoUsuarioId && usuariosFiltrados.length > 0 && (
                                <div 
                                  className="list-group position-absolute w-100 shadow" 
                                  style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', top: '100%' }}
                                >
                                  {usuariosFiltrados.map((u) => (
                                    <button
                                      key={u.id}
                                      type="button"
                                      className="list-group-item list-group-item-action text-start"
                                      onClick={() => {
                                        // Cuando hace clic, guardamos el ID y escribimos el nombre en el input
                                        setNuevoUsuarioId(String(u.id));
                                        setBusquedaCliente(`${u.nombre || ''} ${u.apellido || ''} (ID: ${u.id})`.trim());
                                      }}
                                    >
                                      <strong>{u.nombre || ''} {u.apellido || ''}</strong> 
                                      <span className="text-muted ms-2" style={{ fontSize: '0.85em' }}>
                                        {u.dni ? `DNI: ${u.dni}` : `ID: ${u.id}`}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* 3. MENSAJE SI NO ENCUENTRA NADA */}
                              {busquedaCliente && !nuevoUsuarioId && usuariosFiltrados.length === 0 && (
                                <p className="form-text text-danger mb-0 mt-1">
                                  No hay resultados. Por favor, hacé clic en "+ Nuevo" para registrarlo.
                                </p>
                              )}
                              
                            </div>
                          </>
                        ) : (
                          <div className="border rounded p-2 bg-light">
                            <div className="row g-2">
                              <div className="col-12 col-md-6">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Nombre"
                                  value={nuevoCliNombre}
                                  onChange={(e) => setNuevoCliNombre(e.target.value)}
                                />
                              </div>
                              <div className="col-12 col-md-6">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Apellido"
                                  value={nuevoCliApellido}
                                  onChange={(e) => setNuevoCliApellido(e.target.value)}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="CUIT/CUIL"
                                  value={nuevoCliCuit}
                                  onChange={(e) => manejarCambioCuitCliente(e.target.value)}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="DNI"
                                  value={nuevoCliDni}
                                  onChange={(e) => setNuevoCliDni(e.target.value)}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Teléfono"
                                  value={nuevoCliTelefono}
                                  onChange={(e) => setNuevoCliTelefono(e.target.value)}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <input
                                  type="email"
                                  className="form-control form-control-sm"
                                  placeholder="Email"
                                  value={nuevoCliEmail}
                                  onChange={(e) => setNuevoCliEmail(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-2">
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setMostrandoFormCliente(false);
                                  setNuevoCliNombre('');
                                  setNuevoCliApellido('');
                                  setNuevoCliCuit('');
                                  setNuevoCliDni('');
                                  setNuevoCliTelefono('');
                                  setNuevoCliEmail('');
                                  setErrorCrearCliente('');
                                }}
                                disabled={guardandoCliente}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={manejarCrearCliente}
                                disabled={
                                  guardandoCliente ||
                                  !nuevoCliNombre.trim() ||
                                  !nuevoCliApellido.trim() ||
                                  !nuevoCliDni.trim() ||
                                  !nuevoCliTelefono.trim() ||
                                  !nuevoCliEmail.trim()
                                }
                              >
                                {guardandoCliente ? 'Guardando...' : 'Guardar Cliente'}
                              </button>
                            </div>
                            {errorCrearCliente && (
                              <div className="alert alert-danger py-1 px-2 mt-2 mb-0" role="alert">
                                <small>{errorCrearCliente}</small>
                              </div>
                            )}
                          </div>
                        )}
                      </>
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

      {modalEditarAbierto && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={guardarEdicionBici}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar Bicicleta</h5>
                  <button type="button" className="btn-close" onClick={cerrarModalEditar}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <input
                      type="text"
                      className="form-control"
                      value={biciEditando?.marca || ''}
                      onChange={(e) =>
                        setBiciEditando((prev) => ({ ...prev, marca: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Modelo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={biciEditando?.modelo || ''}
                      onChange={(e) =>
                        setBiciEditando((prev) => ({ ...prev, modelo: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={biciEditando?.tipo || ''}
                      onChange={(e) =>
                        setBiciEditando((prev) => ({ ...prev, tipo: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input
                      type="text"
                      className="form-control"
                      value={biciEditando?.color || ''}
                      onChange={(e) =>
                        setBiciEditando((prev) => ({ ...prev, color: e.target.value }))
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Observaciones</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={biciEditando?.observaciones || ''}
                      onChange={(e) =>
                        setBiciEditando((prev) => ({ ...prev, observaciones: e.target.value }))
                      }
                    />
                  </div>
                  {errorEditarBici && (
                    <div className="alert alert-danger py-2 mb-0" role="alert">
                      {errorEditarBici}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalEditar}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Guardar cambios
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
          <div className="modal-dialog modal-xl" style={{ maxWidth: '1200px' }}>
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
                      <table className="table table-striped align-middle mb-0">
                        <thead>
                          <tr>
                            <th style={{ minWidth: '7rem' }}>Fecha ingreso</th>
                            <th style={{ minWidth: '12rem' }}>Problema</th>
                            <th style={{ minWidth: '18rem' }}>Trabajo Realizado</th>
                            <th style={{ minWidth: '12rem' }}>Estado</th>
                            <th style={{ minWidth: '7rem' }}>Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviciosBici.map((servicio) => (
                            <tr key={servicio.id}>
                              <td>{new Date(servicio.fecha_ingreso).toLocaleDateString() || '-'}</td>
                              <td>{servicio.problema_informado || '-'}</td>
                              <td style={{ minWidth: '18rem' }}>
                                <textarea
                                  className="form-control form-control-sm border-0 shadow-none"
                                  rows={2}
                                  defaultValue={servicio.trabajo_realizado || ''}
                                  placeholder="Detalle del trabajo..."
                                  style={{ resize: 'vertical', backgroundColor: 'transparent', borderColor: 'transparent' }}
                                  onFocus={(e) => {
                                    e.target.style.borderColor = '#86b7fe';
                                    e.target.style.backgroundColor = '#fff';
                                  }}
                                  onBlur={(e) => {
                                    const nuevoTexto = e.target.value.trim();
                                    const textoPrevio = (servicio.trabajo_realizado || '').trim();
                                    e.target.style.borderColor = 'transparent';
                                    e.target.style.backgroundColor = 'transparent';
                                    if (nuevoTexto !== textoPrevio) {
                                      actualizarDetalleServicio(servicio.id, nuevoTexto);
                                    }
                                  }}
                                />
                              </td>
                              <td style={{ minWidth: '12rem' }}>
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
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por marca, modelo, color o dueño..."
              value={busquedaBici}
              onChange={(e) => setBusquedaBici(e.target.value)}
            />
            <p className="text-muted small mt-2 mb-0">
              Mostrando las 10 bicicletas con actividad m&aacute;s reciente.
            </p>
          </div>

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
                    <th>Color</th>
                    <th>Dueño</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bicicletasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No se encontraron bicicletas
                      </td>
                    </tr>
                  ) : (
                    bicicletasFiltradas.map((bici) => (
                      <tr key={bici.id}>
                        <td>#{bici.id}</td>
                        <td><strong>{bici.marca}</strong></td>
                        <td>{bici.modelo}</td>
                        <td>{bici.color || 'No especificado'}</td>
                        <td>{textoDueño(bici.usuario, 'Sin asignar')}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setBiciSeleccionada(bici)}
                          >
                            Ver Detalles
                          </button>
                        <button
                          className="btn btn-outline-warning btn-sm mx-1"
                          onClick={() => abrirModalEditar(bici)}
                        >
                          Editar
                        </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => manejarEliminarBici(bici.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
