import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import logoTaller from '../assets/logo.png';
import ChalkboardLayout from '../components/ChalkboardLayout';

function obtenerBadgePorEstado(estado) {
  switch (estado) {
    case 'TERMINADO':
    case 'ENTREVADO':
    case 'ENTREGADO':
      return 'bg-success';
    case 'EN_REPARACION':
    case 'PENDIENTE':
      return 'bg-warning text-dark';
    case 'INGRESADO':
      return 'bg-primary';
    default:
      return 'bg-secondary';
  }
}

function obtenerUltimoServicio(servicios) {
  if (!Array.isArray(servicios) || servicios.length === 0) return null;

  return [...servicios].sort((a, b) => {
    const fechaA = a?.fecha_ingreso ? new Date(a.fecha_ingreso).getTime() : 0;
    const fechaB = b?.fecha_ingreso ? new Date(b.fecha_ingreso).getTime() : 0;
    return fechaB - fechaA;
  })[0];
}

function obtenerDniUsuario(bicicleta) {
  const usuario = bicicleta?.usuario ?? {};
  return (
    usuario?.dni ??
    usuario?.documento ??
    usuario?.documento_identidad ??
    usuario?.nro_documento ??
    ''
  );
}

function obtenerNombreUsuario(bicicletas) {
  if (!Array.isArray(bicicletas) || bicicletas.length === 0) return '';
  const usuario = bicicletas[0]?.usuario;
  if (!usuario) return '';
  
  if (usuario.nombre || usuario.apellido) {
    const nombre = usuario.nombre || '';
    const apellido = usuario.apellido || '';
    return `${nombre} ${apellido}`.trim().toUpperCase();
  }
}

