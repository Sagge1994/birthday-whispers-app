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
import { Contact } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Sparkles, Loader2, Users } from "lucide-react";
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
        title: "Enter a name first",
        description: "AI needs a name to create personalized suggestions",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API key missing",
        description: "Enter your Perplexity API key for AI suggestions",
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
              content: 'You are a helpful assistant that creates personal and friendly birthday messages in English. Create 3 different messages that are warm, personal and suitable for SMS. Each message should be 1-2 sentences long and include appropriate emojis.'
            },
            {
              role: 'user',
              content: `Create 3 personalized birthday messages for ${formData.name}. The messages should be in English, friendly and appropriate for SMS. Include suitable emojis.`
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
          title: "AI suggestions generated!",
          description: `${messages.length} personalized messages created`,
        });
      } else {
        throw new Error("No messages could be generated");
      }

    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Could not generate AI suggestions",
        description: "Check your API key and try again",
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
        title: "Fill in all fields",
        description: "Name and phone number are required",
        variant: "destructive"
      });
      return;
    }

    onAddContact({
      name: formData.name,
      birthday: selectedDate.toISOString().split('T')[0],
      phone: formData.phone,
      custom_message: formData.customMessage || undefined
    });

    toast({
      title: "Birthday added!",
      description: `${formData.name} has been added for ${format(selectedDate, 'MMMM d')}`,
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
            Add Birthday
          </DialogTitle>
          <DialogDescription>
            Add a birthday for {format(selectedDate, 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter name"
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1234567890"
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Add via Contact List Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/20 hover:bg-pastel-mint/50"
            onClick={() => {
              toast({
                title: "Contact picker",
                description: "This feature requires device permissions and works best in native mobile apps",
              });
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Add via Your Contact List
          </Button>

          {/* AI API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">Perplexity API Key (for AI suggestions)</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Perplexity API key"
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Only needed for AI-generated message suggestions
            </p>
          </div>

          {/* AI Message Generator */}
          <Card className="bg-pastel-lavender/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Message Suggestions
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
                    Generating suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create AI suggestions for {formData.name || 'person'}
                  </>
                )}
              </Button>

              {aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Click to use:</p>
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
            <Label htmlFor="customMessage">Message (optional)</Label>
            <Textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => setFormData({...formData, customMessage: e.target.value})}
              placeholder="Write a personal birthday message or use AI suggestions above..."
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
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:shadow-soft">
              Add Birthday
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};