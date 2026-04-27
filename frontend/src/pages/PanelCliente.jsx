import { useState } from 'react';
import api from '../api';

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

      // ✨ NUESTRO MICRÓFONO ✨
      // Esto va a imprimir en la consola exactamente qué trajo NestJS
      console.log("Bicis que mandó NestJS:", todasBicicletas);

      const bicicletasFiltradas = todasBicicletas.filter((bicicleta) => {
        // Buscamos el DNI directamente, con un salvavidas por si el usuario es null
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

  return (
    <div className="container py-5">
      <div className="mx-auto text-center" style={{ maxWidth: '760px' }}>
        <h1 className="display-5 fw-bold mb-3">Consulta el estado de tu Bicicleta</h1>
        <p className="text-muted mb-4">
          Ingresá tu DNI para ver tus bicicletas registradas y el estado de sus servicios.
        </p>

        <form onSubmit={manejarBusqueda} className="d-flex flex-column flex-md-row gap-2 justify-content-center mb-4">
          <input
            type="number"
            className="form-control form-control-lg text-center"
            placeholder="Ingresá tu DNI"
            value={dniBusqueda}
            onChange={(e) => setDniBusqueda(e.target.value)}
            style={{ maxWidth: '320px' }}
            min="0"
          />
          <button type="submit" className="btn btn-primary btn-lg px-4" disabled={buscando}>
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {busquedaRealizada && !buscando && bicicletasCliente.length === 0 && (
        <div className="alert alert-warning text-center mx-auto" style={{ maxWidth: '760px' }}>
          No encontramos bicicletas registradas con este DNI.
        </div>
      )}

      {bicicletasCliente.length > 0 && (
        <div className="row g-4 mt-1">
          {bicicletasCliente.map((bicicleta) => {
            const servicios = Array.isArray(bicicleta.servicios) ? bicicleta.servicios : [];
            const ultimoServicio = obtenerUltimoServicio(servicios);

            return (
              <div className="col-12 col-md-6 col-lg-4" key={bicicleta.id}>
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body">
                    <h5 className="card-title mb-1">
                      {bicicleta.marca || 'Marca no informada'} - {bicicleta.modelo || 'Modelo no informado'}
                    </h5>
                    <p className="text-muted small mb-3">Bicicleta #{bicicleta.id}</p>

                    <div className="mb-3">
                      <span className={`badge fs-6 px-3 py-2 ${obtenerBadgePorEstado(ultimoServicio?.estado)}`}>
                        {ultimoServicio?.estado || 'SIN ESTADO'}
                      </span>
                    </div>

                    <h6 className="fw-semibold">Servicios</h6>
                    {servicios.length === 0 ? (
                      <p className="mb-0 text-muted">
                        No hay servicios cargados para esta bicicleta. Por favor, contactá al taller.
                      </p>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {servicios.map((servicio) => (
                          <li key={servicio.id} className="list-group-item px-0">
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <small className="text-muted">
                                {servicio?.fecha_ingreso
                                  ? new Date(servicio.fecha_ingreso).toLocaleDateString()
                                  : 'Sin fecha'}
                              </small>
                              <span className={`badge ${obtenerBadgePorEstado(servicio.estado)}`}>
                                {servicio?.estado || 'SIN ESTADO'}
                              </span>
                            </div>
                            <div className="mt-1">{servicio?.problema_informado || 'Sin detalle informado'}</div>
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
      )}
    </div>
  );
}