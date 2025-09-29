import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Phone, Calendar, CheckCircle2 } from "lucide-react";
import { Contact } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface ImportableContact {
  name: string;
  phone: string;
  birthday?: string;
  source: 'phone' | 'manual';
}

interface ContactImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportContacts: (contacts: Omit<Contact, "id">[]) => void;
  existingContacts: Contact[];
}

export const ContactImporter = ({ 
  open, 
  onOpenChange, 
  onImportContacts, 
  existingContacts 
}: ContactImporterProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<ImportableContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'request' | 'select' | 'complete'>('request');

  // Mock contact data for demo (in real app, this would come from device contacts)
  const mockContacts: ImportableContact[] = [
    { name: "Maria Andersson", phone: "+46701234569", birthday: "1992-03-15", source: 'phone' },
    { name: "Johan Larsson", phone: "+46701234570", birthday: "1988-07-22", source: 'phone' },
    { name: "Lisa Nilsson", phone: "+46701234571", birthday: "1995-11-08", source: 'phone' },
    { name: "Peter Eriksson", phone: "+46701234572", birthday: "1990-12-03", source: 'phone' },
    { name: "Sara Björk", phone: "+46701234573", birthday: "1987-04-18", source: 'phone' },
    { name: "David Holm", phone: "+46701234574", source: 'phone' }, // No birthday
    { name: "Emma Lindqvist", phone: "+46701234575", birthday: "1993-09-12", source: 'phone' },
  ];

  const requestContactAccess = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, you would use:
      // - Contact Picker API for web: navigator.contacts?.select()
      // - Capacitor Contacts plugin for mobile: Contacts.getContacts()
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Filter out contacts that already exist
      const newContacts = mockContacts.filter(contact => 
        !existingContacts.some(existing => 
          existing.phone === contact.phone || existing.name === contact.name
        )
      );
      
      setAvailableContacts(newContacts);
      
      // Pre-select contacts with birthdays
      const contactsWithBirthdays = new Set(
        newContacts
          .filter(contact => contact.birthday)
          .map(contact => `${contact.name}-${contact.phone}`)
      );
      setSelectedContacts(contactsWithBirthdays);
      
      setStep('select');
      
      toast({
        title: "Kontakter hämtade!",
        description: `Hittade ${newContacts.length} nya kontakter`,
      });
      
    } catch (error) {
      toast({
        title: "Kunde inte komma åt kontakter",
        description: "Kontrollera att du har gett appen behörighet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContactSelection = (contact: ImportableContact) => {
    const contactKey = `${contact.name}-${contact.phone}`;
    const newSelected = new Set(selectedContacts);
    
    if (newSelected.has(contactKey)) {
      newSelected.delete(contactKey);
    } else {
      newSelected.add(contactKey);
    }
    
    setSelectedContacts(newSelected);
  };

  const importSelectedContacts = () => {
    const contactsToImport = availableContacts
      .filter(contact => selectedContacts.has(`${contact.name}-${contact.phone}`))
      .map(contact => ({
        name: contact.name,
        phone: contact.phone,
        birthday: contact.birthday || new Date().toISOString().split('T')[0] // Default to today if no birthday
      }));

    onImportContacts(contactsToImport);
    setStep('complete');
    
    toast({
      title: "Kontakter importerade!",
      description: `${contactsToImport.length} kontakter har lagts till`,
    });

    setTimeout(() => {
      onOpenChange(false);
      setStep('request');
      setAvailableContacts([]);
      setSelectedContacts(new Set());
    }, 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('request');
    setAvailableContacts([]);
    setSelectedContacts(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[700px] overflow-y-auto bg-gradient-card border-0">
        {step === 'request' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Importera kontakter
              </DialogTitle>
              <DialogDescription>
                Hämta kontakter från din telefon som har födelsedagar sparade
              </DialogDescription>
            </DialogHeader>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">Kom åt dina kontakter</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Vi söker igenom dina kontakter efter födelsedagar och låter dig välja vilka du vill lägga till
              </p>
              
              <Button 
                onClick={requestContactAccess}
                disabled={isLoading}
                className="bg-gradient-primary hover:shadow-soft"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Hämtar kontakter...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Hämta kontakter
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Dina kontakter lämnar aldrig din enhet. Vi läser bara födelsedagar.
              </p>
            </div>
          </>
        )}

        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Välj kontakter att importera</DialogTitle>
              <DialogDescription>
                {availableContacts.length} kontakter hittades. Välj vilka du vill lägga till.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {availableContacts.map((contact, index) => {
                const contactKey = `${contact.name}-${contact.phone}`;
                const isSelected = selectedContacts.has(contactKey);
                const hasBirthday = !!contact.birthday;
                
                return (
                  <Card key={index} className={`bg-background/50 border-primary/10 transition-all duration-200 ${isSelected ? 'ring-2 ring-primary/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleContactSelection(contact)}
                          className="border-primary/20"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{contact.name}</h3>
                            <div className="flex gap-2">
                              {hasBirthday ? (
                                <Badge className="bg-gradient-accent text-accent-foreground border-0 text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Födelsedag
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-primary/20 text-xs">
                                  Ingen födelsedag
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          
                          {contact.birthday && (
                            <p className="text-sm text-muted-foreground">
                              Födelsedag: {new Date(contact.birthday).toLocaleDateString('sv-SE', { 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1 border-primary/20"
              >
                Avbryt
              </Button>
              <Button 
                onClick={importSelectedContacts}
                disabled={selectedContacts.size === 0}
                className="flex-1 bg-gradient-primary hover:shadow-soft"
              >
                Importera {selectedContacts.size} kontakter
              </Button>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center text-green-600">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Kontakter importerade!
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-muted-foreground">
                Dina kontakter har lagts till och du kommer nu få påminnelser om deras födelsedagar!
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};