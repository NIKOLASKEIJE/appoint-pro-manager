-- Enable realtime for appointments table
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.appointments;

-- Enable realtime for patients table  
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.patients;

-- Enable realtime for professionals table
ALTER TABLE public.professionals REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.professionals;