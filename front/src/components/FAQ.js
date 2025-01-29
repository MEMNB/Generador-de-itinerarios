import React, { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="container mb-5">
      <div className="card shadow-custom">
        <div className="card-body p-4">
          <h1 className="card-title text-dark text-center mb-4">Preguntas Frecuentes</h1>
          
          <div className="faq-item mb-4">
            <button className="btn btn-shadow w-100 text-left" onClick={() => toggleFAQ(0)}>
              <h3 className="mb-1">
                ¿Qué es Ruta de viaje? 
                <span>{openIndex === 0 ? ' ▲' : ' ▼'}</span>
              </h3>
            </button>
            {openIndex === 0 && <p>Ruta de Viaje es una herramienta en línea que te ayuda a planificar tu itinerario de viaje en cuestión de minutos. Solo necesitas ingresar el destino que quieres visitar y los días que estarás allí, y nosotros generamos un plan personalizado con actividades, lugares destacados y recomendaciones para aprovechar al máximo tu tiempo.</p>}
          </div>
          

          <div className="faq-item mb-4">
            <button className="btn btn-shadow w-100 text-left" onClick={() => toggleFAQ(1)}>
              <h3 className="mb-1">
                ¿Cómo se usa Ruta de viaje? 
                <span>{openIndex === 1 ? ' ▲' : ' ▼'}</span>
              </h3>
            </button>
            {openIndex === 1 && (
              <>
                <p>Es muy fácil: </p>
                <ul>
                  <li>1. Escribe el nombre de la ciudad o destino que deseas visitar. </li>
                  <li>2. Selecciona cuántos días durará tu viaje. </li>
                  <li>3. Haz clic en "Generar mi itinerario" y recibirás un itinerario completo y listo para usar. </li>
                </ul>
                <p>¡Así de rápido y sencillo! </p>
              </>
            )}
          </div>

          <div className="faq-item mb-4">
            <button className="btn btn-shadow w-100 text-left" onClick={() => toggleFAQ(2)}>
              <h3 className="mb-1">
                ¿Qué incluye el itinerario? 
                <span>{openIndex === 2 ? ' ▲' : ' ▼'}</span>
              </h3>
            </button>
            {openIndex === 2 && (
              <>
                <p>El itinerario incluye recomendaciones de lugares para visitar, sugerencias de restaurantes, actividades culturales y consejos prácticos para cada día.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;