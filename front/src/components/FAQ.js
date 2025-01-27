const FAQ = () => {
  return (
    <section className="container mb-5">
      <div className="card shadow-custom">
        <div className="card-body p-4">
          <h2 className="card-title text-dark text-center mb-4">Preguntas Frecuentes</h2>
          
          <div className="faq-item mb-4">
            <h3 className="mb-1">¿Qué es Ruta de viaje?</h3>
            <p>Ruta de Viaje es una herramienta en línea que te ayuda a planificar tu itinerario de viaje en cuestión de minutos. Solo necesitas ingresar el destino que quieres visitar y los días que estarás allí, y nosotros generamos un plan personalizado con actividades, lugares destacados y recomendaciones para aprovechar al máximo tu tiempo.</p>
          </div>

          <div className="faq-item mb-4">
            <h3 className="mb-1">¿Cómo se usa Ruta de viaje?</h3>
            <p>Es muy fácil: </p>
            <ul>
              <li>1. Escribe el nombre de la ciudad o destino que deseas visitar. </li>
              <li>2. Selecciona cuántos días durará tu viaje. </li>
              <li>3. Haz clic en “Generar mi itinerario” y recibirás un itinerario completo y listo para usar. </li>
            </ul>
            <p>¡Así de rápido y sencillo! </p>
          </div>

          <div className="faq-item mb-4">
            <h3 className="mb-1">¿Cómo obtener un código promocional?</h3>
            <p>Puedes conseguir códigos promocionales de varias formas: </p>
            <ul>
              <li><strong>Canal de YouTube:</strong> Síguenos en nuestro canal(Mood de viaje), donde compartimos contenido exclusivo sobre viajes y promociones especiales. </li>
              <li><strong>Colaboraciones con influencers:</strong> Busca nuestras promociones en las redes de influencers con los que trabajamos. ¡Podrían tener un código especial para ti! </li>
            </ul>
            <p>¿Tienes un código? ¡Aplícalo antes de generar tu itinerario y disfruta de un descuento!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;