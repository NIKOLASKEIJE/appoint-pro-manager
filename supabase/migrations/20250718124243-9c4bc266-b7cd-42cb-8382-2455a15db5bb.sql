-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('clinic_admin', 'professional', 'receptionist');

-- Create user_roles table  
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'professional',
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role_in_clinic(p_user_id UUID, p_clinic_id UUID)
RETURNS public.user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = p_user_id AND clinic_id = p_clinic_id;
$$;

-- Create function to check if user is clinic admin
CREATE OR REPLACE FUNCTION public.is_clinic_admin(p_user_id UUID, p_clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE  
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p_user_id 
    AND clinic_id = p_clinic_id 
    AND role = 'clinic_admin'
  );
$$;

-- Create function to get user's professional_id
CREATE OR REPLACE FUNCTION public.get_user_professional_id(p_user_id UUID, p_clinic_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER  
AS $$
  SELECT professional_id FROM public.user_roles 
  WHERE user_id = p_user_id AND clinic_id = p_clinic_id;
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clinic admins can manage roles in their clinics" ON public.user_roles
  FOR ALL USING (
    public.is_clinic_admin(auth.uid(), clinic_id)
  );

-- Update appointments RLS policies to support professional access
DROP POLICY IF EXISTS "Users can view appointments from their clinics" ON public.appointments;
CREATE POLICY "Users can view appointments from their clinics" ON public.appointments
  FOR SELECT USING (
    clinic_id IN (
      SELECT ur.clinic_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
    AND (
      -- Clinic admins can see all appointments
      public.is_clinic_admin(auth.uid(), clinic_id)
      OR
      -- Professionals can only see their own appointments  
      professional_id = public.get_user_professional_id(auth.uid(), clinic_id)
    )
  );

-- Update other appointment policies for professional restrictions
DROP POLICY IF EXISTS "Users can create appointments in their clinics" ON public.appointments;
CREATE POLICY "Users can create appointments in their clinics" ON public.appointments
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT ur.clinic_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
    AND (
      -- Only clinic admins can create appointments for now
      public.is_clinic_admin(auth.uid(), clinic_id)
    )
  );

DROP POLICY IF EXISTS "Users can update appointments in their clinics" ON public.appointments;  
CREATE POLICY "Users can update appointments in their clinics" ON public.appointments
  FOR UPDATE USING (
    clinic_id IN (
      SELECT ur.clinic_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
    AND (
      -- Clinic admins can update all appointments
      public.is_clinic_admin(auth.uid(), clinic_id)
      OR
      -- Professionals can only update their own appointments
      professional_id = public.get_user_professional_id(auth.uid(), clinic_id)
    )
  );

DROP POLICY IF EXISTS "Users can delete appointments in their clinics" ON public.appointments;
CREATE POLICY "Users can delete appointments in their clinics" ON public.appointments
  FOR DELETE USING (
    clinic_id IN (
      SELECT ur.clinic_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
    AND (
      -- Only clinic admins can delete appointments
      public.is_clinic_admin(auth.uid(), clinic_id)
    )
  );

-- Update professionals policies for role-based access
DROP POLICY IF EXISTS "Users can view professionals from their clinics" ON public.professionals;
CREATE POLICY "Users can view professionals from their clinics" ON public.professionals
  FOR SELECT USING (
    clinic_id IN (
      SELECT ur.clinic_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

-- Only clinic admins can manage professionals
DROP POLICY IF EXISTS "Users can create professionals in their clinics" ON public.professionals;
CREATE POLICY "Users can create professionals in their clinics" ON public.professionals
  FOR INSERT WITH CHECK (
    public.is_clinic_admin(auth.uid(), clinic_id)
  );

DROP POLICY IF EXISTS "Users can update professionals in their clinics" ON public.professionals;
CREATE POLICY "Users can update professionals in their clinics" ON public.professionals  
  FOR UPDATE USING (
    public.is_clinic_admin(auth.uid(), clinic_id)
  );

DROP POLICY IF EXISTS "Users can delete professionals in their clinics" ON public.professionals;
CREATE POLICY "Users can delete professionals in their clinics" ON public.professionals
  FOR DELETE USING (
    public.is_clinic_admin(auth.uid(), clinic_id)
  );

-- Patients policies remain the same (clinic admins and professionals can manage)
-- But we can add role restrictions if needed

-- Add trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();