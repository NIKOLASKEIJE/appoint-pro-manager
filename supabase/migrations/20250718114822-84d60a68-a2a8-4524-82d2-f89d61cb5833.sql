-- Fix RLS policy for clinic creation - make it more permissive
DROP POLICY IF EXISTS "Users can create clinics" ON public.clinics;

-- Create a simpler policy that just checks if user is authenticated
CREATE POLICY "Authenticated users can create clinics" 
ON public.clinics 
FOR INSERT 
TO authenticated
WITH CHECK (true);