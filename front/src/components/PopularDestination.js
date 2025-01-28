import React from 'react';
import Link from 'next/link';

const destinations = [
    {
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80',
        title: 'París',
        days: 5,
        places: 12,
        link: 'https://www.rutadeviaje.es/r/e88ad46f-defa-45a3-9767-6164916a5753'
    },
    {
        image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80',
        title: 'Venecia',
        days: 1,
        places: 8,
        link: 'https://www.rutadeviaje.es/r/287e6220-e2d2-44e8-a4df-fa8a00cab261'
    },
    {
        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80',
        title: 'Tokio',
        days: 7,
        places: 15,
        link: 'https://www.rutadeviaje.es/r/3d4871de-bd1c-453d-bdab-af4ac09cbd4e'
    },
    {
        image: 'https://images.unsplash.com/photo-1593368858664-a7fe556ab936?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Barcelona',
        days: 2,
        places: 10,
        link: 'https://www.rutadeviaje.es/r/040b70f2-6460-4a28-a0d7-5d3fea350e48'
    }
    
];

// Componente para mostrar las tarjetas
const DestinationCard = ({ image, title, days, places, link }) => (
    <a href={link} target="_blank" rel="noopener noreferrer" className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-xl">
            <img 
                src={image} 
                alt={title}
                className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                        <i className="bi bi-clock w-4 h-4"></i>
                        {days} días
                    </span>
                </div>
            </div>
        </div>
    </a>
);

// Componente principal
const PopularDestinations = () => (
    <div className="mb-12">
        <div className="flex justify-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 ml-4 mr-2">
                Destinos Populares
            </h2>
        </div>
        <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {destinations.map((destination, index) => (
                    <DestinationCard key={index} {...destination} />
                ))}
            </div>
        </div>
    </div>
);

export default PopularDestinations;