export default function PanelCliente() {
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [bicicletasCliente, setBicicletasCliente] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const manejarBusqueda = async (e) => {
    e.preventDefault();
    setBuscando(true);
    setMensajeError('');

    const dniNormalizado = dniBusqueda.trim();

    if (!dniNormalizado) {
      setBicicletasCliente([]);
      setBusquedaRealizada(true);
      setMensajeError('Por favor, ingrese un número de DNI para realizar la consulta.');
      setBuscando(false);
      return;
    }

    setBusquedaRealizada(true);

    try {
      const resBicicletas = await api.get('/bicicletas');
      const todasBicicletas = Array.isArray(resBicicletas.data) ? resBicicletas.data : [];

      console.log("Bicis que mandó NestJS:", todasBicicletas);

      const bicicletasFiltradas = todasBicicletas.filter((bicicleta) => {
        const dniBici = bicicleta.usuario?.dni ? String(bicicleta.usuario.dni).trim() : "";
        return dniBici === dniNormalizado;
      });

      if (bicicletasFiltradas.length === 0) {
        setBicicletasCliente([]);
        setMensajeError('No encontramos bicicletas registradas con este DNI.');
        return;
      }

      let serviciosPorBici = new Map();
      try {
        const resServicios = await api.get('/servicios');
        const todosServicios = Array.isArray(resServicios.data) ? resServicios.data : [];

        serviciosPorBici = todosServicios.reduce((mapa, servicio) => {
          const biciId = servicio?.bicicleta?.id;
          if (!biciId) return mapa;
          const anteriores = mapa.get(biciId) ?? [];
          mapa.set(biciId, [...anteriores, servicio]);
          return mapa;
        }, new Map());
      } catch (errorServicios) {
        console.error('No se pudieron cargar los servicios:', errorServicios);
      }

      const bicicletasConServicios = bicicletasFiltradas.map((bicicleta) => ({
        ...bicicleta,
        servicios:
          Array.isArray(bicicleta.servicios) && bicicleta.servicios.length > 0
            ? bicicleta.servicios
            : serviciosPorBici.get(bicicleta.id) ?? [],
      }));

      setBicicletasCliente(bicicletasConServicios);
    } catch (error) {
      console.error('Error al buscar bicicletas del cliente:', error);
      setBicicletasCliente([]);
    } finally {
      setBuscando(false);
    }
  };


  const showCenteredBoard = bicicletasCliente.length === 0;

  return (
    <ChalkboardLayout scrollable>

      {/* Contenedor principal con alto mínimo flexible */}
      <div className="chalk-panel-cliente d-flex flex-column" style={{ minHeight: 'calc(100vh - 95px)', justifyContent: 'space-between' }}>
        
        {/* Cuerpo del panel (Buscador o Resultados) */}
        <div className={`chalk-panel-cliente-main flex-grow-1 d-flex flex-column ${showCenteredBoard ? 'justify-content-center' : 'justify-content-start'}`}>
          
          {/* CORREGIDO: Si NO hay bicicletas en la lista, el recuadro se queda en pantalla firme */}
          {bicicletasCliente.length === 0 && (
            <div
              style={{
                width: '100%',
                maxWidth: 640,
                margin: 'auto',
                transition: 'margin 0.38s cubic-bezier(.7,0,.4,1.05)',
                zIndex: 2,
              }}
            >
              <div
                className="carousel-frame p-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)', 
                  border: '1.5px solid rgba(255, 255, 255, 0.35)', 
                  borderRadius: '8px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                  overflow: 'hidden',
                  padding: '2.6rem 2rem 2.1rem 2rem',
                  backdropFilter: 'blur(10px)', 
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <h1
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    fontSize: '2.1rem',
                    letterSpacing: '0.06em',
                    color: '#fff',
                    margin: 0,
                    textAlign: 'center',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  SEGUIMIENTO EN TIEMPO REAL
                </h1>
                <p
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 300,
                    fontSize: '1.12rem',
                    color: 'var(--chalk-muted, #c9c4b8)',
                    margin: '1.2em 0 2.1em',
                    textAlign: 'center',
                    letterSpacing: '0.01em',
                    lineHeight: 1.5,
                    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Ingresá tu DNI para ver tus bicicletas registradas y el estado de sus servicios en tiempo real.
                </p>
                <form
                  onSubmit={manejarBusqueda}
                  className="d-flex flex-column flex-md-row gap-3 justify-content-center mb-0"
                  style={{
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 460,
                    margin: '0 auto',
                  }}
                >
                  <input
                    type="number"
                    autoFocus
                    className="chalk-dni-input"
                    placeholder="Ingresá tu DNI"
                    value={dniBusqueda}
                    onChange={(e) => setDniBusqueda(e.target.value)}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: '2px solid #fff',
                      color: '#fff',
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 500,
                      fontSize: '1.48rem',
                      textAlign: 'center',
                      padding: '0.62rem 0.5rem',
                      width: '15em',
                      outline: 'none',
                      boxShadow: 'none',
                      letterSpacing: '0.03em',
                      transition: 'border-color 0.17s',
                    }}
                    min="0"
                    inputMode="numeric"
                  />
                  <button
                    type="submit"
                    className="btn"
                    disabled={buscando}
                    style={{
                      background: 'none',
                      border: '2px solid #fff',
                      padding: '0.65em 2.6em',
                      borderRadius: '45px',
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.119rem',
                      color: '#fff',
                      letterSpacing: '0.11em',
                      textTransform: 'uppercase',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.14)',
                      marginLeft: 0,
                      marginTop: '0.3em',
                      backgroundClip: 'padding-box',
                      transition: 'opacity 0.18s, border-color 0.18s, background 0.18s',
                      opacity: buscando ? 0.65 : 1,
                      cursor: buscando ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {buscando ? 'Buscando...' : 'BUSCAR'}
                  </button>
                </form>
                
                {/* Mensaje de alerta si la búsqueda falla — AHORA SÍ SE VA A MOSTRAR IMPECABLE */}
                {busquedaRealizada && !buscando && bicicletasCliente.length === 0 && (
                  <div
                    className="text-center mx-auto"
                    style={{
                      maxWidth: 500,
                      marginTop: '2.1rem',
                      color: '#ffde64',
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      background: 'rgba(0,0,0,0.13)',
                      border: '2px dashed #fff',
                      borderRadius: '7px',
                      padding: '1em 1.2em',
                      fontSize: '1.05rem',
                      letterSpacing: '0.02em',
                      boxShadow: '0 2px 10px 1.5px rgba(0,0,0,0.12)',
                      textShadow: '0 2px 6px rgba(0,0,0,0.16)',
                    }}
                  >
                    {mensajeError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Bicicletas EN ESTILO CHALKBOARD */}
          {bicicletasCliente.length > 0 && (
            <div
              className="container"
              style={{
                marginTop: '1.5rem',
                marginBottom: '2rem',
                padding: 0,
                maxWidth: 1144,
                width: '100%',
                zIndex: 2,
                position: 'relative'
              }}
            >
              {/* Encabezado del Propietario */}
              <div className="text-center mb-4">
                {obtenerNombreUsuario(bicicletasCliente) && (
                  <h2 style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: '#fff', fontSize: '2rem', letterSpacing: '0.04em', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    PROPIETARIO: {obtenerNombreUsuario(bicicletasCliente)}
                  </h2>
                )}
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 400, color: 'var(--chalk-muted, #c9c4b8)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                  DOCUMENTO: <span style={{ color: '#fff', fontWeight: 500 }}>{dniBusqueda}</span>
                </h3>
                <button 
                  onClick={() => { setBicicletasCliente([]); setBusquedaRealizada(false); setDniBusqueda(''); setMensajeError(''); }}
                  className="btn btn-sm btn-link text-white-50 mt-2"
                  style={{ fontFamily: "'Oswald', sans-serif", textDecoration: 'underline', color: 'rgba(255,255,255,0.6)' }}
                >
                  Nueva consulta
                </button>
              </div>

              <div className="row g-4 mt-2 justify-content-center" style={{ width: '100%', margin: 0 }}>
                {bicicletasCliente.map((bicicleta) => {
                  const servicios = Array.isArray(bicicleta.servicios) ? bicicleta.servicios : [];
                  const ultimoServicio = obtenerUltimoServicio(servicios);

                  return (
                    <div className="col-12 col-md-6 col-lg-4" key={bicicleta.id}>
                      <div
                        className="card h-100"
                        style={{
                          background: 'rgba(20, 20, 20, 0.65)', 
                          border: '1.5px solid rgba(255, 255, 255, 0.2)', 
                          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                          borderRadius: '10px',
                          fontFamily: "'Oswald', sans-serif",
                          color: '#fff',
                          minHeight: 320,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          overflow: 'hidden',
                          backdropFilter: 'blur(4px)',
                          WebkitBackdropFilter: 'blur(4px)'
                        }}
                      >
                        <div className="card-body" style={{ flex: 1, padding: '1.5rem' }}>
                          <h5
                            className="card-title mb-1"
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              fontWeight: 500,
                              fontSize: '1.45rem',
                              letterSpacing: '0.03em',
                              color: '#ffffff',
                              textTransform: 'uppercase'
                            }}
                          >
                            {bicicleta.marca || <span style={{ color: 'rgba(255,255,255,0.4)' }}>Marca no informada</span>}
                            {bicicleta.marca && ' — '}
                            {bicicleta.modelo || <span style={{ color: 'rgba(255,255,255,0.4)' }}>Modelo no informado</span>}
                          </h5>
                          
                          <p className="small mb-3" style={{ color: 'var(--chalk-accent, #e8e2d4)', fontFamily: "'Oswald', sans-serif", fontWeight: 400, letterSpacing: '0.05em', fontSize: '0.9rem' }}>
                            BICICLETA #{bicicleta.id} {bicicleta.color ? `| COLOR: ${bicicleta.color.toUpperCase()}` : ''}
                          </p>

                          <div className="mb-4">
                            <span
                              className={`badge fs-6 px-3 py-2 ${obtenerBadgePorEstado(ultimoServicio?.estado)}`}
                              style={{
                                fontFamily: "'Oswald', sans-serif",
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                fontSize: '0.95rem',
                                border: '1.5px dashed rgba(255, 255, 255, 0.4)',
                                background: 'rgba(255,255,255,0.08)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                            >
                              {ultimoServicio?.estado || 'SIN ESTADO'}
                            </span>
                          </div>

                          <h6
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              marginBottom: '0.8rem',
                              textTransform: 'uppercase',
                              borderBottom: '1px dashed rgba(255,255,255,0.15)',
                              paddingBottom: '0.3rem',
                              color: '#ffffff'
                            }}
                          >
                            Historial de Services
                          </h6>

                          {servicios.length === 0 ? (
                            <p className="mb-0 small"
                                style={{
                                  fontFamily: "'Oswald', sans-serif",
                                  fontWeight: 300,
                                  color: 'var(--chalk-muted, #c9c4b8)',
                                  lineHeight: '1.5'
                                }}>
                              No hay servicios cargados para esta bicicleta. Por favor, contactá al taller.
                            </p>
                          ) : (
                            <ul className="list-group list-group-flush"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  paddingLeft: 0,
                                }}>
                              {servicios.map((servicio) => (
                                <li
                                  key={servicio.id}
                                  className="list-group-item px-0"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#fff',
                                    fontFamily: "'Oswald', sans-serif",
                                    borderBottom: '1px dashed rgba(255,255,255,0.1)',
                                    marginBottom: 6,
                                    padding: '0.6em 0 0.5em',
                                  }}
                                >
                                  <div className="d-flex justify-content-between align-items-center gap-2">
                                    <small
                                      style={{
                                        fontFamily: "'Oswald', sans-serif",
                                        color: 'rgba(255, 255, 255, 0.75) !important',
                                        fontWeight: 400,
                                        fontSize: '0.95rem',
                                      }}
                                    >
                                      {servicio?.fecha_ingreso
                                        ? new Date(servicio.fecha_ingreso).toLocaleDateString()
                                        : 'Sin fecha'}
                                    </small>
                                    <span className={`badge ${obtenerBadgePorEstado(servicio.estado)}`}
                                      style={{
                                        fontFamily: "'Oswald', sans-serif",
                                        fontWeight: 600,
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        border: '1px dashed rgba(255,255,255,0.3)',
                                        background: 'rgba(255,255,255,0.05)',
                                        letterSpacing: '0.06em',
                                      }}
                                    >
                                      {servicio?.estado || 'SIN ESTADO'}
                                    </span>
                                  </div>
                                  <div className="mt-1" style={{
                                    fontFamily: "'Oswald', sans-serif",
                                    fontWeight: 300,
                                    color: '#ffffff',
                                    fontSize: '1.05rem',
                                    lineHeight: '1.4'
                                  }}>
                                    {servicio?.problema_informado || (
                                      <span style={{ color: 'rgba(255,255,255,0.4)', stroke: 'italic' }}>Sin detalle informado</span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER CLONADO EXACTO DE LA HOME: Queda atado al piso de forma milimétrica */}
        <div
          className="chalk-logo-center-wrapper"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            /* Regulamos el aire superior dinámicamente para calzar la Home */
            marginTop: !busquedaRealizada ? '1.8rem' : '3.5rem', 
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

      </div> 
    </ChalkboardLayout>
  );
}