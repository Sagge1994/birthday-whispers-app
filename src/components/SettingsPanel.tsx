import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsPanel = ({ open, onOpenChange }: SettingsPanelProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    notificationTime: "09:00",
    daysBefore: 1,
    weeklyReminder: false,
    soundEnabled: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Inställning uppdaterad",
      description: "Dina ändringar har sparats",
    });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Notiser aktiverade!",
          description: "Du kommer nu få påminnelser om födelsedagar",
        });
      } else {
        toast({
          title: "Notiser nekade",
          description: "Aktivera notiser i webbläsarens inställningar",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Inställningar
          </DialogTitle>
          <DialogDescription>
            Anpassa dina notiser och påminnelser
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="bg-background/50 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notiser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Aktivera notiser
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Få påminnelser om kommande födelsedagar
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              {settings.notifications && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notificationTime" className="text-sm font-medium">
                      Tid för påminnelse
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <input
                        id="notificationTime"
                        type="time"
                        value={settings.notificationTime}
                        onChange={(e) => updateSetting('notificationTime', e.target.value)}
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Mobile App Info */}
          <Card className="bg-pastel-blue/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobilapp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                För bästa upplevelse och fullständiga notiser, ladda ner appen till din telefon.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-primary/20 text-xs"
                  onClick={requestNotificationPermission}
                >
                  Aktivera webnotiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-primary hover:shadow-soft"
          >
            Spara inställningar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};