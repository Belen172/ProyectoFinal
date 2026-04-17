import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import PanelDueno from './pages/PanelDueno';
import PanelCliente from './pages/PanelCliente';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar de Bootstrap oscuro */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            Taller de Bicicletas
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Dueño</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cliente">Cliente</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Contenedor principal con margen superior */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<PanelDueno />} />
          <Route path="/cliente" element={<PanelCliente />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;