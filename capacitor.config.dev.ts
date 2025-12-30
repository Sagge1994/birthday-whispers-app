import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ec3546893af547c58b51d8494bbf5834',
  appName: 'birthday-whispers-app',
  webDir: 'dist',
  server: {
    url: 'https://ec354689-3af5-47c5-8b51-d8494bbf5834.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Contacts: {
      permissions: ['contacts'],
    },
  },
};

export default config;