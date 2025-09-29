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
import { Loader2, Users, Phone, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { Contact } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';

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
  const [step, setStep] = useState<'request' | 'select' | 'complete' | 'permission-denied'>('request');
  const [permissionError, setPermissionError] = useState<string>('');

  const requestContactAccess = async () => {
    setIsLoading(true);
    setPermissionError('');
    
    try {
      // Check if we can access contacts
      if (Capacitor.isNativePlatform()) {
        // Mobile app - use Capacitor Contacts plugin
        console.log('Requesting contact permission...');
        
        // Request permission first
        const permission = await Contacts.requestPermissions();
        console.log('Permission result:', permission);
        
        if (permission.contacts !== 'granted') {
          throw new Error('Kontaktbehörighet nekad. Gå till Inställningar > Appar > Birthday Whispers och aktivera kontakter.');
        }
        
        // Get contacts
        console.log('Getting contacts...');
        const result = await Contacts.getContacts({
          projection: {
            name: true,
            phones: true,
            birthday: true,
            image: false,
            emails: false,
            urls: false,
            postalAddresses: false,
            organization: false
          }
        });
        
        console.log('Raw contacts result:', result);
        
        // Transform contacts
        const deviceContacts: ImportableContact[] = result.contacts
          .filter((contact: any) => contact.name?.display && contact.phones?.length > 0)
          .map((contact: any) => ({
            name: contact.name!.display!,
            phone: contact.phones![0].number || '',
            birthday: contact.birthday ? formatBirthday(contact.birthday) : undefined,
            source: 'phone' as const
          }))
          .filter(contact => contact.phone && contact.name);
          
        console.log('Processed contacts:', deviceContacts);
        
        // Filter out existing contacts
        const newContacts = deviceContacts.filter(contact => 
          !existingContacts.some(existing => 
            existing.phone === contact.phone || 
            existing.name.toLowerCase() === contact.name.toLowerCase()
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
        
      } else {
        // Web - try Contact Picker API or fallback to manual import
        if ('contacts' in navigator && 'ContactsManager' in window) {
          try {
            // @ts-ignore - Contact Picker API is experimental
            const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
            
            const webContacts: ImportableContact[] = contacts
              .filter((contact: any) => contact.name && contact.tel?.length > 0)
              .map((contact: any) => ({
                name: contact.name[0],
                phone: contact.tel[0],
                source: 'phone' as const
              }));
            
            const newContacts = webContacts.filter(contact => 
              !existingContacts.some(existing => 
                existing.phone === contact.phone || 
                existing.name.toLowerCase() === contact.name.toLowerCase()
              )
            );
            
            setAvailableContacts(newContacts);
            setSelectedContacts(new Set(newContacts.map(c => `${c.name}-${c.phone}`)));
            setStep('select');
            
            toast({
              title: "Kontakter hämtade!",
              description: `Hittade ${newContacts.length} nya kontakter`,
            });
            
          } catch (error) {
            console.error('Contact Picker API error:', error);
            throw new Error('Kan inte komma åt kontakter i webbläsaren. Prova att lägga till kontakter manuellt istället.');
          }
        } else {
          throw new Error('Kontaktåtkomst stöds inte i denna webbläsare. Använd mobilappen eller lägg till kontakter manuellt.');
        }
      }
        
    } catch (error) {
      console.error('Contact access error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Kunde inte komma åt kontakter';
      setPermissionError(errorMessage);
      setStep('permission-denied');
      
      toast({
        title: "Kunde inte komma åt kontakter",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format birthday from Capacitor contact format
  const formatBirthday = (birthday: any): string | undefined => {
    try {
      if (!birthday) return undefined;
      
      if (typeof birthday === 'string') {
        // Try to parse ISO date string
        const date = new Date(birthday);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      
      if (typeof birthday === 'object') {
        // Handle object format {year, month, day}
        if (birthday.year && birthday.month && birthday.day) {
          const date = new Date(birthday.year, birthday.month - 1, birthday.day);
          return date.toISOString().split('T')[0];
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error formatting birthday:', error);
      return undefined;
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
    setPermissionError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[700px] overflow-y-auto bg-gradient-card border-0">
        {step === 'request' && (
          <>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Importera Kontakter
          </DialogTitle>
          <DialogDescription>
            {Capacitor.isNativePlatform() 
              ? "Importera kontakter från din telefon som har sparade födelsedagar"
              : "Importera kontakter från din webbläsare eller lägg till manuellt"
            }
          </DialogDescription>
        </DialogHeader>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">Få åtkomst till dina kontakter</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Vi söker igenom dina kontakter efter födelsedagar och låter dig välja vilka som ska läggas till
              </p>
              
              <Button 
                onClick={requestContactAccess}
                disabled={isLoading}
                className="bg-gradient-primary hover:shadow-soft"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importerar kontakter...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Importera Kontakter
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Dina kontakter lämnar aldrig din enhet. Vi läser bara födelsedagsinformation.
              </p>
            </div>
          </>
        )}

        {step === 'permission-denied' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                Behörighet nekad
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Kan inte komma åt kontakter</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                {permissionError}
              </p>
              
              {Capacitor.isNativePlatform() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-medium text-blue-800 mb-2">Så här aktiverar du kontaktåtkomst:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>1. Gå till telefonens Inställningar</li>
                    <li>2. Hitta "Birthday Whispers" i applistan</li>
                    <li>3. Aktivera "Kontakter"</li>
                    <li>4. Kom tillbaka hit och försök igen</li>
                  </ul>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1 border-primary/20"
                >
                  Stäng
                </Button>
                <Button 
                  onClick={requestContactAccess}
                  className="flex-1 bg-gradient-primary hover:shadow-soft"
                >
                  Försök igen
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Välj kontakter att importera</DialogTitle>
              <DialogDescription>
                {availableContacts.length} kontakter hittades. Välj vilka som ska läggas till.
              </DialogDescription>
            </DialogHeader>
            
            {availableContacts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🤷‍♂️</div>
                <h3 className="text-lg font-semibold mb-2">Inga nya kontakter</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Alla kontakter med födelsedagar är redan tillagda
                </p>
                <Button onClick={handleClose} className="bg-gradient-primary">
                  OK
                </Button>
              </div>
            ) : (
              <>
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