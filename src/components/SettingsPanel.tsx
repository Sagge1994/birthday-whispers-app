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
import { NotificationManager } from "@/components/NotificationManager";
import { Contact } from "@/pages/Index";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
}

export const SettingsPanel = ({ open, onOpenChange, contacts }: SettingsPanelProps) => {
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
          <NotificationManager contacts={contacts} />

          {/* Save Button */}
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-primary hover:shadow-soft"
          >
            Stäng inställningar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};