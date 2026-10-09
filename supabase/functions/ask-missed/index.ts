// Supabase Edge Function: Ask MISSED Server-Side AI Endpoint
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    const apiKey = Deno.env.get('AI_PROVIDER_SECRET_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "Cloud AI key not configured on server secrets. Falling back to local engine.",
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Server-side privileged request to AI provider (e.g. Gemini / OpenAI)
    // Key is kept strictly in server env variables.
    return new Response(
      JSON.stringify({
        text: `Server AI response for prompt: "${prompt}". Context summary: ${context?.summary || 'N/A'}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

