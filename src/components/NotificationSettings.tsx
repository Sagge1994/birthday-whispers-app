import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Contact } from "@/hooks/useContacts";

interface NotificationSettingsProps {
  contacts: Contact[];
}

interface Settings {
  // Push notifications
  notificationsEnabled: boolean;
  
  // Birthday day notifications
  birthdayDayEnabled: boolean;
  birthdayDayTime: string;
  
  // Day before notifications
  dayBeforeEnabled: boolean;
  dayBeforeTime: string;
  
  // Weekly reminders
  weeklyEnabled: boolean;
  weeklyDay: number;
  weeklyTime: string;
}

export const NotificationSettings = ({ contacts }: NotificationSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<Settings>({
    notificationsEnabled: false,
    birthdayDayEnabled: true,
    birthdayDayTime: "09:00",
    dayBeforeEnabled: true,
    dayBeforeTime: "18:00",
    weeklyEnabled: true,
    weeklyDay: 0,
    weeklyTime: "18:00"
  });

  const [permissionStatus, setPermissionStatus] = useState<"default" | "granted" | "denied">("default");
  const [loading, setLoading] = useState(true);

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
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    // Load saved settings
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...savedSettings }));
      } catch (error) {
        console.error('Could not load notification settings:', error);
      }
    }

    // Load weekly reminder settings from database if user is logged in
    if (user) {
      await loadWeeklySettings();
    }

    setLoading(false);
  };

  const loadWeeklySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_reminders')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        setSettings(prev => ({
          ...prev,
          weeklyEnabled: data.enabled,
          weeklyDay: data.day_of_week,
          weeklyTime: data.time_of_day.slice(0, 5)
        }));
      }
    } catch (error) {
      console.error('Error loading weekly settings:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifikationer stöds inte",
        description: "Din webbläsare stöder inte notifikationer",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, notificationsEnabled: true }));
        toast({
          title: "Notifikationer aktiverade!",
          description: "Du kommer nu få påminnelser enligt dina inställningar",
        });
      } else {
        toast({
          title: "Notifikationer nekade",
          description: "Du kan aktivera dem i webbläsarinställningar senare",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    
    // Save weekly settings to database if user is logged in
    if (user && (key === 'weeklyEnabled' || key === 'weeklyDay' || key === 'weeklyTime')) {
      saveWeeklySettings(newSettings);
    }
  };

  const saveWeeklySettings = async (newSettings: Settings) => {
    if (!user) return;

    try {
      const reminderData = {
        user_id: user.id,
        enabled: newSettings.weeklyEnabled,
        day_of_week: newSettings.weeklyDay,
        time_of_day: `${newSettings.weeklyTime}:00`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const { error } = await supabase
        .from('weekly_reminders')
        .upsert([reminderData], { 
          onConflict: 'user_id'
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error saving weekly settings:', error);
    }
  };

  const testNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification('🎂 Födelsedagspåminnelse', {
        body: 'Test-notifikation! Så här ser dina påminnelser ut.',
        icon: '/favicon.ico',
      });
      toast({
        title: "Test-notifikation skickad!",
        description: "Kontrollera att du såg notifikationen",
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardContent className="p-6 text-center">
          <div>Laddar notifikationsinställningar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifikationer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Välj när du vill få påminnelser om födelsedagar
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Permission Status */}
        {permissionStatus !== 'granted' ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Notifikationer behöver aktiveras
              </span>
            </div>
            <p className="text-xs text-orange-700 mb-3">
              För att få påminnelser behöver du aktivera notifikationer.
            </p>
            <Button 
              size="sm" 
              onClick={requestNotificationPermission} 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
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
          </div>
        )}

        {/* Birthday Day Notifications */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">På födelsedagen</Label>
            <Switch
              checked={settings.birthdayDayEnabled}
              onCheckedChange={(checked) => updateSetting('birthdayDayEnabled', checked)}
            />
          </div>
          {settings.birthdayDayEnabled && (
            <div className="ml-2">
              <Label className="text-sm">Tid</Label>
              <Input
                type="time"
                value={settings.birthdayDayTime}
                onChange={(e) => updateSetting('birthdayDayTime', e.target.value)}
                className="w-32 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Påminnelse på morgonen när någon fyller år
              </p>
            </div>
          )}
        </div>

        {/* Day Before Notifications */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Dagen innan</Label>
            <Switch
              checked={settings.dayBeforeEnabled}
              onCheckedChange={(checked) => updateSetting('dayBeforeEnabled', checked)}
            />
          </div>
          {settings.dayBeforeEnabled && (
            <div className="ml-2">
              <Label className="text-sm">Tid</Label>
              <Input
                type="time"
                value={settings.dayBeforeTime}
                onChange={(e) => updateSetting('dayBeforeTime', e.target.value)}
                className="w-32 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Påminnelse dagen före så du kan förbereda
              </p>
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Vecko-sammanfattning</Label>
            <Switch
              checked={settings.weeklyEnabled}
              onCheckedChange={(checked) => updateSetting('weeklyEnabled', checked)}
            />
          </div>
          {settings.weeklyEnabled && (
            <div className="ml-2 space-y-3">
              <div>
                <Label className="text-sm">Dag</Label>
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
                <Label className="text-sm">Tid</Label>
                <Input
                  type="time"
                  value={settings.weeklyTime}
                  onChange={(e) => updateSetting('weeklyTime', e.target.value)}
                  className="w-32 mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sammanfattning av kommande veckas födelsedagar
              </p>
            </div>
          )}
        </div>

        {/* Test Button */}
        {permissionStatus === 'granted' && (
          <Button 
            variant="outline" 
            onClick={testNotification} 
            className="w-full"
          >
            Testa notifikation
          </Button>
        )}

      </CardContent>
    </Card>
  );
};