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
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;