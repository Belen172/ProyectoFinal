import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import PanelDueno from './pages/PanelDueno';
import PanelCliente from './pages/PanelCliente';

function App() {
  return (
    <BrowserRouter>
      {/* Menú de navegación temporal para probar que las rutas cambian */}
      <nav style={{ padding: '15px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '15px', fontWeight: 'bold' }}>Login</Link>
        <Link to="/admin" style={{ marginRight: '15px', fontWeight: 'bold' }}>Dueño</Link>
        <Link to="/cliente" style={{ fontWeight: 'bold' }}>Cliente</Link>
      </nav>

      <div style={{ padding: '20px' }}>
        {/* Acá adentro se van a renderizar las páginas según la URL */}
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