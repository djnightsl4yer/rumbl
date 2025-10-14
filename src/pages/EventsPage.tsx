import { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EditableElement from '../components/EditableElement';

interface Event {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  location: string;
  image_url: string;
  ticket_url?: string;
  lineup?: string[];
  description?: string;
  status: 'upcoming' | 'past' | 'cancelled';
}

function EventCard({ event, isPast }: { event: Event; isPast?: boolean }) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <article className="group relative bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-red-500 transition-all duration-300 card-focusable" tabIndex={0} role="article" aria-label={`Événement: ${event.title}`}>
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.image_url || '/RUMBL.jpg'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          style={{ filter: 'brightness(0.6) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold tracking-wider mb-2">{event.title}</h3>
          <div className="flex items-center text-gray-300 text-sm mb-2">
            <Calendar size={16} className="mr-2" />
            <span>{formatDate(event.event_date)}</span>
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

        {!isPast && event.ticket_url && (
          <a
            href={event.ticket_url}
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
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    title: 'ÉVÉNEMENTS RÜMBL',
    subtitle: 'Découvrez nos prochaines soirées et revivez les meilleures raves'
  });

  useEffect(() => {
    fetchEvents();
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('page', 'events');

    if (data && data.length > 0) {
      const heroSection = data.find(s => s.section === 'hero');
      if (heroSection) {
        setContent({
          title: heroSection.content?.title || content.title,
          subtitle: heroSection.content?.subtitle || content.subtitle
        });
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const now = new Date();
        const upcoming = data.filter(event =>
          event.status === 'upcoming' || new Date(event.event_date) >= now
        );
        const past = data.filter(event =>
          event.status === 'past' || new Date(event.event_date) < now
        );

        setUpcomingEvents(upcoming.reverse());
        setPastEvents(past);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <EditableElement
            page="events"
            section="hero"
            field="title"
            value={content.title}
            as="h1"
            className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow"
            onUpdate={(val) => setContent({...content, title: val})}
          />
          <EditableElement
            page="events"
            section="hero"
            field="subtitle"
            value={content.subtitle}
            as="p"
            className="text-gray-400 tracking-wide"
            onUpdate={(val) => setContent({...content, subtitle: val})}
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">
            <p>Chargement des événements...</p>
          </div>
        ) : (
          <>
            <section className="mb-20">
              <h2 className="text-3xl font-bold tracking-wider mb-8 text-red-500 flex items-center">
                <span className="w-12 h-1 bg-red-500 mr-4"></span>
                À VENIR
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>Aucun événement à venir pour le moment. Restez connectés !</p>
                </div>
              )}
            </section>

            {pastEvents.length > 0 && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
