import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ChalkboardLayout from '../components/ChalkboardLayout';
import logoTaller from '../assets/logo.png';
import { createPortal } from 'react-dom'; // Para renderizar el modal en el body

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
  const navigate = useNavigate();

  // NUEVO: Estado para vista activa del tab
  const [vistaActiva, setVistaActiva] = useState('bicicletas'); // 'bicicletas' | 'clientes'

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
  const [biciSeleccionada, setBiciSeleccionada] = useState(null);
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

  // NUEVO: Estados y cargadores propios para la vista Clientes (traemos TODOS, con sus bicicletas)
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);

  // Utilidad para limpiar texto (acentos, mayúsculas...)
  const limpiarTexto = (texto) =>
    String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Clientes filtrados según búsqueda. Solo filtra por nombre, apellido o dni/cuit
  const clientesFiltrados = clientes.filter((cli) => {
    if (!busquedaCliente) return true;
    const busq = limpiarTexto(busquedaCliente.trim());
    const datos =
      limpiarTexto(
        `${cli.nombre || ''} ${cli.apellido || ''} ${cli.dni || ''} ${cli.cuit || ''}` // incluimos cuit/dni ambos campos
      );
    return datos.includes(busq);
  });

  // El filtrado de usuariosDisponibles SOLO se usa en el modal de asignar dueño/nuevo cliente
  const usuariosFiltrados = usuariosDisponibles.filter((u) => {
    if (!busquedaCliente) return true;
    const limpiar = (texto) =>
      String(texto || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const busqueda = limpiar(busquedaCliente.trim());
    const datosCliente = limpiar(`${u.nombre || ''} ${u.apellido || ''} ${u.dni || ''}`);
    return datosCliente.includes(busqueda);
  });

  const bicicletasFiltradas = (() => {
    const limpiar = (texto) =>
      String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const busquedaLimpia = limpiar(busquedaBici.trim());
    const obtenerUltimaActividad = (bici) => {
      const servicios = Array.isArray(bici?.servicios) ? bici.servicios : [];
      if (servicios.length === 0) return -Number(bici?.id || 0);
      const maxIdServicio = servicios.reduce((maxId, servicio) => {
        const idNumerico = Number(servicio?.id);
        return Number.isFinite(idNumerico) ? Math.max(maxId, idNumerico) : maxId;
      }, 0);
      return maxIdServicio || -Number(bici?.id || 0);
    };
    const listaBicis = Array.isArray(bicicletas) ? bicicletas : [];
    return listaBicis
      .filter((bici) => {
        if (!busquedaLimpia) return true;
        const textoBici = limpiar(`${bici?.marca || ''} ${bici?.modelo || ''} ${bici?.color || ''}`);
        const textoDuenio = limpiar(`${bici?.usuario?.nombre || ''} ${bici?.usuario?.apellido || ''}`);
        return textoBici.includes(busquedaLimpia) || textoDuenio.includes(busquedaLimpia);
      })
      .sort((a, b) => obtenerUltimaActividad(b) - obtenerUltimaActividad(a))
      .slice(0, 10);
  })();

  // Petición inicial bicicletas
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

  // NUEVO: Traer todos los clientes y sus bicis (asume ruta /usuarios es suficiente y trae bicicletas en el objeto)
  async function traerClientes() {
    setCargandoClientes(true);
    try {
      const res = await api.get('/usuarios');
      console.log("DATOS CRUDOS DEL BACKEND:", res.data);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setClientes([]);
    }
    setCargandoClientes(false);
  }

  // Cargar bicicletas al iniciar
  useEffect(() => {
    if (vistaActiva === 'bicicletas') {
      traerBicicletas();
    }
    // eslint-disable-next-line
  }, []);

  // Cuando cambia la pestaña activa, cargar clientes si corresponde
  useEffect(() => {
    if (vistaActiva === 'clientes') {
      // Solo traemos si clientes está vacío para no repedir llamadas innecesarias
      if (clientes.length === 0) {
        traerClientes();
      }
    }
    if (vistaActiva === 'bicicletas') {
      // Si vuelve a bicicletas y no las tenemos, las traemos
      if (bicicletas.length === 0) {
        traerBicicletas();
      }
    }
    // eslint-disable-next-line
  }, [vistaActiva]);

  useEffect(() => {
    async function traerServiciosDeBici() {
      if (!biciSeleccionada) {
        setServiciosBici([]);
        setCargandoServicios(false);
        return;
      }
      setCargandoServicios(true);
      try {
        const res = await api.get('/servicios');
        const todosServicios = Array.isArray(res.data) ? res.data : [];
        const serviciosFiltrados = todosServicios.filter(
          (servicio) => servicio.bicicleta && servicio.bicicleta.id === biciSeleccionada.id
        );
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
        cuit: nuevoCliCuit,
        telefono: nuevoCliTelefono,
        email: nuevoCliEmail,
        password: nuevoCliDni,
      });

      const resUsuarios = await api.get('/usuarios');
      const listaActualizada = Array.isArray(resUsuarios.data) ? resUsuarios.data : [];
      setUsuariosDisponibles(listaActualizada);
      setClientes(listaActualizada);

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

  /* Manejar eliminación
  const manejarEliminarBici = async (id) => {
    const confirmacion = window.confirm('¿Estás segura de que querés eliminar esta bicicleta?');
    if (confirmacion) {
      try {
        await api.delete(`/bicicletas/${id}`);
        await traerBicicletas();
      } catch (error) {
        alert('Hubo un error al eliminar la bicicleta');
        console.error(error);
      }
    }
  }; */

  const archivarBicicleta = async (idBici) => {
    const confirmar = window.confirm("¿Estás segura de que querés archivar esta bicicleta? Ya no aparecerá en la lista activa, pero su historial se mantendrá guardado.");
    
    if (confirmar) {
      try {
        await api.delete(`/bicicletas/${idBici}`);
        // Traigo la lista actualizada desde el backend
        await traerBicicletas();
        
      } catch (error) {
        alert('Hubo un error al archivar la bicicleta');
        console.error("Error al archivar la bicicleta:", error);
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

  const cerrarSesion = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Renderizado principal con ChalkboardLayout
  return (
    <ChalkboardLayout scrollable>
      {/* 1. CONTENEDOR MAESTRO: Control total del ancho */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '1500px', 
          margin: '0 auto', 
          padding: '0 2rem',
          marginTop: '2rem', 
          paddingBottom: '4rem' 
        }}
      >
        
        {/* 2. CABECERA: Título a la izquierda, botones a la derecha */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ 
            fontFamily: "'Oswald', sans-serif", 
            color: '#fff', 
            margin: 0, 
            fontSize: '1.8rem',
            letterSpacing: '1px'
          }}>
            PANEL DE CONTROL - DUEÑO
          </h2>
          
          <div className="d-flex gap-3">
            <button className="btn btn-outline-light btn-sm" onClick={abrirModal}>
              + Nueva Bicicleta
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={cerrarSesion}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* 3. RECUADRO GRANDE: Como está dentro del "container", va a medir exactamente lo mismo que la cabecera */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.09)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1.5px dashed rgba(255, 255, 255, 0.5)',
          borderRadius: '12px',
          padding: '30px',
          color: '#fff',
          minHeight: '550px'
        }}>

        {/* ===== TABS: Bicicletas & Clientes ===== */}
        <ul className="nav nav-tabs border-0 mb-4" role="tablist">
          <li className="nav-item">
            <button 
              className={`nav-link text-uppercase ${vistaActiva === 'bicicletas' ? 'active bg-white text-dark fw-bold' : 'text-white bg-transparent border-0'}`}
              onClick={() => { setVistaActiva('bicicletas'); setBusquedaBici(''); setBusquedaCliente(''); }}
              style={{ letterSpacing: "0.6px" }}
            >
              Bicicletas
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link text-uppercase ${vistaActiva === 'clientes' ? 'active bg-white text-dark fw-bold' : 'text-white bg-transparent border-0'}`}
              onClick={() => { setVistaActiva('clientes'); setBusquedaBici(''); setBusquedaCliente(''); }}
              style={{ letterSpacing: "0.6px" }}
            >
              Clientes
            </button>
          </li>
        </ul>

        {/* ===== FIN TABS ===== */}

        {/* ========================================================================= */}
        {/* MODAL DE EDITAR BICICLETA */}
        {/* ========================================================================= */}
        {modalEditarAbierto && createPortal(
          <div 
            className="modal show d-block" 
            tabIndex="-1" 
            style={{ 
              backgroundColor: "rgba(0, 0, 0, 0.75)", 
              zIndex: 99999 
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '1000px' }}>
              
              <div className="modal-content" style={{
                background: 'rgba(25, 30, 40, 0.95)', 
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '15px', 
                color: '#fff',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
              }}>
                <form onSubmit={guardarEdicionBici}>
                  
                  {/* HEADER MODAL */}
                  <div className="modal-header border-bottom border-secondary">
                    <h5 className="modal-title" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '1px' }}>
                      EDITAR BICICLETA #{biciEditando?.id}
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={cerrarModalEditar}></button>
                  </div>
                  
                  {/* BODY MODAL */}
                  <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Marca</label>
                        <input
                          type="text"
                          className="form-control"
                          value={biciEditando?.marca || ''}
                          onChange={(e) => setBiciEditando((prev) => ({ ...prev, marca: e.target.value }))}
                          required
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Modelo</label>
                        <input
                          type="text"
                          className="form-control"
                          value={biciEditando?.modelo || ''}
                          onChange={(e) => setBiciEditando((prev) => ({ ...prev, modelo: e.target.value }))}
                          required
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Tipo</label>
                        <input
                          type="text"
                          className="form-control"
                          value={biciEditando?.tipo || ''}
                          onChange={(e) => setBiciEditando((prev) => ({ ...prev, tipo: e.target.value }))}
                          required
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Color</label>
                        <input
                          type="text"
                          className="form-control"
                          value={biciEditando?.color || ''}
                          onChange={(e) => setBiciEditando((prev) => ({ ...prev, color: e.target.value }))}
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-light">Observaciones</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={biciEditando?.observaciones || ''}
                        onChange={(e) => setBiciEditando((prev) => ({ ...prev, observaciones: e.target.value }))}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                      />
                    </div>

                    {errorEditarBici && (
                      <div className="alert alert-danger py-2 mb-0" role="alert">
                        {errorEditarBici}
                      </div>
                    )}

                  </div>
                  
                  {/* FOOTER MODAL */}
                  <div className="modal-footer border-top border-secondary" style={{ background: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                    <button type="button" className="btn btn-outline-light" onClick={cerrarModalEditar}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-warning"> {/* Lo puse amarillo/warning para que se distinga de crear nueva */}
                      Guardar cambios
                    </button>
                  </div>
                  
                </form>
              </div>
            </div>
          </div>,
          document.body // Portal cerrado
        )}

        {/* ========================================================================= */}
        {/* MODAL DE DETALLES DE LA BICICLETA */}
        {/* ========================================================================= */}
        {biciSeleccionada && createPortal(
          <div 
            className="modal show d-block" 
            tabIndex="-1" 
            style={{ 
              backgroundColor: "rgba(0, 0, 0, 0.75)", 
              zIndex: 99999 
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '1200px' }}>
              
              <div className="modal-content" style={{
                background: 'rgba(25, 30, 40, 0.95)', 
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '15px', 
                color: '#fff',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
              }}>
                
                {/* HEADER MODAL */}
                <div className="modal-header border-bottom border-secondary">
                  <h5 className="modal-title" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '1px' }}>
                    FICHA TÉCNICA - BICI #{biciSeleccionada.id}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={cerrarModalDetalles}></button>
                </div>
                
                {/* BODY MODAL */}
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
                  
                  {/* Info General */}
                  <div className="mb-4 p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h6 className="text-info mb-3 border-bottom border-secondary pb-2">Información General</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Marca:</strong> {biciSeleccionada.marca}</p>
                        <p className="mb-1"><strong>Modelo:</strong> {biciSeleccionada.modelo}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Tipo:</strong> {biciSeleccionada.tipo}</p>
                        <p className="mb-1"><strong>Dueño:</strong> <span className="badge bg-light text-dark">{textoDueño(biciSeleccionada.usuario, 'No registrado')}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sección Servicios */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <h6 className="text-info mb-0">Historial de Servicios</h6>
                      {!mostrandoFormServicio && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={() => setMostrandoFormServicio(true)}
                        >
                          + Cargar Servicio
                        </button>
                      )}
                    </div>
                    
                    {cargandoServicios && !mostrandoFormServicio ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="visually-hidden">Cargando servicios...</span>
                        </div>
                      </div>
                    ) : mostrandoFormServicio ? (
                      
                      /* Formulario Nuevo Servicio */
                      <form onSubmit={manejarCrearServicio} className="border rounded p-3 mb-3" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.2)' }}>
                        <div className="mb-3">
                          <label className="form-label text-light">Problema Informado</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={nuevoProblema}
                            onChange={(e) => setNuevoProblema(e.target.value)}
                            required
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-light">Precio</label>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            step="0.01"
                            value={nuevoPrecio}
                            onChange={(e) => setNuevoPrecio(e.target.value)}
                            required
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                          />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                          <button type="button" className="btn btn-outline-light btn-sm" onClick={cancelarFormServicio}>
                            Cancelar
                          </button>
                          <button type="submit" className="btn btn-primary btn-sm">
                            Guardar
                          </button>
                        </div>
                      </form>

                    ) : serviciosBici.length === 0 ? (
                      <div className="alert alert-dark text-center p-3 mb-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                        <small className="text-light">No hay historial de servicios para esta bicicleta.</small>
                      </div>
                    ) : (
                      
                      /* Tabla de Servicios */
                      <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                          <thead className="table-light">
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
                                
                                {/* ACÁ ESTÁ ARREGLADO EL TEXTAREA INVISIBLE */}
                                <td style={{ minWidth: '18rem' }}>
                                  <textarea
                                    className="form-control form-control-sm shadow-none"
                                    rows={2}
                                    defaultValue={servicio.trabajo_realizado || ''}
                                    placeholder="Detalle del trabajo..."
                                    style={{ 
                                      resize: 'vertical', 
                                      backgroundColor: 'rgba(255,255,255,0.05)', 
                                      border: '1px dashed rgba(255,255,255,0.3)',
                                      color: '#fff' // 
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = '#86b7fe';
                                      e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
                                    }}
                                    onBlur={(e) => {
                                      const nuevoTexto = e.target.value.trim();
                                      const textoPrevio = (servicio.trabajo_realizado || '').trim();
                                      e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                      e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
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
                                    onChange={(e) => manejarCambioEstado(servicio.id, e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
                                  >
                                    {ESTADOS_SERVICIO.map((estado) => (
                                      <option key={estado} value={estado}>
                                        {estado}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>{servicio.precio ? `$${servicio.precio}` : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* FOOTER MODAL */}
                <div className="modal-footer border-top border-secondary" style={{ background: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                  <button type="button" className="btn btn-outline-light" onClick={cerrarModalDetalles}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body // Portal cerrado 
        )}

        {/* ======================= INICIO Tabs Content ======================= */}
        {/* ======================= VISTA BICICLETAS ======================= */}
            {vistaActiva === 'bicicletas' && (
              <div className="w-100">
                <h5 className="mb-3 text-white">Bicicletas Registradas</h5>
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por marca, modelo, color o dueño..."
                    value={busquedaBici}
                    onChange={e => setBusquedaBici(e.target.value)}
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      border: '1px solid rgba(255,255,255,0.3)', 
                      color: '#fff' 
                    }}
                  />
                  <p className="small mt-2 mb-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Mostrando las 10 bicicletas con actividad m&aacute;s reciente.
                  </p>
                </div>

                {cargando ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : bicicletas.length === 0 ? (
                  <p className="text-center my-4" style={{ color: 'rgba(255,255,255,0.6)' }}>No hay bicicletas registradas todavía.</p>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                    <table className="table table-dark table-hover align-middle mb-0">
                      <thead className="table-light sticky-top" style={{ zIndex: 10 }}>
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
                            <td colSpan="6" className="text-center py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setBiciSeleccionada(bici)}>Ver Detalles</button>
                                <button className="btn btn-outline-warning btn-sm mx-1" onClick={() => abrirModalEditar(bici)}>Editar</button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => archivarBicicleta(bici.id)}>Archivar</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ======================= VISTA CLIENTES ======================= */}
            {vistaActiva === 'clientes' && (
              <div className="w-100">
                <h5 className="mb-3 text-white">Gestión de Clientes</h5>
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre, apellido, CUIT o DNI..."
                    value={busquedaCliente}
                    onChange={e => setBusquedaCliente(e.target.value)}
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      border: '1px solid rgba(255,255,255,0.3)', 
                      color: '#fff' 
                    }}
                  />
                </div>

                {cargandoClientes ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : clientes.length === 0 ? (
                  <p className="text-center py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>No hay clientes registrados aún.</p>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                    <table className="table table-dark table-hover align-middle mb-0">
                      <thead className="table-light sticky-top" style={{ zIndex: 10 }}>
                        <tr>
                          <th>Nombre y Apellido</th>
                          <th>CUIT / DNI</th>
                          <th>Teléfono</th>
                          <th>Email</th>
                          <th>Bicis Registradas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientesFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              No se encontraron clientes
                            </td>
                          </tr>
                        ) : (
                          clientesFiltrados.map((cli) => (
                            <tr key={cli.id}>
                              <td><span>{cli.nombre || ''} {cli.apellido || ''}</span></td>
                              <td>
                                {(cli.cuit && cli.cuit.trim() !== '') ? (
                                  <span><strong>CUIT:</strong> <span className="text-nowrap">{cli.cuit}</span></span>
                                ) : cli.dni ? (
                                  <span><strong>DNI:</strong> <span className="text-nowrap">{cli.dni}</span></span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>{cli.telefono || <span className="text-muted">-</span>}</td>
                              <td style={{ minWidth: 180 }}>
                                {cli.email ? <span className="text-break">{cli.email}</span> : <span className="text-muted">-</span>}
                              </td>
                              <td>
                                <span className="badge bg-info text-dark">
                                  {Array.isArray(cli.bicicletas) ? cli.bicicletas.length : 0}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
        {/* ======================= FIN Tabs Content ======================= */}
        </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL DE NUEVA BICICLETA - AHORA FLOTA POR ENCIMA DE TODO Y TIENE ESTILO */}
        {/* ========================================================================= */}
        {modalAbierto && createPortal (
          <div 
            className="modal show d-block" 
            tabIndex="-1" 
            style={{ 
              backgroundColor: "rgba(0, 0, 0, 0.75)", // Fondo oscuro para tapar el panel
              zIndex: 9999 // Asegura que quede por encima del Navbar
            }}
          >
          {/* LA MAGIA ESTÁ ACÁ: modal-dialog-centered */}
          <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '1000px' }}>
              
              {/* EL CONTENIDO DEL MODAL CON LOOK & FEEL PIZARRÓN */}
              <div className="modal-content" style={{
                background: 'rgba(25, 30, 40, 0.95)', // Fondo oscuro y ligeramente azulado
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '15px', 
                color: '#fff',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
              }}>
                <form onSubmit={manejarCrearBici}>
                  
                  {/* HEADER DEL MODAL */}
                  <div className="modal-header border-bottom border-secondary">
                    <h5 className="modal-title" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '1px' }}>
                      REGISTRAR NUEVA BICICLETA
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
                  </div>
                  
                  {/* CUERPO DEL MODAL (Con Scroll) */}
                  <div
                    className="modal-body"
                    style={{
                      maxHeight: '65vh',
                      overflowY: 'auto',
                      padding: '2rem'
                    }}
                  >
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Marca</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nuevaMarca}
                          onChange={e => setNuevaMarca(e.target.value)}
                          required
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Modelo</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nuevoModelo}
                          onChange={e => setNuevoModelo(e.target.value)}
                          required
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Color</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nuevoColor}
                          onChange={e => setNuevoColor(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-light">Tipo de Bicicleta</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: Pista, Paseo, Ruta..."
                          value={nuevoTipo}
                          onChange={e => setNuevoTipo(e.target.value)}
                          required
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-light">Observaciones Generales</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={nuevaObservacion}
                        onChange={(e) => setNuevaObservacion(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                      />
                    </div>

                    <div className="mb-3 p-3 rounded" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <label className="form-label text-light fw-bold">Dueño de la bicicleta</label>
                       
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
                                      setNuevoUsuarioId('');
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
                                {busquedaCliente && !nuevoUsuarioId && usuariosFiltrados.length === 0 && (
                                  <p className="form-text text-danger mb-0 mt-1">
                                    No hay resultados. Por favor, hacé clic en "+ Nuevo" para registrarlo.
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            // NUEVO: Contenedor con scroll para el formulario de Nuevo Cliente
                            <div
                              className="border rounded p-2 bg-light pe-2"
                              style={{
                                maxHeight: '450px',
                                overflowY: 'auto',
                              }}
                            >
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
                  
                  {/* FOOTER DEL MODAL */}
                  <div className="modal-footer border-top border-secondary" style={{ background: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                    <button type="button" className="btn btn-outline-light" onClick={cerrarModal}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={cargandoUsuariosModal || usuariosDisponibles.length === 0}
                    >
                      Guardar Bicicleta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body // Renderizamos en el body para que no se interfiera con el Navbar
        )}


        {/* Pie de página con logo y año, identity visual */}
        <div
          className="chalk-logo-center-wrapper"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            /* Regulamos el aire superior dinámicamente para calzar la Home */
            marginTop: '2rem', 
            paddingBottom: '2.5rem',
            position: 'relative',
            zIndex: 10,
          }}
        >
        {/* Logo del taller */}
        <img
            src={logoTaller}
            alt="Logo del taller"
            style={{
              maxHeight: '75px',
              width: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.16))',
            }}
          />
          {/* Fecha en cursiva */}
          <span className="chalk-since" style={{ margin: 0 }}>
            desde 11/12/2020
          </span>
        </div>
    </ChalkboardLayout>
  );
}