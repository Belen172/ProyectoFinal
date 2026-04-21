import axios from 'axios';

// Una "instancia" de axios que ya sabe dónde está el backend
const api = axios.create({
  baseURL: 'http://localhost:3000', // La dirección de tu NestJS
});

export default api;