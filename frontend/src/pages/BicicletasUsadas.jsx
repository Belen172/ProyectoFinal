import React, { useState, useEffect } from 'react';
import api from '../api';
import logoTaller from '../assets/logo.png';
import ChalkboardLayout from '../components/ChalkboardLayout';

export default function BicicletasUsadas() {
  const [bicicletas, setBicicletas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Estados del formulario
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [talle, setTalle] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Si es null, estamos creando una bicicleta.
  // Si tiene un ID, estamos editando esa bicicleta.
  const [bicicletaEditandoId, setBicicletaEditandoId] = useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Usuario guardado al iniciar sesión
  let usuarioActual = null;

  try {
    usuarioActual = JSON.parse(
      localStorage.getItem('user') || 'null'
    );
  } catch {
    usuarioActual = null;
  }

  // Control de visibilidad. El backend también valida los permisos.
  const puedeAdministrar =
    Boolean(localStorage.getItem('access_token')) &&
    usuarioActual?.rol === 'ADMIN';

  useEffect(() => {
    cargarBicicletas();
  }, []);

  const cargarBicicletas = async () => {
    try {
      setCargando(true);

      const response = await api.get('/bicicletas-usadas');

      setBicicletas(
        Array.isArray(response.data) ? response.data : []
      );
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el listado de bicicletas usadas.');
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setMarca('');
    setModelo('');
    setTalle('');
    setPrecio('');
    setDescripcion('');
    setImagenFile(null);
    setBicicletaEditandoId(null);
  };

  const cancelarFormulario = () => {
    limpiarFormulario();
    setMostrarForm(false);
  };

  const abrirNuevaBicicleta = () => {
    if (!puedeAdministrar || guardando) return;

    limpiarFormulario();
    setMostrarForm(true);
  };

  const comenzarEdicion = (bici) => {
    if (!puedeAdministrar || guardando) return;

    setBicicletaEditandoId(bici.id);
    setMarca(bici.marca ?? '');
    setModelo(bici.modelo ?? '');
    setTalle(bici.talle ?? '');
    setPrecio(String(bici.precio ?? ''));
    setDescripcion(bici.descripcion ?? '');
    setImagenFile(null);
    setMostrarForm(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();

    if (!puedeAdministrar) {
      alert('Solo el administrador puede realizar esta acción.');
      return;
    }

    if (guardando) return;

    const precioNumerico = Number(precio);

    if (
      precio.trim() === '' ||
      !Number.isFinite(precioNumerico) ||
      precioNumerico < 0
    ) {
      alert('Ingresá un precio válido, mayor o igual a cero.');
      return;
    }

    setGuardando(true);

    try {
      if (bicicletaEditandoId !== null) {
        // Editar los datos conservando la foto y disponibilidad.
        await api.put(
          `/bicicletas-usadas/${bicicletaEditandoId}`,
          {
            marca,
            modelo,
            talle,
            precio: precioNumerico,
            descripcion,
          }
        );
      } else {
        // Crear una nueva publicación con su foto.
        const formData = new FormData();

        formData.append('marca', marca);
        formData.append('modelo', modelo);
        formData.append('talle', talle);
        formData.append('precio', String(precioNumerico));
        formData.append('descripcion', descripcion);
        formData.append('disponible', 'true');

        if (imagenFile) {
          formData.append('imagen', imagenFile);
        }

        await api.post('/bicicletas-usadas', formData);
      }

      cancelarFormulario();
      await cargarBicicletas();
    } catch (err) {
      console.error('Estado:', err.response?.status);
      console.error('Respuesta del backend:', err.response?.data);

      const mensaje = err.response?.data?.message;

      alert(
        Array.isArray(mensaje)
          ? mensaje.join('\n')
          : typeof mensaje === 'string'
            ? mensaje
            : 'No se pudieron guardar los datos de la bicicleta.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminarBicicleta = async (id) => {
    if (!puedeAdministrar) {
      alert('Solo el administrador puede eliminar bicicletas.');
      return;
    }

    if (guardando) return;

    if (
      !window.confirm(
        '¿Estás seguro de eliminar esta bicicleta de la vidriera?'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/bicicletas-usadas/${id}`);

      // Si eliminamos la bicicleta que estábamos editando,
      // cerramos el formulario.
      if (bicicletaEditandoId === id) {
        cancelarFormulario();
      }

      await cargarBicicletas();
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar.');
    }
  };

  return (
    <ChalkboardLayout scrollable>
      <div
        className="chalk-panel-cliente d-flex flex-column"
        style={{
          minHeight: 'calc(100vh - 95px)',
          justifyContent: 'space-between',
        }}
      >
        {/* Cuerpo principal */}
        <div
          className="chalk-panel-cliente-main flex-grow-1 d-flex flex-column p-4"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            zIndex: 2,
          }}
        >
          {/* Cabecera */}
          <div className="usadas-page-header d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary">
            <h2
              className="usadas-page-title"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                color: '#fff',
                fontSize: '2rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Bicicletas Usadas en Venta
            </h2>

            {puedeAdministrar && (
              <button
                type="button"
                className="btn btn-sm"
                disabled={guardando}
                onClick={() => {
                  if (mostrarForm) {
                    cancelarFormulario();
                  } else {
                    abrirNuevaBicicleta();
                  }
                }}
                style={{
                  background: 'none',
                  border: '2px solid #fff',
                  padding: '0.4em 1.5em',
                  borderRadius: '45px',
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
              >
                {mostrarForm ? 'Cancelar' : '+ Nueva Bicicleta'}
              </button>
            )}
          </div>

          {error && (
            <div
              className="text-center mx-auto w-100 mb-4"
              style={{
                color: '#ffde64',
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                background: 'rgba(0,0,0,0.3)',
                border: '2px dashed #fff',
                borderRadius: '7px',
                padding: '1em',
              }}
            >
              {error}
            </div>
          )}

          {/* Formulario de creación y edición */}
          {puedeAdministrar && mostrarForm && (
            <div
              className="card p-4 mb-4"
              style={{
                background: 'rgba(20, 20, 20, 0.85)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              <h5
                className="text-light mb-3"
                style={{
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                }}
              >
                {bicicletaEditandoId !== null
                  ? 'EDITAR BICICLETA'
                  : 'PUBLICAR BICICLETA EN LA VIDRIERA'}
              </h5>

              <form onSubmit={manejarGuardar} className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Marca (Ej: Top Mega)"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    required
                    disabled={guardando}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#fff',
                    }}
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Modelo (Ej: Sunshine)"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    required
                    disabled={guardando}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#fff',
                    }}
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Talle (Ej: M / L / R29)"
                    value={talle}
                    onChange={(e) => setTalle(e.target.value)}
                    disabled={guardando}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#fff',
                    }}
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Precio ($)"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    disabled={guardando}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#fff',
                    }}
                  />
                </div>

                {bicicletaEditandoId === null ? (
                  <div className="col-md-8">
                    <label className="form-label text-light small mb-1">
                      Foto de la bicicleta (JPG / PNG)
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      accept="image/png, image/jpeg"
                      disabled={guardando}
                      onChange={(e) =>
                        setImagenFile(e.target.files?.[0] || null)
                      }
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: '#fff',
                      }}
                    />
                  </div>
                ) : (
                  <div className="col-md-8 d-flex align-items-center">
                    <p className="text-white-50 small mb-0">
                      Se conservará la foto actual de la bicicleta.
                    </p>
                  </div>
                )}

                <div className="col-12">
                  <textarea
                    className="form-control"
                    placeholder="Descripción detallada (componentes, estado, etc.)"
                    rows="2"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    disabled={guardando}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#fff',
                    }}
                  />
                </div>

                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={guardando}
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {guardando
                      ? 'Guardando...'
                      : bicicletaEditandoId !== null
                        ? 'Guardar cambios'
                        : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listado de tarjetas */}
          {cargando ? (
            <p
              className="text-center text-white-50 my-5"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Cargando catálogo...
            </p>
          ) : bicicletas.length === 0 ? (
            <p
              className="text-white-50 text-center my-5"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              No hay bicicletas cargadas para la venta por el momento.
            </p>
          ) : (
            <div className="row g-4">
              {bicicletas.map((bici) => (
                <div
                  className="col-12 col-md-6 col-lg-4"
                  key={bici.id}
                >
                  <div
                    className="card h-100"
                    style={{
                      background: 'rgba(20, 20, 20, 0.65)',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      borderRadius: '10px',
                      fontFamily: "'Oswald', sans-serif",
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {bici.imagenUrl && (
                      <img
                      src={
                        bici.imagenUrl.startsWith('https://')
                          ? bici.imagenUrl
                          : `${API_URL}${bici.imagenUrl}`
                      }
                        className="card-img-top"
                        alt={bici.modelo}
                        style={{
                          height: '180px',
                          objectFit: 'cover',
                        }}
                      />
                    )}

                    <div
                      className="card-body d-flex flex-column"
                      style={{ padding: '1.5rem' }}
                    >
                      <h5
                        className="card-title mb-1"
                        style={{
                          fontSize: '1.45rem',
                          fontWeight: 500,
                          color: '#fff',
                          textTransform: 'uppercase',
                        }}
                      >
                        {bici.marca} {bici.modelo}
                      </h5>

                      <h6
                        className="text-success fw-bold mb-2"
                        style={{ fontSize: '1.2rem' }}
                      >
                        ${Number(bici.precio).toLocaleString()}
                      </h6>

                      <p
                        className="card-text mb-1"
                        style={{
                          color: 'var(--chalk-accent, #e8e2d4)',
                          fontSize: '0.9rem',
                        }}
                      >
                        Talle: {bici.talle || 'No especificado'}
                      </p>

                      <p
                        className="card-text text-white-50 small flex-grow-1"
                        style={{ fontWeight: 300 }}
                      >
                        {bici.descripcion || 'Sin descripción adicional.'}
                      </p>
                    </div>

                    <div
                      className="card-footer bg-transparent border-top border-secondary d-flex flex-wrap gap-2 justify-content-between align-items-center"
                      style={{ padding: '1rem 1.5rem' }}
                    >
                      <span
                        className={`badge ${
                          bici.disponible ? 'bg-primary' : 'bg-secondary'
                        }`}
                        style={{
                          border: '1px dashed rgba(255,255,255,0.3)',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {bici.disponible ? 'Disponible' : 'Vendida'}
                      </span>

                      {puedeAdministrar && (
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-light btn-sm"
                            onClick={() => comenzarEdicion(bici)}
                            disabled={guardando}
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarBicicleta(bici.id)}
                            disabled={guardando}
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="chalk-logo-center-wrapper"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '3.5rem',
            paddingBottom: '2.5rem',
            position: 'relative',
            zIndex: 10,
          }}
        >
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

          <span className="chalk-since" style={{ margin: 0 }}>
            desde 11/12/2020
          </span>
        </div>
      </div>
    </ChalkboardLayout>
  );
}