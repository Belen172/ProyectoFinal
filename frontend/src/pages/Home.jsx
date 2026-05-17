import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { fotosTaller } from '../assets/fotosTaller';
import logoTaller from '../assets/logo.png';
import ChalkboardLayout from '../components/ChalkboardLayout';

export default function Home() {
  const carouselId = 'carouselTaller';

  return (
    <ChalkboardLayout>
      <div
        className="chalk-content"
        style={{
          position: 'relative',
          minHeight: '75vh',
          paddingTop: '3.5rem',
        }}
      >
        <div className="chalk-columns">
          <section className="chalk-col chalk-col-side chalk-col-left">
            <h2 className="chalk-col-title">TU PASIÓN, EN BUENAS MANOS</h2>
            <p className="chalk-col-body">
              Somos un taller especializado en bicicletas. Cada ingreso recibe diagnóstico claro,
              presupuesto honesto y manos que conocen el oficio. Tu bici vuelve a la calle con el
              mismo amor con el que la elegiste.
            </p>
          </section>

          <section className="chalk-col chalk-col-center">
            <div className="carousel-frame">
              <div className="carousel-frame-inner">
                <div
                  id={carouselId}
                  className="carousel slide chalk-carousel"
                  data-bs-ride="carousel"
                  data-bs-interval="4500"
                >
                  <div className="carousel-indicators">
                    {fotosTaller.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        data-bs-target={`#${carouselId}`}
                        data-bs-slide-to={index}
                        className={index === 0 ? 'active' : ''}
                        aria-current={index === 0 ? 'true' : undefined}
                        aria-label={`Foto ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="carousel-inner">
                    {fotosTaller.map((src, index) => (
                      <div
                        key={index}
                        className={`carousel-item${index === 0 ? ' active' : ''}`}
                      >
                        <img src={src} alt="" />
                      </div>
                    ))}
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target={`#${carouselId}`}
                    data-bs-slide="prev"
                  >
                    <span className="carousel-control-prev-icon" aria-hidden="true" />
                    <span className="visually-hidden">Anterior</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target={`#${carouselId}`}
                    data-bs-slide="next"
                  >
                    <span className="carousel-control-next-icon" aria-hidden="true" />
                    <span className="visually-hidden">Siguiente</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="chalk-logo-center-wrapper">
              <img
                src={logoTaller}
                alt="Logo del taller"
                className="chalk-logo chalk-logo-center"
              />
              <div className="chalk-logo-footer-row">
                <span className="chalk-since">desde 11/12/2020</span>
                <Link
                  to="/login"
                  aria-label="Iniciar sesión"
                  className="chalk-login-private chalk-login-fab-btn"
                >
                  <LogIn size={17} strokeWidth={1.2} aria-hidden />
                </Link>
              </div>
            </div>
          </section>

          <section className="chalk-col chalk-col-side chalk-col-right">
            <h2 className="chalk-col-title">TRANSPARENCIA EN CADA SERVICE</h2>
            <p className="chalk-col-body">
              Ingresá tu DNI y seguí en tiempo real cada etapa del servicio: desde el ingreso hasta
              la entrega. Sin llamadas innecesarias, sin incertidumbre. Sabés qué pasa con tu bici
              en todo momento.
            </p>
          </section>
        </div>
      </div>
    </ChalkboardLayout>
  );
}
