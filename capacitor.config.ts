import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ec3546893af547c58b51d8494bbf5834',
  appName: 'Födelsedagar',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Contacts: {
      permissions: ['contacts']
    }
  }
};

export default config;