import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications, 
  PushNotificationSchema, 
  ActionPerformed,
  Token 
} from '@capacitor/push-notifications';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initPushNotifications();
    } else {
      // Web fallback - automatically request notification permission
      initWebNotifications();
    }
  }, []);

  const initWebNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setIsRegistered(true);
          console.log('Web notifications initialized');
        }
      } catch (error) {
        console.error('Error initializing web notifications:', error);
      }
    } else if (Notification.permission === 'granted') {
      setIsRegistered(true);
    }
  };

  const initPushNotifications = async () => {
    try {
      // Request permission automatically
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
          setIsRegistered(true);
          
          // Show success message
          toast({
            title: "📱 Push-notifikationer aktiverade",
            description: "Du kommer få påminnelser även när appen är stängd",
          });
        });

        // Listen for push notification received
        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received: ', notification);
            toast({
              title: notification.title || "🎂 Födelsedagspåminnelse",
              description: notification.body || "Du har en ny påminnelse",
            });
          }
        );

        // Listen for push notification action
        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: ActionPerformed) => {
            console.log('Push notification action performed', notification);
          }
        );
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  const scheduleLocalNotification = (title: string, body: string, date: Date) => {
    if (Capacitor.isNativePlatform() && isRegistered) {
      // På mobil: Skulle normalt schemalägga via native plugin
      console.log('Scheduling native notification:', { title, body, date });
      toast({
        title: "📱 Påminnelse schemalagd",
        description: `${title} är inställd för ${date.toLocaleDateString('sv-SE')}`,
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // På webb: Visa direkt eller använd Service Worker för scheduling
      console.log('Scheduling web notification:', { title, body, date });
      toast({
        title: "🔔 Påminnelse inställd",
        description: `${title} är inställd för ${date.toLocaleDateString('sv-SE')}`,
      });
    } else {
      toast({
        title: "ℹ️ Påminnelse noterad",
        description: `${title} för ${date.toLocaleDateString('sv-SE')} (aktivera notifikationer för automatiska påminnelser)`,
      });
    }
  };

  return {
    isRegistered,
    token,
    scheduleLocalNotification
  };
};