import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/hooks/useContacts";
import { format, addDays, isSameDay } from "date-fns";
import { sv } from "date-fns/locale";

interface NotificationManagerProps {
  contacts: Contact[];
}

export const NotificationManager = ({ contacts }: NotificationManagerProps) => {
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    enabled: false,
    time: "09:00",
    daysBefore: 1,
    weeklyReminder: false,
    soundEnabled: true
  });

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('birthdayNotificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notiser stöds inte",
        description: "Din webbläsare stöder inte notiser",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notiser aktiverade! 🎉",
          description: "Du kommer nu få påminnelser om födelsedagar",
        });
        
        // Enable notifications in settings
        updateSetting('enabled', true);
        
        // Schedule notifications
        scheduleNotifications();
      } else {
        toast({
          title: "Notiser nekade",
          description: "Aktivera notiser i webbläsarens inställningar för att få påminnelser",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Fel vid aktivering",
        description: "Något gick fel när notiser skulle aktiveras",
        variant: "destructive"
      });
    }
  };

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('birthdayNotificationSettings', JSON.stringify(newSettings));
    
    if (key === 'enabled' && value && notificationPermission === 'granted') {
      scheduleNotifications();
    }
    
    toast({
      title: "Inställning uppdaterad",
      description: "Dina notiserinställningar har sparats",
    });
  };

  const scheduleNotifications = () => {
    if (!settings.enabled || notificationPermission !== 'granted') return;

    // Clear existing scheduled notifications
    // Note: In a real app, you'd want to use a service worker for persistent notifications
    
    contacts.forEach(contact => {
      const birthday = new Date(contact.birthday);
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Set birthday to current year
      birthday.setFullYear(currentYear);
      
      // If birthday has passed this year, set to next year
      if (birthday < today) {
        birthday.setFullYear(currentYear + 1);
      }
      
      // Calculate notification date
      const notificationDate = addDays(birthday, -settings.daysBefore);
      const [hours, minutes] = settings.time.split(':').map(Number);
      notificationDate.setHours(hours, minutes, 0, 0);
      
      // Schedule notification if it's in the future
      if (notificationDate > today) {
        const timeUntilNotification = notificationDate.getTime() - today.getTime();
        
        setTimeout(() => {
          if (settings.enabled) {
            showBirthdayNotification(contact, birthday);
          }
        }, timeUntilNotification);
      }
    });
  };

  const showBirthdayNotification = (contact: Contact, birthdayDate: Date) => {
    const isToday = isSameDay(birthdayDate, new Date());
    const title = isToday 
      ? `🎉 ${contact.name} fyller år idag!`
      : `🎂 ${contact.name} fyller år ${settings.daysBefore === 1 ? 'imorgon' : `om ${settings.daysBefore} dagar`}`;
    
    const notification = new Notification(title, {
      body: `Kom ihåg att gratulera ${contact.name}!`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `birthday-${contact.id}`,
      requireInteraction: true
    });

    notification.onclick = () => {
      // Open SMS app
      const defaultMessage = `Grattis på födelsedagen! 🎉 Hoppas du får en fantastisk dag! 🎂`;
      const message = contact.customMessage || defaultMessage;
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl);
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  };

  const testNotification = () => {
    if (notificationPermission !== 'granted') {
      toast({
        title: "Aktivera notiser först",
        description: "Du måste ge behörighet för notiser",
        variant: "destructive"
      });
      return;
    }

    const notification = new Notification('🎂 Test-notis!', {
      body: 'Så här ser dina födelsedagspåminnelser ut!',
      icon: '/favicon.ico',
      tag: 'test-notification'
    });

    notification.onclick = () => {
      toast({
        title: "Notis fungerar! 🎉",
        description: "Du kommer få sådana här påminnelser",
      });
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const upcoming = contacts.filter(contact => {
      const birthday = new Date(contact.birthday);
      const currentYear = today.getFullYear();
      birthday.setFullYear(currentYear);
      
      if (birthday < today) {
        birthday.setFullYear(currentYear + 1);
      }
      
      const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30; // Next 30 days
    });
    
    return upcoming.slice(0, 5); // Show max 5
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notiserinställningar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
            <div className="flex items-center space-x-3">
              {notificationPermission === 'granted' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">
                  {notificationPermission === 'granted' ? 'Notiser aktiverade' : 'Notiser inte aktiverade'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notificationPermission === 'granted' 
                    ? 'Du kommer få påminnelser om födelsedagar'
                    : 'Aktivera för att få påminnelser'
                  }
                </p>
              </div>
            </div>
            
            {notificationPermission !== 'granted' && (
              <Button 
                onClick={requestNotificationPermission}
                className="bg-gradient-primary hover:shadow-soft"
                size="sm"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Aktivera
              </Button>
            )}
          </div>

          {notificationPermission === 'granted' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Födelsedagspåminnelser
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Få notiser om kommande födelsedagar
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSetting('enabled', checked)}
                />
              </div>

              {settings.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="notificationTime" className="text-sm font-medium">
                        Tid för påminnelse
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <input
                          id="notificationTime"
                          type="time"
                          value={settings.time}
                          onChange={(e) => updateSetting('time', e.target.value)}
                          className="px-3 py-2 bg-background border border-primary/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="daysBefore" className="text-sm font-medium">
                        Påminn mig
                      </Label>
                      <select
                        id="daysBefore"
                        value={settings.daysBefore}
                        onChange={(e) => updateSetting('daysBefore', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-background border border-primary/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value={0}>På födelsedagen</option>
                        <option value={1}>1 dag före</option>
                        <option value={2}>2 dagar före</option>
                        <option value={3}>3 dagar före</option>
                        <option value={7}>1 vecka före</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReminder" className="text-sm font-medium">
                        Veckopåminnelse
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Få en översikt varje söndag
                      </p>
                    </div>
                    <Switch
                      id="weeklyReminder"
                      checked={settings.weeklyReminder}
                      onCheckedChange={(checked) => updateSetting('weeklyReminder', checked)}
                    />
                  </div>

                  <Button 
                    onClick={testNotification}
                    variant="outline"
                    className="w-full border-primary/20"
                    size="sm"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Testa notis
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <Card className="bg-pastel-mint/20 border-primary/10">
          <CardHeader>
            <CardTitle className="text-sm">Kommande notiser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBirthdays.map((contact) => {
                const birthday = new Date(contact.birthday);
                const today = new Date();
                const currentYear = today.getFullYear();
                birthday.setFullYear(currentYear);
                
                if (birthday < today) {
                  birthday.setFullYear(currentYear + 1);
                }
                
                const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const notificationDate = addDays(birthday, -settings.daysBefore);
                
                return (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(birthday, 'd MMM', { locale: sv })} • om {daysUntil} dagar
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/20">
                      Notis {format(notificationDate, 'd/M kl. HH:mm', { locale: sv })}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};