import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ChalkboardLayout from '../components/ChalkboardLayout';
import logoTaller from '../assets/logo.png';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      const { data } = await api.post('/auth/login', { identificador: usuario, password });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      data.usuario.rol === 'ADMIN' ? navigate('/dueno') : navigate('/cliente');
    } catch { setError('Usuario o contraseña incorrectos'); }
    finally { setCargando(false); }
  };

  return (
    <ChalkboardLayout>
      {/* Contenedor que ocupa toda la pantalla menos la navbar */}
      <div className="d-flex flex-column" style={{ minHeight: 'calc(100vh - 100px)' }}>
        
        {/* Cuerpo que empuja el footer al piso */}
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div style={{
            width: '100%', maxWidth: '400px', background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)', borderRadius: '8px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)', padding: '2rem',
            backdropFilter: 'blur(10px)', color: '#fff', textAlign: 'center'
          }}>
            <h3 className="mb-4" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 800 }}>INICIAR SESIÓN</h3>
            {error && (
              <div
                className="text-center mx-auto"
                style={{
                  maxWidth: '370px',
                  marginBottom: '0.5rem',
                  color: '#ff8787', // Un rojo más suave que combina mejor
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  background: 'rgba(220, 53, 69, 0.1)', // Fondo rojo muy sutil
                  border: '2px dashed #ff8787',
                  borderRadius: '7px',
                  padding: '1em 1.2em',
                  fontSize: '1.05rem',
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 10px 1.5px rgba(0,0,0,0.12)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {error}
              </div>
            )}
            
            <form onSubmit={manejarSubmit}>
              <div className="mb-3 text-start">
                <label className="form-label" style={{ letterSpacing: '0.05em', fontWeight: 400, color: 'var(--chalk-muted, #c9c4b8)' }}>USUARIO O EMAIL</label>
                <input type="text" className="form-control" placeholder="ejemplo@correo.com" value={usuario} onChange={(e) => setUsuario(e.target.value)} required style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '2px solid #fff', color: '#fff', borderRadius: '0' }} />
              </div>
              <div className="mb-4 text-start">
                <label className="form-label" style={{ letterSpacing: '0.05em', fontWeight: 400, color: 'var(--chalk-muted, #c9c4b8)' }}>CONTRASEÑA</label>
                <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '2px solid #fff', color: '#fff', borderRadius: '0' }} />
              </div>
              <button type="submit" className="btn w-100" style={{ border: '2px solid #fff', borderRadius: '45px', color: '#fff', fontWeight: 700 }}>
                {cargando ? 'INGRESANDO...' : 'INGRESAR'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer: Este div SIEMPRE quedará debajo del formulario por el flex-grow-1 de arriba */}
        <div
          className="chalk-logo-center-wrapper"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            /* Regulamos el aire superior dinámicamente para calzar la Home */
            marginTop: '2rem', 
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