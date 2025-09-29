import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface QuickAddBirthdayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onAddContact: (contact: Omit<Contact, "id">) => void;
}

export const QuickAddBirthdayDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate,
  onAddContact 
}: QuickAddBirthdayDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    customMessage: ""
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const generateAISuggestions = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Ange ett namn först",
        description: "AI behöver ett namn för att skapa personliga förslag",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API-nyckel saknas",
        description: "Ange din Perplexity API-nyckel för AI-förslag",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Du är en hjälpsam assistent som skapar personliga och vänliga födelsedagsmeddelanden på svenska. Skapa 3 olika meddelanden som är varma, personliga och passar för SMS. Varje meddelande ska vara 1-2 meningar långt och inkludera lämpliga emojis.'
            },
            {
              role: 'user',
              content: `Skapa 3 personliga födelsedagsmeddelanden för ${formData.name}. Meddelandena ska vara på svenska, vänliga och lämpliga för SMS. Inkludera passande emojis.`
            }
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 300,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      // Extract individual messages from the response
      const messages = content.split('\n')
        .filter((line: string) => line.trim() && !line.includes(':') && line.length > 20)
        .slice(0, 3);

      if (messages.length > 0) {
        setAiSuggestions(messages);
        toast({
          title: "AI-förslag genererade!",
          description: `${messages.length} personliga meddelanden skapade`,
        });
      } else {
        throw new Error("Inga meddelanden kunde genereras");
      }

    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Kunde inte generera AI-förslag",
        description: "Kontrollera din API-nyckel och försök igen",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const selectAISuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, customMessage: suggestion }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !selectedDate) {
      toast({
        title: "Fyll i alla fält",
        description: "Namn och telefonnummer krävs",
        variant: "destructive"
      });
      return;
    }

    onAddContact({
      name: formData.name,
      birthday: selectedDate.toISOString().split('T')[0],
      phone: formData.phone,
      customMessage: formData.customMessage || undefined
    });

    toast({
      title: "Födelsedag tillagd!",
      description: `${formData.name} har lagts till för ${format(selectedDate, 'd MMMM', { locale: sv })}`,
    });

    // Reset form
    setFormData({
      name: "",
      phone: "",
      customMessage: ""
    });
    setAiSuggestions([]);
    
    onOpenChange(false);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        phone: "",
        customMessage: ""
      });
      setAiSuggestions([]);
    }
  }, [open]);

  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[700px] overflow-y-auto bg-gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Lägg till födelsedag
          </DialogTitle>
          <DialogDescription>
            Lägg till en födelsedag för {format(selectedDate, 'd MMMM yyyy', { locale: sv })}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ange namn"
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+46701234567"
                className="bg-background/50"
              />
            </div>
          </div>

          {/* AI API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">Perplexity API-nyckel (för AI-förslag)</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ange din Perplexity API-nyckel"
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Behövs endast för AI-genererade meddelandeförslag
            </p>
          </div>

          {/* AI Message Generator */}
          <Card className="bg-pastel-lavender/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-genererade meddelandeförslag
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={generateAISuggestions}
                disabled={isGeneratingAI || !formData.name.trim()}
                className="w-full bg-gradient-primary hover:shadow-soft"
                size="sm"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Genererar förslag...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Skapa AI-förslag för {formData.name || 'personen'}
                  </>
                )}
              </Button>

              {aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Klicka för att använda:</p>
                  {aiSuggestions.map((suggestion, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:bg-pastel-peach/30 transition-colors border-primary/10"
                      onClick={() => selectAISuggestion(suggestion)}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm">{suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Label htmlFor="customMessage">Meddelande (valfritt)</Label>
            <Textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => setFormData({...formData, customMessage: e.target.value})}
              placeholder="Skriv ett personligt födelsedagsmeddelande eller använd AI-förslag ovan..."
              className="bg-background/50 min-h-[80px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-primary/20"
            >
              Avbryt
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:shadow-soft">
              Lägg till födelsedag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};