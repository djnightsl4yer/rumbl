import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SaleRequest {
  ref_code: string;
  sale_type: string;
  amount: number;
  quantity?: number;
  event_name?: string;
  commission_rate?: number;
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
      const body: SaleRequest = await req.json();
      
      const {
        ref_code,
        sale_type,
        amount,
        quantity = 1,
        event_name = null,
        commission_rate = 0.10
      } = body;

      if (!ref_code || !sale_type || !amount) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: ref_code, sale_type, amount' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: saleId, error: saleError } = await supabase.rpc(
        'record_ambassador_sale',
        {
          p_ref_code: ref_code,
          p_sale_type: sale_type,
          p_amount: amount,
          p_quantity: quantity,
          p_event_name: event_name,
          p_commission_rate: commission_rate
        }
      );

      if (saleError) {
        throw saleError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          sale_id: saleId,
          ref_code,
          amount,
          quantity
        }),
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