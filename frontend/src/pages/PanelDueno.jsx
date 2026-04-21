// React y useState, useEffect probablemente ya están importados arriba.
// IMPORTANTE: Asegúrate de que tienes `import api from '../api';` al inicio del archivo, si no, ponlo tú arriba.

import { useState, useEffect } from 'react';
import api from '../api';

export default function PanelDueno() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('');
  const [nuevoUsuarioId, setNuevoUsuarioId] = useState('');
  const [bicicletas, setBicicletas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [biciSeleccionada, setBiciSeleccionada] = useState(null); // null significa que no hay ninguna seleccionada al principio

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

  // Manejar apertura/cierre del modal
  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => {
    setModalAbierto(false);
    setNuevaMarca('');
    setNuevoModelo('');
    setNuevoTipo('');
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
                    <label className="form-label">ID del Usuario Dueño</label>
                    <input
                      type="number"
                      className="form-control"
                      value={nuevoUsuarioId}
                      onChange={e => setNuevoUsuarioId(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
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
                <button type="button" className="btn-close btn-close-white" onClick={() => setBiciSeleccionada(null)}></button>
              </div>
              
              <div className="modal-body">
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Información General</h6>
                  <p className="mb-1"><strong>Marca:</strong> {biciSeleccionada.marca}</p>
                  <p className="mb-1"><strong>Modelo:</strong> {biciSeleccionada.modelo}</p>
                  <p className="mb-1"><strong>Tipo:</strong> {biciSeleccionada.tipo}</p>
                  <p className="mb-1"><strong>Dueño (ID):</strong> {biciSeleccionada.usuario ? biciSeleccionada.usuario.id : 'No registrado'}</p>
                </div>
                
                <hr />
                
                <div>
                  <h6 className="text-muted mb-2">Historial de Servicios</h6>
                  {/* Acá armamos el esqueleto para cuando conectemos el módulo de servicios */}
                  <div className="alert alert-light border text-center p-3">
                    <small className="text-muted">
                      Próximamente conectaremos esto con las órdenes de reparación de esta bicicleta. 🛠️
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setBiciSeleccionada(null)}>
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
                    <th>Dueño (ID)</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bicicletas.map((bici) => (
                    <tr key={bici.id}>
                      <td>#{bici.id}</td>
                      <td><strong>{bici.marca}</strong></td>
                      <td>{bici.modelo}</td>
                      <td>{bici.usuario ? bici.usuario.id : 'Sin asignar'}</td>
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