-- Fix the clinic creation RLS policy - the current one is too restrictive
DROP POLICY IF EXISTS "Users can create clinics" ON public.clinics;

-- Create a proper policy that allows authenticated users to create clinics
CREATE POLICY "Users can create clinics" 
ON public.clinics 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Add a CPF column to patients table for the appointment creation requirement
ALTER TABLE public.patients 
ADD COLUMN cpf TEXT,
ADD COLUMN birth_date DATE;