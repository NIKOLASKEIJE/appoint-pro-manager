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
    const appointmentId = pathParts[pathParts.length - 1] // Get last part as appointment ID if exists

    switch (method) {
      case 'GET':
        if (appointmentId && appointmentId !== 'appointments-api') {
          // Get specific appointment with related data
          const { data: appointment, error } = await supabase
            .from('appointments')
            .select(`
              *,
              patients:patient_id (
                id,
                name,
                cpf,
                email,
                phone
              ),
              professionals:professional_id (
                id,
                name,
                specialty,
                color
              )
            `)
            .eq('id', appointmentId)
            .eq('clinic_id', clinic_id)
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: 'Appointment not found' }), 
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: appointment }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get all appointments with filters
          const searchParams = url.searchParams
          const startDate = searchParams.get('start_date')
          const endDate = searchParams.get('end_date')
          const patientId = searchParams.get('patient_id')
          const professionalId = searchParams.get('professional_id')
          const status = searchParams.get('status')

          let query = supabase
            .from('appointments')
            .select(`
              *,
              patients:patient_id (
                id,
                name,
                cpf,
                email,
                phone
              ),
              professionals:professional_id (
                id,
                name,
                specialty,
                color
              )
            `)
            .eq('clinic_id', clinic_id)
            .order('start_time', { ascending: true })

          // Apply filters
          if (startDate) {
            query = query.gte('start_time', startDate)
          }
          if (endDate) {
            query = query.lte('start_time', endDate)
          }
          if (patientId) {
            query = query.eq('patient_id', patientId)
          }
          if (professionalId) {
            query = query.eq('professional_id', professionalId)
          }
          if (status) {
            query = query.eq('status', status)
          }

          const { data: appointments, error } = await query

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }), 
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: appointments }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        const createData = await req.json()
        
        // Validate required fields
        if (!createData.title || !createData.patient_id || !createData.professional_id || 
            !createData.start_time || !createData.end_time) {
          return new Response(
            JSON.stringify({ 
              error: 'Título, patient_id, professional_id, start_time e end_time são obrigatórios' 
            }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verify patient and professional belong to the clinic
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('id', createData.patient_id)
          .eq('clinic_id', clinic_id)
          .single()

        const { data: professional } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', createData.professional_id)
          .eq('clinic_id', clinic_id)
          .single()

        if (!patient || !professional) {
          return new Response(
            JSON.stringify({ error: 'Paciente ou profissional não encontrado nesta clínica' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create appointment
        const { data: newAppointment, error: createError } = await supabase
          .from('appointments')
          .insert({
            title: createData.title,
            patient_id: createData.patient_id,
            professional_id: createData.professional_id,
            start_time: createData.start_time,
            end_time: createData.end_time,
            status: createData.status || 'scheduled',
            attendance_status: createData.attendance_status || 'scheduled',
            clinic_id: clinic_id
          })
          .select(`
            *,
            patients:patient_id (
              id,
              name,
              cpf,
              email,
              phone
            ),
            professionals:professional_id (
              id,
              name,
              specialty,
              color
            )
          `)
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: newAppointment }), 
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        if (!appointmentId || appointmentId === 'appointments-api') {
          return new Response(
            JSON.stringify({ error: 'Appointment ID is required for update' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()

        // If updating patient_id or professional_id, verify they belong to the clinic
        if (updateData.patient_id) {
          const { data: patient } = await supabase
            .from('patients')
            .select('id')
            .eq('id', updateData.patient_id)
            .eq('clinic_id', clinic_id)
            .single()

          if (!patient) {
            return new Response(
              JSON.stringify({ error: 'Paciente não encontrado nesta clínica' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        if (updateData.professional_id) {
          const { data: professional } = await supabase
            .from('professionals')
            .select('id')
            .eq('id', updateData.professional_id)
            .eq('clinic_id', clinic_id)
            .single()

          if (!professional) {
            return new Response(
              JSON.stringify({ error: 'Profissional não encontrado nesta clínica' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        // Update appointment
        const updateFields: any = {}
        if (updateData.title) updateFields.title = updateData.title
        if (updateData.patient_id) updateFields.patient_id = updateData.patient_id
        if (updateData.professional_id) updateFields.professional_id = updateData.professional_id
        if (updateData.start_time) updateFields.start_time = updateData.start_time
        if (updateData.end_time) updateFields.end_time = updateData.end_time
        if (updateData.status) updateFields.status = updateData.status
        if (updateData.attendance_status) updateFields.attendance_status = updateData.attendance_status

        const { data: updatedAppointment, error: updateError } = await supabase
          .from('appointments')
          .update(updateFields)
          .eq('id', appointmentId)
          .eq('clinic_id', clinic_id)
          .select(`
            *,
            patients:patient_id (
              id,
              name,
              cpf,
              email,
              phone
            ),
            professionals:professional_id (
              id,
              name,
              specialty,
              color
            )
          `)
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: updatedAppointment }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        if (!appointmentId || appointmentId === 'appointments-api') {
          return new Response(
            JSON.stringify({ error: 'Appointment ID is required for deletion' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete appointment
        const { error: deleteError } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointmentId)
          .eq('clinic_id', clinic_id)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Appointment deleted successfully' }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }), 
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in appointments-api:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})