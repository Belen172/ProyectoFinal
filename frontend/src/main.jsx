import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'; // importar bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // importar bootstrap bundle (para que los botones y demás elementos de bootstrap funcionen)
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
