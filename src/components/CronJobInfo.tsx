import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Code, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CronJobInfo = () => {
  const { toast } = useToast();
  
  const cronExpression = "0 18 * * 0"; // Every Sunday at 6 PM
  const sqlCommand = `select
  cron.schedule(
    'weekly-birthday-reminders',
    '${cronExpression}',
    $$
    select
      net.http_post(
          url:='https://egkwlfmgaquwanrxywah.supabase.co/functions/v1/weekly-reminder',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVna3dsZm1nYXF1d2Fucnh5d2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDUyMTMsImV4cCI6MjA3NDY4MTIxM30.VP6zeYZG8wmwPTubgExU0Y7ysfKiUwXkxL8hQVsKTJ4"}'::jsonb,
          body:=concat('{"time": "', now(), '"}')::jsonb
      ) as request_id;
    $$
  );`;

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopierat!",
      description: `${description} har kopierats till urklipp`,
    });
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Automatiska vecko-påminnelser
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sätt upp automatiska påminnelser som körs varje söndag
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Hur det fungerar:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Varje söndag kl 18:00 körs ett automatiskt jobb</li>
            <li>• Jobbet kollar vilka användare som har vecko-påminnelser aktiverade</li>
            <li>• De får en sammanfattning av kommande veckas födelsedagar</li>
            <li>• Perfekt för att planera inför veckan</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Cron Expression:</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                {cronExpression}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(cronExpression, "Cron expression")}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Varje söndag kl 18:00
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">SQL-kommando för Supabase:</Label>
            <div className="bg-muted p-3 rounded-lg mt-1">
              <code className="text-xs whitespace-pre-wrap">
                {sqlCommand}
              </code>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => copyToClipboard(sqlCommand, "SQL-kommandot")}
              >
                <Copy className="w-3 h-3 mr-2" />
                Kopiera SQL-kommando
              </Button>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>Notera:</strong> För att aktivera automatiska påminnelser behöver du:
            </p>
            <ol className="text-xs text-orange-700 mt-2 space-y-1 ml-4 list-decimal">
              <li>Aktivera pg_cron och pg_net extensions i Supabase</li>
              <li>Kör SQL-kommandot ovan i Supabase SQL Editor</li>
              <li>Användare ställer in sina vecko-påminnelser här i appen</li>
            </ol>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://supabase.com/dashboard/project/egkwlfmgaquwanrxywah/sql/new', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Öppna Supabase SQL Editor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};