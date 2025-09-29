-- Add timezone support to user profiles
ALTER TABLE public.profiles 
ADD COLUMN timezone TEXT DEFAULT 'Europe/Stockholm';

-- Add timezone to weekly_reminders table  
ALTER TABLE public.weekly_reminders
ADD COLUMN timezone TEXT DEFAULT 'Europe/Stockholm';