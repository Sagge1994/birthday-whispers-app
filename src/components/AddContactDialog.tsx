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
import { Contact } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContact: (contact: Omit<Contact, "id">) => void;
  onUpdateContact?: (id: string, updates: Partial<Contact>) => void;
  editingContact?: Contact | null;
}

export const AddContactDialog = ({ open, onOpenChange, onAddContact, onUpdateContact, editingContact }: AddContactDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    phone: "",
    custom_message: "",
    yearly_messages: {} as Record<string, string>
  });

  // Update form data when editing contact changes
  useEffect(() => {
    if (editingContact && open) {
      setFormData({
        name: editingContact.name || "",
        birthday: editingContact.birthday || "",
        phone: editingContact.phone || "",
        custom_message: editingContact.custom_message || "",
        yearly_messages: editingContact.yearly_messages || {}
      });
    } else if (!editingContact && open) {
      // Reset form when adding new contact
      setFormData({
        name: "",
        birthday: "",
        phone: "",
        custom_message: "",
        yearly_messages: {}
      });
    }
  }, [editingContact, open]);

  const isEditing = !!editingContact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Namn krävs",
        description: "Vänligen ange ett namn för personen",
        variant: "destructive"
      });
      return;
    }

    const contactData = {
      name: formData.name,
      birthday: formData.birthday || null,
      phone: formData.phone || null,
      custom_message: formData.custom_message || null,
      yearly_messages: Object.keys(formData.yearly_messages).length > 0 ? formData.yearly_messages : null
    };

    if (isEditing && onUpdateContact && editingContact) {
      onUpdateContact(editingContact.id, contactData);
      toast({
        title: "Kontakt uppdaterad!",
        description: `${formData.name} har uppdaterats`,
      });
    } else {
      onAddContact(contactData);
      toast({
        title: "Person tillagd!",
        description: `${formData.name} har lagts till i din lista`,
      });
    }

    // Reset form
    setFormData({
      name: "",
      birthday: "",
      phone: "",
      custom_message: "",
      yearly_messages: {}
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Redigera kontakt" : "Lägg till person"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Uppdatera personens information" 
              : "Fyll i personens information för att komma ihåg deras födelsedag"
            }
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
            <Label htmlFor="birthday">Födelsedag (valfritt)</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({...formData, birthday: e.target.value})}
              className="bg-background/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer (valfritt)</Label>
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
            <Label htmlFor="custom_message">Personligt meddelande (valfritt)</Label>
            <Textarea
              id="custom_message"
              value={formData.custom_message}
              onChange={(e) => setFormData({...formData, custom_message: e.target.value})}
              placeholder="Skriv ett personligt födelsedagsmeddelande..."
              className="bg-background/50 min-h-[80px]"
            />
          </div>
          
          {/* Yearly Messages Section */}
          <div className="space-y-2">
            <Label>Årliga meddelanden (valfritt)</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Planera meddelanden för kommande år - skriv bara för de år du vill
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <div key={year} className="flex gap-2 items-center">
                  <Label className="w-12 text-xs font-medium">{year}:</Label>
                  <Input
                    value={formData.yearly_messages[year] || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      yearly_messages: {
                        ...formData.yearly_messages,
                        [year]: e.target.value
                      }
                    })}
                    placeholder={year === 2025 ? "Meddelande för i år..." : `Meddelande för ${year}...`}
                    className="bg-background/50 text-xs h-8"
                  />
                </div>
              ))}
            </div>
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
              {isEditing ? "Uppdatera kontakt" : "Lägg till person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};