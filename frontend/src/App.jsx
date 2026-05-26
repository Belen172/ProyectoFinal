import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import PanelDueno from './pages/PanelDueno';
import PanelCliente from './pages/PanelCliente';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const rutasChalkboard = ['/', '/cliente', '/login', '/dueño'];
  const usaLayoutChalkboard = rutasChalkboard.includes(location.pathname);

  return (
    <>
      {!usaLayoutChalkboard && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              Proyecto Bike
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
                  <Link className="nav-link" to="/">
                    Inicio
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dueño">
                    Dueño
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cliente">
                    Cliente
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      <div className={usaLayoutChalkboard ? '' : 'container mt-4'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dueño"
            element={
              <ProtectedRoute>
                <PanelDueno />
              </ProtectedRoute>
            }
          />
          <Route path="/cliente" element={<PanelCliente />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
