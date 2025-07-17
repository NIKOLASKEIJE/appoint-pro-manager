-- Create clinics table
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professionals table
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_clinics junction table for user access control
CREATE TABLE public.user_clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

-- Create indexes for performance
CREATE INDEX idx_appointments_start_time_clinic ON public.appointments(start_time, clinic_id);
CREATE INDEX idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX idx_professionals_clinic ON public.professionals(clinic_id);
CREATE INDEX idx_user_clinics_user ON public.user_clinics(user_id);

-- Enable Row Level Security
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_clinics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinics
CREATE POLICY "Users can view their clinics" ON public.clinics
  FOR SELECT USING (
    id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create clinics" ON public.clinics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their clinics" ON public.clinics
  FOR UPDATE USING (
    id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for patients
CREATE POLICY "Users can view patients from their clinics" ON public.patients
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create patients in their clinics" ON public.patients
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update patients in their clinics" ON public.patients
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete patients in their clinics" ON public.patients
  FOR DELETE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for professionals (similar to patients)
CREATE POLICY "Users can view professionals from their clinics" ON public.professionals
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create professionals in their clinics" ON public.professionals
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update professionals in their clinics" ON public.professionals
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete professionals in their clinics" ON public.professionals
  FOR DELETE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for appointments
CREATE POLICY "Users can view appointments from their clinics" ON public.appointments
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments in their clinics" ON public.appointments
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments in their clinics" ON public.appointments
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments in their clinics" ON public.appointments
  FOR DELETE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_clinics 
      WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for user_clinics
CREATE POLICY "Users can view their own clinic associations" ON public.user_clinics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own clinic associations" ON public.user_clinics
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();