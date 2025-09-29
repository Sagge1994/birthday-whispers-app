import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const useSMS = () => {
  const { toast } = useToast();

  const sendSMS = async (phoneNumber: string, message: string) => {
    try {
      // Format phone number - remove spaces and ensure correct format
      const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
      
      // Create SMS URL - works on both mobile and desktop
      const smsUrl = `sms:${cleanPhone}${Capacitor.getPlatform() === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
      
      // Try to open SMS app
      const opened = window.open(smsUrl, '_self');
      
      if (opened || Capacitor.isNativePlatform()) {
        toast({
          title: "SMS öppnad",
          description: "SMS-appen öppnades med ditt meddelande",
        });
      } else {
        // Fallback if SMS app doesn't open - copy to clipboard
        await navigator.clipboard.writeText(`Till: ${cleanPhone}\nMeddelande: ${message}`);
        toast({
          title: "SMS-text kopierat",
          description: "Kunde inte öppna SMS-app, meddelandet kopierat till urklipp",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      // Final fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(`Till: ${phoneNumber}\nMeddelande: ${message}`);
        toast({
          title: "SMS-text kopierat", 
          description: "Kunde inte öppna SMS-app, meddelandet kopierat till urklipp",
          variant: "destructive",
        });
      } catch (clipboardError) {
        toast({
          title: "Kunde inte skicka SMS",
          description: "Kontrollera att telefonnumret är korrekt",
          variant: "destructive",
        });
      }
    }
  };

  return { sendSMS };
};