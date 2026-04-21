import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const manejarSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue al mandar el formulario
    
    // Por ahora, simulamos que el inicio de sesión fue exitoso
    // y mandamos al usuario directamente al panel del dueño
    console.log("Iniciando sesión con:", usuario, password);
    navigate('/admin'); 
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">Iniciar Sesión</h3>
          
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
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-100 py-2">
              Ingresar al Taller
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}