import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { LogIn } from 'lucide-react';
import logoTaller from '../assets/logo.png';
import ChalkboardLayout from '../components/ChalkboardLayout';

function obtenerBadgePorEstado(estado) {
  switch (estado) {
    case 'TERMINADO':
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

export default function PanelCliente() {
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [bicicletasCliente, setBicicletasCliente] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const manejarBusqueda = async (e) => {
    e.preventDefault();
    setBusquedaRealizada(true);
    setBuscando(true);

    const dniNormalizado = dniBusqueda.trim();
    if (!dniNormalizado) {
      setBicicletasCliente([]);
      setBuscando(false);
      return;
    }

    try {
      const resBicicletas = await api.get('/bicicletas');
      const todasBicicletas = Array.isArray(resBicicletas.data) ? resBicicletas.data : [];

      // Esto va a imprimir en la consola exactamente qué trajo NestJS
      console.log("Bicis que mandó NestJS:", todasBicicletas);

      const bicicletasFiltradas = todasBicicletas.filter((bicicleta) => {
        const dniBici = bicicleta.usuario?.dni ? String(bicicleta.usuario.dni).trim() : "";
        return dniBici === dniNormalizado;
      });

      if (bicicletasFiltradas.length === 0) {
        setBicicletasCliente([]);
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

  // DINÁMICA DE CENTRADO: Si no hay bicis, centra el form en pantalla
  const showCenteredBoard =
    bicicletasCliente.length === 0 && (!busquedaRealizada || !buscando);

  return (
    <ChalkboardLayout scrollable>
      <div className="chalk-panel-cliente">
        <div
          className={`chalk-panel-cliente-main${showCenteredBoard ? '' : ' chalk-panel-cliente-main--top'}`}
        >
        <div
          style={{
            width: '100%',
            maxWidth: 640,
            margin: bicicletasCliente.length > 0 ? '2.1rem auto 1.5rem auto' : 'auto',
            transition: 'margin 0.38s cubic-bezier(.7,0,.4,1.05)',
            zIndex: 2,
          }}
        >
          <div
            className="carousel-frame p-0"
            style={{
              background: 'linear-gradient(162deg, var(--wood-mid) 0%, var(--wood-dark) 43%, #261d13 100%)',
              border: '2px solid #4a3728',
              borderRadius: '6px',
              boxShadow:
                'inset 0 0 0 2px rgba(0,0,0,0.34), inset 0 2px 4px rgba(255,255,255,0.09), 0 9px 28px rgba(0,0,0,0.31)',
              overflow: 'hidden',
              padding: showCenteredBoard ? '2.6rem 2rem 2.1rem 2rem' : '2.1rem 1.3rem 1.5rem 1.3rem',
              backdropFilter: 'blur(0.5px)',
            }}
          >
            {/* TÍTULO Chalkboard */}
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
                textShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}
            >
              SEGUIMIENTO EN TIEMPO REAL
            </h1>
            <p
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 300,
                fontSize: '1.12rem',
                color: '#eee',
                margin: '1.2em 0 2.1em',
                textAlign: 'center',
                letterSpacing: '0.01em',
                lineHeight: 1.5,
                textShadow: '0 1px 4px rgba(0,0,0,0.16)',
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
            {/* Mensaje de alerta si la búsqueda falla */}
            {busquedaRealizada && !buscando && bicicletasCliente.length === 0 && (
              <div
                className="text-center mx-auto"
                style={{
                  maxWidth: 370,
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
                No encontramos bicicletas registradas con este DNI.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Bicicletas EN ESTILO CHALKBOARD */}
      {bicicletasCliente.length > 0 && (
        <div
          className="container"
          style={{
            marginTop: '0.5rem',
            marginBottom: '2rem',
            padding: 0,
            maxWidth: 1144,
            width: '100%',
            transition: 'margin-top 0.33s cubic-bezier(.66,0,.38,1.03)',
          }}
        >
          <div className="row g-4 mt-2" style={{ width: '100%', margin: 0 }}>
            {bicicletasCliente.map((bicicleta) => {
              const servicios = Array.isArray(bicicleta.servicios) ? bicicleta.servicios : [];
              const ultimoServicio = obtenerUltimoServicio(servicios);

              return (
                <div className="col-12 col-md-6 col-lg-4" key={bicicleta.id}>
                  <div
                    className="card h-100 border-0"
                    style={{
                      background: 'rgba(17,16,15,0.93)',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 14px 1.5px rgba(0,0,0,0.27), 0 1.5px 0 #2a1d0d',
                      borderRadius: '9px',
                      fontFamily: "'Oswald', sans-serif",
                      color: '#fff',
                      minHeight: 320,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      marginBottom: '0.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div className="card-body" style={{ flex: 1, paddingBottom: 14 }}>
                      <h5
                        className="card-title mb-1"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontWeight: 500,
                          fontSize: '1.28rem',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {bicicleta.marca || (
                          <span style={{ color: '#d4cebe', opacity: 0.72 }}>Marca no informada</span>
                        )}
                        {bicicleta.marca && ' — '}
                        {bicicleta.modelo || (
                          <span style={{ color: '#d4cebe', opacity: 0.72 }}>Modelo no informado</span>
                        )}
                      </h5>
                      <p className="text-muted small mb-3" style={{ color: '#e9c167', fontFamily: "'Oswald', sans-serif", fontWeight: 400 }}>
                        Bicicleta #{bicicleta.id}
                      </p>
                      <div className="mb-3">
                        <span
                          className={`badge fs-6 px-3 py-2 ${obtenerBadgePorEstado(ultimoServicio?.estado)}`}
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            background: 'rgba(240,217,154,0.10)',
                            border: '1.7px dashed #ffeb9e',
                            color: '#ffe6ac',
                            fontSize: '1rem',
                          }}
                        >
                          {ultimoServicio?.estado || 'SIN ESTADO'}
                        </span>
                      </div>
                      <h6
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontWeight: 600,
                          fontSize: '1.09rem',
                          marginBottom: 7,
                        }}
                      >
                        Servicios
                      </h6>
                      {servicios.length === 0 ? (
                        <p className="mb-0 text-muted"
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              color: '#f5dfaf',
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
                                borderBottom: '1.5px dashed #fff3',
                                marginBottom: 6,
                                padding: '0.6em 0 0.44em',
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start gap-2">
                                <small
                                  className="text-muted"
                                  style={{
                                    fontFamily: "'Oswald', sans-serif",
                                    color: '#ffeb9e',
                                    fontWeight: 300,
                                    fontSize: '0.99rem',
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
                                    fontSize: '0.95rem',
                                    border: '1.1px dashed #ffeeb2',
                                    background: 'rgba(240,217,154,0.10)',
                                    letterSpacing: '0.06em',
                                  }}
                                >
                                  {servicio?.estado || 'SIN ESTADO'}
                                </span>
                              </div>
                              <div className="mt-1" style={{
                                fontFamily: "'Oswald', sans-serif",
                                fontWeight: 400,
                                color: '#d4cebe',
                                fontSize: '1.08rem',
                              }}>
                                {servicio?.problema_informado || (
                                  <span style={{ color: '#c0bba9', opacity: 0.73 }}>Sin detalle informado</span>
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

        <footer className="chalkboard-footer">
          <div className="chalk-footer-brand">
            <img src={logoTaller} alt="Logo del taller" className="chalk-footer-logo" />
            <span className="chalk-since">desde 11/12/2020</span>
            <Link
              to="/login"
              aria-label="Iniciar sesión"
              className="chalk-login-private chalk-login-fab-btn"
            >
              <LogIn size={17} strokeWidth={1.2} aria-hidden />
            </Link>
          </div>
        </footer>
      </div>
    </ChalkboardLayout>
  );
}