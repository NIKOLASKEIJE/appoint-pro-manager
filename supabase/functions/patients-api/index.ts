import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's clinic
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRoles) {
      return new Response(
        JSON.stringify({ error: 'User not associated with any clinic' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clinic_id = userRoles.clinic_id
    const url = new URL(req.url)
    const method = req.method
    const pathParts = url.pathname.split('/').filter(Boolean)
    const patientId = pathParts[pathParts.length - 1] // Get last part as patient ID if exists

    switch (method) {
      case 'GET':
        if (patientId && patientId !== 'patients-api') {
          // Get specific patient
          const { data: patient, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .eq('clinic_id', clinic_id)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: 'Patient not found' }), 
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: patient }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get all patients
          const { data: patients, error } = await supabase
            .from('patients')
            .select('*')
            .eq('clinic_id', clinic_id)
            .order('created_at', { ascending: false })

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }), 
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: patients }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        const createData = await req.json()
        
        // Validate required fields
        if (!createData.name || !createData.cpf) {
          return new Response(
            JSON.stringify({ error: 'Nome e CPF são obrigatórios' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create patient
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            name: createData.name,
            cpf: createData.cpf,
            email: createData.email || null,
            phone: createData.phone || null,
            birth_date: createData.birth_date || null,
            notes: createData.notes || null,
            clinic_id: clinic_id
          })
          .select()
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: newPatient }), 
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        if (!patientId || patientId === 'patients-api') {
          return new Response(
            JSON.stringify({ error: 'Patient ID is required for update' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()

        // Update patient
        const { data: updatedPatient, error: updateError } = await supabase
          .from('patients')
          .update({
            name: updateData.name,
            cpf: updateData.cpf,
            email: updateData.email || null,
            phone: updateData.phone || null,
            birth_date: updateData.birth_date || null,
            notes: updateData.notes || null
          })
          .eq('id', patientId)
          .eq('clinic_id', clinic_id)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: updatedPatient }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        if (!patientId || patientId === 'patients-api') {
          return new Response(
            JSON.stringify({ error: 'Patient ID is required for deletion' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete patient
        const { error: deleteError } = await supabase
          .from('patients')
          .delete()
          .eq('id', patientId)
          .eq('clinic_id', clinic_id)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Patient deleted successfully' }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }), 
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in patients-api:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})