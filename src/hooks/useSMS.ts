import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const useSMS = () => {
  const { toast } = useToast();

  const sendSMS = async (phoneNumber: string, message: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use native SMS on mobile devices
        const smsUrl = Capacitor.getPlatform() === 'ios' 
          ? `sms:${phoneNumber}&body=${encodeURIComponent(message)}`
          : `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        
        window.open(smsUrl, '_self');
      } else {
        // Fallback for web - copy message to clipboard
        await navigator.clipboard.writeText(`${phoneNumber}: ${message}`);
        toast({
          title: "SMS-text kopierat",
          description: "Meddelandet har kopierats till urklipp",
        });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Kunde inte skicka SMS",
        description: "Kontrollera att telefonnumret är korrekt",
        variant: "destructive",
      });
    }
  };

  return { sendSMS };
};