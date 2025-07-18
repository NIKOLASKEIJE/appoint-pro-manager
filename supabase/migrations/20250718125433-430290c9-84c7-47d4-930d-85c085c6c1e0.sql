-- Create profiles table to store user names and additional info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Clinic admins can view and manage profiles of users in their clinic
CREATE POLICY "Clinic admins can manage profiles in their clinics" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur1, public.user_roles ur2
      WHERE ur1.user_id = auth.uid() 
      AND ur1.role = 'clinic_admin'
      AND ur2.user_id = profiles.user_id
      AND ur1.clinic_id = ur2.clinic_id
    )
  );

-- Function to create profile when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, created_by)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'created_by' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'created_by')::UUID
      ELSE NEW.id 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Add trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function for admins to create users with role
CREATE OR REPLACE FUNCTION public.create_user_with_role(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_clinic_id UUID,
  p_role public.user_role,
  p_professional_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if caller is clinic admin
  IF NOT public.is_clinic_admin(auth.uid(), p_clinic_id) THEN
    RAISE EXCEPTION 'Only clinic admins can create users';
  END IF;

  -- This would be handled by the client-side admin API call
  -- Return success indicator for now
  SELECT json_build_object(
    'success', true,
    'message', 'User creation request processed'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;