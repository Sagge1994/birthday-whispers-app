-- Add yearly_messages column to store messages for different years
ALTER TABLE public.contacts 
ADD COLUMN yearly_messages JSONB DEFAULT NULL;

-- Add comment to explain the structure
COMMENT ON COLUMN public.contacts.yearly_messages IS 'JSON object storing messages for different years: {"2025": "message for 2025", "2026": "message for 2026"}';