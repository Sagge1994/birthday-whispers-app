-- Make birthday column nullable so contacts can be added without birthdays
ALTER TABLE public.contacts 
ALTER COLUMN birthday DROP NOT NULL;