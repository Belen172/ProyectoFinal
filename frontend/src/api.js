import axios from 'axios';

// Una "instancia" de axios que ya sabe dónde está el backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // La dirección de tu NestJS
});

export default api;