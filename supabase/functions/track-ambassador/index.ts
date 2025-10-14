import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TrackingRequest {
  ref: string;
  referrer?: string;
  userAgent?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const { ref, referrer, userAgent }: TrackingRequest = await req.json();

      if (!ref) {
        return new Response(
          JSON.stringify({ error: 'Missing ref parameter' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

      const { data: ambassador, error: ambassadorError } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('ref_code', ref)
        .maybeSingle();

      if (ambassadorError) {
        throw ambassadorError;
      }

      if (!ambassador) {
        return new Response(
          JSON.stringify({ error: 'Ambassador not found', ref }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error: clickError } = await supabase
        .from('ambassador_clicks')
        .insert({
          ambassador_id: ambassador.id,
          referrer: referrer || null,
          user_agent: userAgent || null,
          ip_address: clientIp,
        });

      if (clickError) {
        throw clickError;
      }

      const { error: functionError } = await supabase.rpc(
        'increment_ambassador_stats',
        { ref_code_param: ref, points_to_add: 1 }
      );

      if (functionError) {
        throw functionError;
      }

      return new Response(
        JSON.stringify({ success: true, ref }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});