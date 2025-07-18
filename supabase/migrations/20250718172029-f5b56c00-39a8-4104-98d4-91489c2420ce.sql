-- Add attendance status to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS attendance_status TEXT DEFAULT 'scheduled' 
CHECK (attendance_status IN ('scheduled', 'attended', 'no_show', 'cancelled', 'rescheduled'));

-- Update existing appointments to have the default status
UPDATE public.appointments 
SET attendance_status = 'scheduled' 
WHERE attendance_status IS NULL;