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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3, Trash2, Save, X, Sparkles, Loader2 } from "lucide-react";
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
      message: "Happy Birthday! 🎉 Hope you have a fantastic day! 🎂"
    },
    {
      id: "2", 
      name: "Personal",
      message: "Happy Birthday! 🎈 Hope you have a wonderful day filled with love and laughter! 💕"
    },
    {
      id: "3",
      name: "Fun",
      message: "🎂 Another trip around the sun! Happy Birthday and celebrate properly! 🎉✨"
    }
  ]);
  
  const [newTemplate, setNewTemplate] = useState({ name: "", message: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState({ name: "", message: "" });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiApiKey, setAiApiKey] = useState("");
  const [selectedPersonName, setSelectedPersonName] = useState("");

  const generateAIMessage = async () => {
    if (!selectedPersonName.trim()) {
      toast({
        title: "Enter a name first",
        description: "AI needs a name to create personalized suggestions",
        variant: "destructive"
      });
      return;
    }

    if (!aiApiKey.trim()) {
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
          'Authorization': `Bearer ${aiApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates personal and friendly birthday messages in English. Create 1 message that is warm, personal and suitable for SMS. The message should be 1-2 sentences long and include appropriate emojis.'
            },
            {
              role: 'user',
              content: `Create a personalized birthday message for ${selectedPersonName}. The message should be in English, friendly and appropriate for SMS. Include suitable emojis.`
            }
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 150,
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
      
      if (content.trim()) {
        setNewTemplate(prev => ({
          ...prev,
          message: content.trim(),
          name: prev.name || `AI Message for ${selectedPersonName}`
        }));
        
        toast({
          title: "AI message generated!",
          description: "Personalized message created successfully",
        });
      } else {
        throw new Error("No message could be generated");
      }

    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Could not generate AI message",
        description: "Check your API key and try again",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const startEditing = (template: any) => {
    setEditingId(template.id);
    setEditingTemplate({ name: template.name, message: template.message });
  };

  const saveEdit = () => {
    if (!editingTemplate.name || !editingTemplate.message) {
      toast({
        title: "Fill in all fields",
        description: "Both name and message are required",
        variant: "destructive"
      });
      return;
    }

    setTemplates(templates.map(t => 
      t.id === editingId 
        ? { ...t, name: editingTemplate.name, message: editingTemplate.message }
        : t
    ));
    
    setEditingId(null);
    setEditingTemplate({ name: "", message: "" });
    
    toast({
      title: "Template updated!",
      description: "Your changes have been saved",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTemplate({ name: "", message: "" });
  };
  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast({
        title: "Fill in all fields",
        description: "Both name and message are required",
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
    setSelectedPersonName("");
    
    toast({
      title: "Template added!",
      description: `Template "${template.name}" has been created`,
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: "Template deleted",
      description: "Template has been removed",
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
          <DialogTitle className="text-xl">Message Templates</DialogTitle>
          <DialogDescription>
            Create and manage your birthday messages
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Existing Templates */}
          <div className="space-y-4">
            <h3 className="font-semibold">Your Templates</h3>
            {templates.map((template) => (
              <Card key={template.id} className="bg-background/50 border-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {editingId === template.id ? (
                        <Input
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                          className="text-sm h-8"
                          placeholder="Template name"
                        />
                      ) : (
                        template.name
                      )}
                    </CardTitle>
                    <div className="flex gap-2">
                      {editingId === template.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveEdit}
                            className="h-8 px-2 text-green-600"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-8 px-2 text-gray-500"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(template)}
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
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {editingId === template.id ? (
                    <Textarea
                      value={editingTemplate.message}
                      onChange={(e) => setEditingTemplate({...editingTemplate, message: e.target.value})}
                      className="min-h-[80px] text-sm"
                      placeholder="Enter your message"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{template.message}</p>
                  )}
                  
                  {editingId !== template.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => previewMessage(template.message)}
                      className="mt-3 text-xs border-primary/20"
                    >
                      Preview in SMS
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Template */}
          <Card className="bg-pastel-mint/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g. Family, Friends, Colleagues..."
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="templateMessage">Message</Label>
                <Textarea
                  id="templateMessage"
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({...newTemplate, message: e.target.value})}
                  placeholder="Write your birthday message here..."
                  className="bg-background/50 min-h-[80px] border-primary/20"
                />
              </div>

              {/* AI Message Generator */}
              <Card className="bg-pastel-lavender/20 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-xs flex items-center">
                    <Sparkles className="w-3 h-3 mr-2" />
                    AI Message Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={selectedPersonName}
                      onChange={(e) => setSelectedPersonName(e.target.value)}
                      placeholder="Person's name"
                      className="text-xs h-8"
                    />
                    <Input
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Perplexity API key"
                      className="text-xs h-8"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={generateAIMessage}
                    disabled={isGeneratingAI || !selectedPersonName.trim()}
                    className="w-full bg-gradient-primary hover:shadow-soft"
                    size="sm"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-2" />
                        Generate AI Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              <Button 
                onClick={addTemplate}
                className="w-full bg-gradient-primary hover:shadow-soft"
                size="sm"
              >
                Create Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
