import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const venueSlug = 'rumbl-rave';
    const shotgunApiUrl = `https://api.shotgun.live/v1/venues/${venueSlug}/events`;

    const shotgunResponse = await fetch(shotgunApiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!shotgunResponse.ok) {
      console.error('Shotgun API error:', shotgunResponse.status);
      const { data: existingEvents } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      return new Response(
        JSON.stringify({ events: existingEvents || [] }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const shotgunData = await shotgunResponse.json();
    const events = shotgunData.events || shotgunData.data || [];

    const eventsToStore = events.map((event: any) => {
      const eventDate = event.date || event.start_date || new Date().toISOString();
      const isPast = new Date(eventDate) < new Date();

      return {
        slug: event.slug || event.id,
        title: event.name || event.title,
        event_date: eventDate,
        location: event.venue?.name || event.location || 'Paris banlieue',
        address: event.venue?.address || event.address || null,
        image_url: event.image_url || event.cover_url || '/RUMBL.jpg',
        ticket_url: event.url || `https://shotgun.live/events/${event.slug}`,
        lineup: event.lineup || [],
        description: event.description || '',
        status: isPast ? 'past' : 'upcoming',
        is_featured: false,
      };
    });

    for (const event of eventsToStore) {
      await supabase
        .from('events')
        .upsert(event, { onConflict: 'slug' });
    }

    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    return new Response(
      JSON.stringify({ events: allEvents || [] }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch events',
        message: error instanceof Error ? error.message : 'Unknown error',
        events: []
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});