import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WeeklyReminderSettings {
  id?: string;
  enabled: boolean;
  dayOfWeek: number;
  timeOfDay: string;
}

export const WeeklyReminderSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<WeeklyReminderSettings>({
    enabled: true,
    dayOfWeek: 0, // Sunday
    timeOfDay: "18:00"
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>('');

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
    // Upptäck användarens tidszon
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
    
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weekly_reminders')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // Not found is okay
        throw error;
      }

      if (data) {
        setSettings({
          id: data.id,
          enabled: data.enabled,
          dayOfWeek: data.day_of_week,
          timeOfDay: data.time_of_day.slice(0, 5) // Remove seconds
        });
      }
    } catch (error) {
      console.error('Error loading weekly reminder settings:', error);
      toast({
        title: "Kunde inte ladda inställningar",
        description: "Försök igen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      const reminderData = {
        user_id: user.id,
        enabled: settings.enabled,
        day_of_week: settings.dayOfWeek,
        time_of_day: `${settings.timeOfDay}:00`,
        timezone: userTimezone
      };

      let result;
      if (settings.id) {
        // Update existing
        result = await supabase
          .from('weekly_reminders')
          .update(reminderData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new
        result = await supabase
          .from('weekly_reminders')
          .insert([reminderData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSettings(prev => ({ ...prev, id: result.data.id }));

      toast({
        title: "Inställningar sparade!",
        description: settings.enabled ? 
          `Du kommer få påminnelser på ${daysOfWeek.find(d => d.value === settings.dayOfWeek)?.label} kl ${settings.timeOfDay}` :
          "Vecko-påminnelser är avstängda"
      });

    } catch (error) {
      console.error('Error saving weekly reminder settings:', error);
      toast({
        title: "Kunde inte spara inställningar",
        description: "Försök igen",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testWeeklyReminder = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('weekly-reminder');
      
      if (error) throw error;

      toast({
        title: "Test kördes!",
        description: `Hittade ${data.processed} användare med vecko-påminnelser`,
      });
    } catch (error) {
      console.error('Error testing weekly reminder:', error);
      toast({
        title: "Test misslyckades",
        description: "Kontrollera att funktionen är konfigurerad korrekt",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardContent className="p-6 text-center">
          <div>Laddar inställningar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Vecko-påminnelser
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Få en sammanfattning av kommande veckas födelsedagar varje vecka
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled" className="text-base">
            Aktivera vecko-påminnelser
          </Label>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => 
              setSettings(prev => ({ ...prev, enabled }))
            }
          />
        </div>

        {settings.enabled && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Vilken dag i veckan?
              </Label>
              <Select
                value={settings.dayOfWeek.toString()}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, dayOfWeek: parseInt(value) }))
                }
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Vilken tid?
              </Label>
              <Input
                id="time"
                type="time"
                value={settings.timeOfDay}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, timeOfDay: e.target.value }))
                }
                className="bg-background/50"
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 mb-1">Tidszon</p>
                  <ul className="text-green-700 space-y-1">
                    <li>• Din tidszon: {userTimezone}</li>
                    <li>• Påminnelser skickas i din lokala tid</li>
                    <li>• Nuvarande tid: {new Date().toLocaleTimeString('sv-SE')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Vad händer?</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Du får en sammanfattning av kommande veckas födelsedagar</li>
                    <li>• Möjlighet att förbereda SMS-meddelanden i förväg</li>
                    <li>• Perfekt för att planera inför veckan</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={saveSettings}
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Sparar..." : "Spara inställningar"}
          </Button>
          
          {settings.enabled && (
            <Button 
              onClick={testWeeklyReminder}
              variant="outline"
              size="sm"
            >
              Testa nu
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};