import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Bell, MessageSquare, Download, CheckCircle } from "lucide-react";
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

  // Check if browser supports notifications
  const supportsNotifications = 'Notification' in window;
  const supportsSMS = 'navigator' in window && 'share' in navigator;

  return (
    <Card className="bg-gradient-card border-0 shadow-card mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          Mobilfunktioner aktiverade
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>SMS-integration aktiverad</span>
          </div>
          {supportsNotifications && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Push-notifikationer tillgängliga</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Kalender och påminnelser</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>Allt fungerar automatiskt!</strong> SMS öppnas i din telefons meddelandeapp och påminnelser visas som webbnotifikationer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};