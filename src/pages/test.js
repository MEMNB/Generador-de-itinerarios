import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Reserva de Hotel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="hero">
        <div className="hero-content">
          <h1>Reserva tu estancia y disfruta de una experiencia de lujo</h1>
          <p>Reserva tu habitación ahora, desde €59 por noche y disfruta de una experiencia de lujo.</p>
          <div className="booking-form">
            <input type="text" placeholder="Check In" />
            <input type="text" placeholder="Check Out" />
            <select>
              <option>1 Huésped</option>
              <option>2 Huéspedes</option>
              <option>3 Huéspedes</option>
              <option>4 Huéspedes</option>
            </select>
            <button>Ver disponibilidad</button>
          </div>
        </div>
      </div>
      <style jsx>{`
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .hero {
          position: relative;
          background-image: url('/images/tu-imagen.jpg'); /* Reemplaza con la URL de tu imagen */
          background-size: cover;
          background-position: center;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-content {
          background: rgba(255, 255, 255, 0.9);
          padding: 2rem;
          border-radius: 10px;
          text-align: center;
          max-width: 600px;
        }

        .hero-content h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .hero-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .booking-form {
          display: flex;
          gap: 1rem;
        }

        .booking-form input,
        .booking-form select,
        .booking-form button {
          padding: 1rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .booking-form button {
          background-color: #d4af37;
          color: white;
          border: none;
          cursor: pointer;
        }

        .booking-form button:hover {
          background-color: #b38e2e;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-content p {
            font-size: 1rem;
          }

          .booking-form {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
