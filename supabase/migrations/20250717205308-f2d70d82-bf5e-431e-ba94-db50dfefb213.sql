-- Add role column to user_clinics table for master account system
ALTER TABLE public.user_clinics 
ADD COLUMN IF NOT EXISTS role_type TEXT NOT NULL DEFAULT 'user' CHECK (role_type IN ('master', 'admin', 'user'));

-- Update existing records to have proper role_type
UPDATE public.user_clinics SET role_type = 'master' WHERE role = 'admin';