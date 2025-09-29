import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MessageTemplateManager = ({ open, onOpenChange }: MessageTemplateManagerProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([
    {
      id: "1",
      name: "Standard",
      message: "Grattis på födelsedagen! 🎉 Hoppas du får en fantastisk dag! 🎂"
    },
    {
      id: "2", 
      name: "Personlig",
      message: "Grattis på födelsedagen! 🎈 Hoppas du får en underbar dag fylld med kärlek och skratt! 💕"
    },
    {
      id: "3",
      name: "Rolig",
      message: "🎂 En till runda runt solen! Grattis och fira ordentligt! 🎉✨"
    }
  ]);
  
  const [newTemplate, setNewTemplate] = useState({ name: "", message: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast({
        title: "Fyll i alla fält",
        description: "Både namn och meddelande krävs",
        variant: "destructive"
      });
      return;
    }

    const template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      message: newTemplate.message
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: "", message: "" });
    
    toast({
      title: "Mall tillagd!",
      description: `Mallen "${template.name}" har skapats`,
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: "Mall raderad",
      description: "Mallen har tagits bort",
    });
  };

  const previewMessage = (message: string) => {
    // Simple preview in SMS format
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[600px] overflow-y-auto bg-gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-xl">Meddelandemallar</DialogTitle>
          <DialogDescription>
            Skapa och hantera dina födelsedagsmeddelanden
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Existing Templates */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dina mallar</h3>
            {templates.map((template) => (
              <Card key={template.id} className="bg-background/50 border-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => previewMessage(template.message)}
                        className="h-8 px-2"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{template.message}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => previewMessage(template.message)}
                    className="mt-3 text-xs border-primary/20"
                  >
                    Förhandsgranska
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Template */}
          <Card className="bg-pastel-mint/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Skapa ny mall
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Mallnamn</Label>
                <input
                  id="templateName"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="T.ex. Familj, Vänner, Kollegor..."
                  className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="templateMessage">Meddelande</Label>
                <Textarea
                  id="templateMessage"
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({...newTemplate, message: e.target.value})}
                  placeholder="Skriv ditt födelsedagsmeddelande här..."
                  className="bg-background/50 min-h-[80px] border-primary/20"
                />
              </div>
              
              <Button 
                onClick={addTemplate}
                className="w-full bg-gradient-primary hover:shadow-soft"
                size="sm"
              >
                Skapa mall
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
