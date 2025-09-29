import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Bell, MessageSquare, Download } from "lucide-react";
import { Capacitor } from "@capacitor/core";

export const MobileAppInfo = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  if (isNative) {
    return (
      <Card className="bg-gradient-primary border-0 shadow-lg text-white mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6" />
            <div>
              <p className="font-semibold">📱 Mobilapp aktiverad!</p>
              <p className="text-sm text-white/80">
                Du kan nu skicka SMS direkt från appen och få push-notifikationer
              </p>
            </div>
            <Badge className="bg-white/20 text-white border-0">
              {platform === 'ios' ? 'iOS' : 'Android'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-0 shadow-card mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Gör din app till en mobilapp
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          För att få SMS-integration och push-notifikationer:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Skicka SMS direkt från appen</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span>Få automatiska påminnelser</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>Fungerar offline</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Exportera projektet till GitHub och följ Capacitor-instruktionerna för att köra som mobilapp.
        </p>
      </CardContent>
    </Card>
  );
};