import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const { data } = await api.post('/auth/login', {
        identificador: usuario,
        password,
      });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.usuario));

      if (data.usuario.rol === 'ADMIN') {
        navigate('/dueño');
      } else if (data.usuario.rol === 'CLIENTE') {
        navigate('/cliente');
      }
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">Iniciar Sesión</h3>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={manejarSubmit}>
            <div className="mb-3">
              <label className="form-label">Usuario o Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="ejemplo@correo.com"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={cargando}
            >
              {cargando ? 'Ingresando...' : 'Ingresar al Taller'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
