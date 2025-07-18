import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
};

interface Database {
  public: {
    Tables: {
      api_tokens: {
        Row: {
          id: string;
          user_id: string;
          clinic_id: string;
          name: string;
          token_hash: string;
          created_at: string;
          last_used_at: string | null;
          expires_at: string | null;
          is_active: boolean;
        };
        Insert: {
          user_id: string;
          clinic_id: string;
          name: string;
          token_hash: string;
          expires_at?: string | null;
        };
      };
    };
    Functions: {
      is_clinic_admin: {
        Args: { p_user_id: string; p_clinic_id: string };
        Returns: boolean;
      };
    };
  };
}

async function generateSecureToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get and validate auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's clinic
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .eq('role', 'clinic_admin')
      .single();

    if (roleError || !userRoles) {
      return new Response(
        JSON.stringify({ error: 'Only clinic admins can manage API tokens' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clinicId = userRoles.clinic_id;
    const url = new URL(req.url);
    const tokenId = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      // List all tokens for the user's clinic
      const { data: tokens, error } = await supabase
        .from('api_tokens')
        .select('id, name, created_at, last_used_at, expires_at, is_active, token_hash')
        .eq('user_id', user.id)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tokens:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch tokens' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hide full token, show only last 4 characters
      const sanitizedTokens = tokens.map(token => ({
        ...token,
        token_preview: `****${token.token_hash.slice(-4)}`,
        token_hash: undefined
      }));

      return new Response(
        JSON.stringify(sanitizedTokens),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      // Create new API token
      const { name, expiresInDays } = await req.json();

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Token name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate secure token
      const token = await generateSecureToken();
      const tokenHash = await hashToken(token);

      // Calculate expiration date if provided
      let expiresAt = null;
      if (expiresInDays && typeof expiresInDays === 'number' && expiresInDays > 0) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + expiresInDays);
        expiresAt = expDate.toISOString();
      }

      // Insert token into database
      const { data: newToken, error } = await supabase
        .from('api_tokens')
        .insert({
          user_id: user.id,
          clinic_id: clinicId,
          name: name.trim(),
          token_hash: tokenHash,
          expires_at: expiresAt
        })
        .select('id, name, created_at, expires_at')
        .single();

      if (error) {
        console.error('Error creating token:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          ...newToken,
          token: token, // Return the actual token only once during creation
          token_preview: `****${tokenHash.slice(-4)}`
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'DELETE' && tokenId) {
      // Delete specific token
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', tokenId)
        .eq('user_id', user.id)
        .eq('clinic_id', clinicId);

      if (error) {
        console.error('Error deleting token:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Token deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});