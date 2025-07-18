-- Enable real-time for tables
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER TABLE public.professionals REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.professionals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Update appointments table to include attendance status
ALTER TABLE public.appointments 
ADD COLUMN attendance_status TEXT DEFAULT 'scheduled' 
CHECK (attendance_status IN ('scheduled', 'attended', 'no_show', 'cancelled', 'rescheduled'));

-- Update existing appointments to have the default status
UPDATE public.appointments 
SET attendance_status = 'scheduled' 
WHERE attendance_status IS NULL;