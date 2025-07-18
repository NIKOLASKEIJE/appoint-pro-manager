-- Create api_tokens table for user token management
CREATE TABLE public.api_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for token management
CREATE POLICY "Clinic admins can manage their tokens" 
ON public.api_tokens 
FOR ALL 
USING (is_clinic_admin(auth.uid(), clinic_id));

-- Create function to validate API tokens
CREATE OR REPLACE FUNCTION public.validate_api_token(p_token_hash TEXT)
RETURNS TABLE(user_id UUID, clinic_id UUID, token_valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.user_id,
    t.clinic_id,
    (t.is_active AND (t.expires_at IS NULL OR t.expires_at > now())) as token_valid
  FROM public.api_tokens t
  WHERE t.token_hash = p_token_hash;
  
  -- Update last_used_at if token exists and is valid
  UPDATE public.api_tokens 
  SET last_used_at = now()
  WHERE token_hash = p_token_hash 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now());
END;
$$;