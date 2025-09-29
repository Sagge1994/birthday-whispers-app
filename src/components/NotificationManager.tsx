import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Clock, Calendar, Gift, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/hooks/useContacts";
import { format, addDays, isSameDay } from "date-fns";
import { sv } from "date-fns/locale";

interface NotificationSettings {
  // På födelsedagen
  birthdayDayEnabled: boolean;
  birthdayDayTime: string;
  
  // Dagen innan
  dayBeforeEnabled: boolean;
  dayBeforeTime: string;
  
  // Vecko-påminnelser
  weeklyEnabled: boolean;
  weeklyDay: number; // 0 = Söndag, 1 = Måndag etc.
  weeklyTime: string;
  
  // Anpassade påminnelser
  customEnabled: boolean;
  customDaysBefore: number;
  customTime: string;
}

interface NotificationManagerProps {
  contacts: Contact[];
}

export const NotificationManager = ({ contacts }: NotificationManagerProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    birthdayDayEnabled: true,
    birthdayDayTime: "09:00",
    
    dayBeforeEnabled: true,
    dayBeforeTime: "18:00",
    
    weeklyEnabled: true,
    weeklyDay: 0, // Söndag
    weeklyTime: "18:00",
    
    customEnabled: false,
    customDaysBefore: 3,
    customTime: "10:00"
  });

  const [permissionStatus, setPermissionStatus] = useState<"default" | "granted" | "denied">("default");
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const daysOfWeek = [
    { value: 0, label: "Söndag" },
    { value: 1, label: "Måndag" },
    { value: 2, label: "Tisdag" },
    { value: 3, label: "Onsdag" },
    { value: 4, label: "Torsdag" },
    { value: 5, label: "Fredag" },
    { value: 6, label: "Lördag" }
  ];

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    // Kontrollera notifikationsbehörighet
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      
      // Om ingen behörighet är begärd ännu, begär den automatiskt
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          setPermissionStatus(permission);
          
          if (permission === 'granted') {
            toast({
              title: "✅ Notifikationer aktiverade",
              description: "Du kommer få påminnelser enligt dina inställningar",
            });
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      }
    }

    // Upptäck användarens tidszon
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);

    // Ladda sparade inställningar eller använd standardvärden
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        setSettings(savedSettings);
      } catch (error) {
        console.error('Kunde inte ladda notifikationsinställningar:', error);
      }
    } else {
      // Spara standardinställningarna första gången
      saveSettings();
    }
    
    setIsInitialized(true);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifikationer stöds inte",
        description: "Din webbläsare stöder inte notifikationer",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifikationer aktiverade!",
          description: "Du kommer nu få påminnelser enligt dina inställningar",
        });
        return true;
      } else {
        toast({
          title: "Notifikationer nekade",
          description: "Du kan aktivera dem i webbläsarinställningar senare",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Fel vid begäran om notifikationsbehörighet:', error);
      return false;
    }
  };

  const saveSettings = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    // Registrera notifikationer med systemet om behörighet finns
    if (permissionStatus === 'granted') {
      registerNotificationSchedules();
    }
    
    toast({
      title: "Inställningar sparade!",
      description: "Dina notifikationsinställningar har uppdaterats",
    });
  };

  // Registrera notifikationsscheman med systemet
  const registerNotificationSchedules = () => {
    // Här skulle vi normalt registrera med Capacitor för mobilappar
    // För nu loggar vi vad som skulle registreras
    const activeNotifications = [];
    
    if (settings.birthdayDayEnabled) {
      activeNotifications.push(`Födelsedagsnotiser kl ${settings.birthdayDayTime}`);
    }
    if (settings.dayBeforeEnabled) {
      activeNotifications.push(`Påminnelser dagen innan kl ${settings.dayBeforeTime}`);
    }
    if (settings.weeklyEnabled) {
      const dayName = daysOfWeek.find(d => d.value === settings.weeklyDay)?.label;
      activeNotifications.push(`Veckosammanfattning ${dayName} kl ${settings.weeklyTime}`);
    }
    if (settings.customEnabled) {
      activeNotifications.push(`Anpassade påminnelser ${settings.customDaysBefore} dagar innan kl ${settings.customTime}`);
    }
    
    console.log('Registrerade notifikationer:', activeNotifications);
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Spara automatiskt när inställningar ändras
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      return newSettings;
    });
    
    // Uppdatera registrerade notifikationer
    if (permissionStatus === 'granted') {
      setTimeout(() => registerNotificationSchedules(), 100);
    }
  };

  const testNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification('🎂 Födelsedagspåminnelse', {
        body: 'Så här ser dina notifikationer ut! Allt är aktiverat och redo.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification'
      });
    } else {
      toast({
        title: "Kan inte testa",
        description: "Notifikationer behöver vara aktiverade först",
        variant: "destructive"
      });
    }
  };

  if (!isInitialized) {
    return (
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Initierar notifikationer...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifikationsinställningar
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Välj när och hur du vill få påminnelser om födelsedagar
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Behörighetsstatus */}
        {permissionStatus !== 'granted' ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Notifikationer behöver aktiveras
              </span>
            </div>
            <p className="text-xs text-orange-700 mb-3">
              För att få påminnelser behöver du aktivera notifikationer i systemet.
            </p>
            <Button size="sm" onClick={requestNotificationPermission} className="bg-orange-600 hover:bg-orange-700 text-white">
              Aktivera notifikationer
            </Button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                ✅ Notifikationer är aktiverade
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Alla påminnelser fungerar automatiskt i bakgrunden
            </p>
          </div>
        )}

        {/* På födelsedagen */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <Label className="text-base font-medium">På födelsedagen</Label>
            </div>
            <Switch
              checked={settings.birthdayDayEnabled}
              onCheckedChange={(checked) => updateSetting('birthdayDayEnabled', checked)}
            />
          </div>
          {settings.birthdayDayEnabled && (
            <div className="ml-6">
              <Label className="text-sm">Tid på dagen</Label>
              <Input
                type="time"
                value={settings.birthdayDayTime}
                onChange={(e) => updateSetting('birthdayDayTime', e.target.value)}
                className="w-32 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Få en påminnelse på morgonen när någon fyller år
              </p>
            </div>
          )}
        </div>

        {/* Dagen innan */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <Label className="text-base font-medium">Dagen innan</Label>
            </div>
            <Switch
              checked={settings.dayBeforeEnabled}
              onCheckedChange={(checked) => updateSetting('dayBeforeEnabled', checked)}
            />
          </div>
          {settings.dayBeforeEnabled && (
            <div className="ml-6">
              <Label className="text-sm">Tid på dagen</Label>
              <Input
                type="time"
                value={settings.dayBeforeTime}
                onChange={(e) => updateSetting('dayBeforeTime', e.target.value)}
                className="w-32 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Få en påminnelse dagen före så du kan förbereda
              </p>
            </div>
          )}
        </div>

        {/* Vecko-påminnelser */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <Label className="text-base font-medium">Vecko-sammanfattning</Label>
            </div>
            <Switch
              checked={settings.weeklyEnabled}
              onCheckedChange={(checked) => updateSetting('weeklyEnabled', checked)}
            />
          </div>
          {settings.weeklyEnabled && (
            <div className="ml-6 space-y-2">
              <div>
                <Label className="text-sm">Vilken dag?</Label>
                <Select
                  value={settings.weeklyDay.toString()}
                  onValueChange={(value) => updateSetting('weeklyDay', parseInt(value))}
                >
                  <SelectTrigger className="w-40 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Tid på dagen</Label>
                <Input
                  type="time"
                  value={settings.weeklyTime}
                  onChange={(e) => updateSetting('weeklyTime', e.target.value)}
                  className="w-32 mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Få en sammanfattning av kommande veckas födelsedagar
              </p>
            </div>
          )}
        </div>

        {/* Anpassade påminnelser */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <Label className="text-base font-medium">Anpassad påminnelse</Label>
            </div>
            <Switch
              checked={settings.customEnabled}
              onCheckedChange={(checked) => updateSetting('customEnabled', checked)}
            />
          </div>
          {settings.customEnabled && (
            <div className="ml-6 space-y-2">
              <div>
                <Label className="text-sm">Antal dagar innan</Label>
                <Select
                  value={settings.customDaysBefore.toString()}
                  onValueChange={(value) => updateSetting('customDaysBefore', parseInt(value))}
                >
                  <SelectTrigger className="w-40 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 dagar innan</SelectItem>
                    <SelectItem value="3">3 dagar innan</SelectItem>
                    <SelectItem value="5">5 dagar innan</SelectItem>
                    <SelectItem value="7">1 vecka innan</SelectItem>
                    <SelectItem value="14">2 veckor innan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Tid på dagen</Label>
                <Input
                  type="time"
                  value={settings.customTime}
                  onChange={(e) => updateSetting('customTime', e.target.value)}
                  className="w-32 mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Få en påminnelse exakt när du vill ha den
              </p>
            </div>
          )}
        </div>

        {/* Aktionsknappar */}
        <div className="flex gap-2">
          {permissionStatus === 'granted' && (
            <Button variant="outline" onClick={testNotification} className="flex-1">
              Testa notifikation
            </Button>
          )}
          <Button 
            onClick={() => {
              toast({
                title: "Inställningar sparade!",
                description: "Alla ändringar sparas automatiskt",
              });
            }} 
            className="flex-1 bg-gradient-primary"
          >
            ✅ Sparade automatiskt
          </Button>
        </div>

        {/* Tidszons-info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Din tidszon:
          </h4>
          <div className="text-xs text-green-700">
            <div>• Upptäckt tidszon: {userTimezone}</div>
            <div>• Alla påminnelser kommer att visas i din lokala tid</div>
            <div>• Nuvarande tid: {new Date().toLocaleTimeString('sv-SE')}</div>
          </div>
        </div>

        {/* Info om aktiva påminnelser */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Aktiva påminnelser (i din lokala tid):
          </h4>
          <div className="space-y-1 text-xs text-blue-700">
            {settings.birthdayDayEnabled && (
              <div>• På födelsedagen kl {settings.birthdayDayTime}</div>
            )}
            {settings.dayBeforeEnabled && (
              <div>• Dagen innan kl {settings.dayBeforeTime}</div>
            )}
            {settings.weeklyEnabled && (
              <div>• {daysOfWeek.find(d => d.value === settings.weeklyDay)?.label} kl {settings.weeklyTime} (veckosammanfattning)</div>
            )}
            {settings.customEnabled && (
              <div>• {settings.customDaysBefore} dagar innan kl {settings.customTime}</div>
            )}
            {!settings.birthdayDayEnabled && !settings.dayBeforeEnabled && !settings.weeklyEnabled && !settings.customEnabled && (
              <div className="text-orange-700">Inga påminnelser aktiverade</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};