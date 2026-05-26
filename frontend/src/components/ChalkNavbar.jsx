import { Link, useLocation } from 'react-router-dom';

export default function ChalkNavbar() {
  const location = useLocation();

  return (
    <nav className="chalk-navbar">
      <div className="chalk-header-title">
        <Link to="/" className="chalk-brand-link">
          <h1 className="chalk-brand">
            <span className="chalk-brand-proyecto">PROYECTO</span>{' '}
            <span className="chalk-brand-bike">bike</span>
          </h1>
        </Link>
      </div>
      <div className="chalk-navbar-spacer" aria-hidden="true" />
      <div className="chalk-navbar-consulta-wrap">
        {/* Se muestra SOLO si estamos en la Home (ruta raíz '/') */}
        {location.pathname === '/' && (
          <Link
            to="/cliente"
            className="chalk-consulta-link chalk-consulta-header-nav"
          >
            CONSULTÁ EL ESTADO DE TU BICICLETA
          </Link>
        )}
      </div>
    </nav>
  );
}
