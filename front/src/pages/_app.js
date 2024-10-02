import 'bootstrap/dist/css/bootstrap.min.css'; // Importa los estilos de Bootstrap
import '../styles/globals.css';  // Otros estilos globales
import '../styles/home.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Ruta de Viaje - Tu Planificador de Viajes</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;