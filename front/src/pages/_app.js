import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../styles/globals.css';  
import '../styles/home.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Ruta de Viaje - Tu Planificador de Viajes</title>
        <script defer data-domain="rutadeviaje.es" src="http://plausible-pwssk0kkokgo8ggo8kcw4wsc.157.90.124.158.sslip.io/js/script.js"></script>
        <meta property="description" content="Ruta de Viaje es una plataforma que te permite planificar tus viajes. Genera un itinerario al instante ingresando la ciudad que desees y los días que planeas estar." />
        <meta property="og:image" content="Link preview image URL"></meta>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;