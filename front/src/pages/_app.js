import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../styles/globals.css';  
import '../styles/home.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>?Qué como hoy? - Tu Creador de Recetas</title>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="4982d68d-803f-4eea-997e-94b0c6361fcd"></script>
        <meta property="description" content="¿Qué como hoy? es una plataforma que te permite generar recetas al instante con los ingredientes que tengas disponible." />
        <meta property="og:image" content="Link preview image URL"></meta>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;