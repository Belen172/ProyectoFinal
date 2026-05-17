import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const userGuardado = localStorage.getItem('user');

  let esAdmin = false;

  if (userGuardado) {
    try {
      const user = JSON.parse(userGuardado);
      esAdmin = user.rol === 'ADMIN';
    } catch {
      esAdmin = false;
    }
  }

  if (!token || !esAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
