import { useState } from "react";
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
import { Contact } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContact: (contact: Omit<Contact, "id">) => void;
}

export const AddContactDialog = ({ open, onOpenChange, onAddContact }: AddContactDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    phone: "",
    customMessage: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthday || !formData.phone) {
      toast({
        title: "Fyll i alla fält",
        description: "Namn, födelsedag och telefonnummer krävs",
        variant: "destructive"
      });
      return;
    }

    onAddContact({
      name: formData.name,
      birthday: formData.birthday,
      phone: formData.phone,
      customMessage: formData.customMessage || undefined
    });

    toast({
      title: "Kontakt tillagd!",
      description: `${formData.name} har lagts till i din lista`,
    });

    // Reset form
    setFormData({
      name: "",
      birthday: "",
      phone: "",
      customMessage: ""
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-xl">Lägg till ny person</DialogTitle>
          <DialogDescription>
            Fyll i personens information för att komma ihåg deras födelsedag
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="birthday">Födelsedag *</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({...formData, birthday: e.target.value})}
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
          
          <div className="space-y-2">
            <Label htmlFor="customMessage">Anpassat meddelande (valfritt)</Label>
            <Textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => setFormData({...formData, customMessage: e.target.value})}
              placeholder="Skriv ett personligt födelsedagsmeddelande..."
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
              Lägg till
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};