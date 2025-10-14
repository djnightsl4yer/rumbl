import { Calendar, MapPin, ExternalLink } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  shotgunLink?: string;
  lineup?: string[];
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'RÜMBL #004',
    date: 'À venir',
    location: 'Paris banlieue - TBA',
    image: '/RUMBL.jpg',
    shotgunLink: 'https://shotgun.live/venues/rumbl-rave',
    lineup: ['À confirmer'],
  },
];

const pastEvents: Event[] = [
  {
    id: '2',
    title: 'RÜMBL #003',
    date: 'Décembre 2024',
    location: 'Warehouse, Paris banlieue',
    image: '/RUMBL.jpg',
    lineup: ['DJ Set 1', 'DJ Set 2', 'Live Act'],
  },
  {
    id: '3',
    title: 'RÜMBL #002',
    date: 'Octobre 2024',
    location: 'Warehouse, Paris banlieue',
    image: '/insta rumbl.jpg',
    lineup: ['DJ Set 1', 'DJ Set 2'],
  },
  {
    id: '4',
    title: 'RÜMBL #001',
    date: 'Septembre 2024',
    location: 'Warehouse, Paris banlieue',
    image: '/RUMBL.jpg',
    lineup: ['DJ Set 1', 'DJ Set 2', 'Live Act'],
  },
];

function EventCard({ event, isPast }: { event: Event; isPast?: boolean }) {
  return (
    <article className="group relative bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-red-500 transition-all duration-300 card-focusable" tabIndex={0} role="article" aria-label={`Événement: ${event.title}`}>
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          style={{ filter: 'brightness(0.6) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold tracking-wider mb-2">{event.title}</h3>
          <div className="flex items-center text-gray-300 text-sm mb-2">
            <Calendar size={16} className="mr-2" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <MapPin size={16} className="mr-2" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {event.lineup && event.lineup.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-red-500 mb-2 tracking-wider">LINEUP</h4>
            <div className="flex flex-wrap gap-2">
              {event.lineup.map((artist, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-900 text-gray-300 px-3 py-1 rounded-full"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isPast && event.shotgunLink && (
          <a
            href={event.shotgunLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-bold tracking-wider transition-all duration-300 transform hover:scale-105"
            aria-label={`Acheter des billets pour ${event.title}`}
          >
            <ExternalLink size={18} className="mr-2" />
            BILLETS
          </a>
        )}
      </div>
    </article>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow">
            ÉVÉNEMENTS
          </h1>
          <p className="text-gray-400 tracking-wide">
            Hard & Groovy Techno // Warehouse & chaos maîtrisé
          </p>
        </div>

        <section className="mb-20">
          <h2 className="text-3xl font-bold tracking-wider mb-8 text-red-500 flex items-center">
            <span className="w-12 h-1 bg-red-500 mr-4"></span>
            À VENIR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-wider mb-8 text-gray-400 flex items-center">
            <span className="w-12 h-1 bg-gray-600 mr-4"></span>
            PASSÉS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
