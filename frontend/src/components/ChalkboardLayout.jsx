import { fotosTaller } from '../assets/fotosTaller';
import ChalkNavbar from './ChalkNavbar';
import '../pages/Home.css';

export default function ChalkboardLayout({ children, scrollable = false }) {
  return (
    <div
      className={`chalkboard-home${scrollable ? ' chalkboard-scroll' : ' chalkboard-fixed'}`}
    >
      <div className="chalk-watermark" aria-hidden="true">
        {fotosTaller.map((src, index) => (
          <img key={index} src={src} alt="" />
        ))}
      </div>

      <ChalkNavbar />

      <div className="chalk-page-body">{children}</div>
    </div>
  );
}
