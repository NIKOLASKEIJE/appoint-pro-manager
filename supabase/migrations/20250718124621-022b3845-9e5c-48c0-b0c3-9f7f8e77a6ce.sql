-- Create a function to automatically make the first user of a clinic an admin
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user_clinic relationship for this clinic
  IF NOT EXISTS (
    SELECT 1 FROM public.user_clinics 
    WHERE clinic_id = NEW.clinic_id
  ) THEN
    -- Insert the user as clinic admin
    INSERT INTO public.user_roles (user_id, clinic_id, role)
    VALUES (NEW.user_id, NEW.clinic_id, 'clinic_admin'::public.user_role);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically make first user admin
CREATE TRIGGER trigger_make_first_user_admin
  AFTER INSERT ON public.user_clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.make_first_user_admin();

-- Create function for users to assign themselves as admin (if no admin exists)
CREATE OR REPLACE FUNCTION public.assign_self_as_admin(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_admin BOOLEAN;
BEGIN
  -- Check if clinic already has an admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE clinic_id = p_clinic_id AND role = 'clinic_admin'
  ) INTO has_admin;
  
  -- If no admin exists, make current user admin
  IF NOT has_admin THEN
    INSERT INTO public.user_roles (user_id, clinic_id, role)
    VALUES (auth.uid(), p_clinic_id, 'clinic_admin'::public.user_role)
    ON CONFLICT (user_id, clinic_id) 
    DO UPDATE SET role = 'clinic_admin'::public.user_role;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;