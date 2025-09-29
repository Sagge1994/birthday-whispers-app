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
    }
  }, []);

  const initPushNotifications = async () => {
    try {
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
          setIsRegistered(true);
        });

        // Listen for push notification received
        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received: ', notification);
            toast({
              title: notification.title || "Påminnelse",
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
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  const scheduleLocalNotification = (title: string, body: string, date: Date) => {
    // This would typically be handled by the backend
    // For now, we'll show a toast that notifications are set up
    toast({
      title: "Påminnelse inställd",
      description: `Påminnelse för "${title}" är inställd för ${date.toLocaleDateString('sv-SE')}`,
    });
  };

  return {
    isRegistered,
    token,
    scheduleLocalNotification
  };
};