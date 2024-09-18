import 'bootstrap/dist/css/bootstrap.min.css'; // Importa los estilos de Bootstrap
import '../styles/globals.css';  // Otros estilos globales

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;