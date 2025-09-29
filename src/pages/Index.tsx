import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageCircle } from "lucide-react";
import { ContactCard } from "@/components/ContactCard";
import { AddContactDialog } from "@/components/AddContactDialog";
import { MessageTemplateManager } from "@/components/MessageTemplateManager";
import { SettingsPanel } from "@/components/SettingsPanel";

export interface Contact {
  id: string;
  name: string;
  birthday: string;
  phone: string;
  customMessage?: string;
}

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Anna Svensson",
      birthday: "2024-10-15",
      phone: "+46701234567"
    },
    {
      id: "2", 
      name: "Erik Johansson",
      birthday: "2024-10-30",
      phone: "+46701234568"
    }
  ]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMessageManager, setShowMessageManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const addContact = (contact: Omit<Contact, "id">) => {
    const newContact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts([...contacts, newContact]);
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Sort contacts by upcoming birthdays
  const sortedContacts = [...contacts].sort((a, b) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const aDate = new Date(a.birthday);
    const bDate = new Date(b.birthday);
    
    // Set to current year for comparison
    aDate.setFullYear(currentYear);
    bDate.setFullYear(currentYear);
    
    // If birthday has passed this year, set to next year
    if (aDate < today) aDate.setFullYear(currentYear + 1);
    if (bDate < today) bDate.setFullYear(currentYear + 1);
    
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pastel-pink/20 to-pastel-lavender/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            🎂 Födelsedagar
          </h1>
          <p className="text-muted-foreground text-lg">
            Glöm aldrig en vän igen
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:shadow-soft transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Lägg till person
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowMessageManager(true)}
            className="border-primary/20 hover:bg-pastel-lavender/50 transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Meddelanden
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="border-primary/20 hover:bg-pastel-peach/50 transition-all duration-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Inställningar
          </Button>
        </div>

        {/* Contacts Grid */}
        {sortedContacts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎈</div>
            <h3 className="text-xl font-semibold mb-2">Inga kontakter än</h3>
            <p className="text-muted-foreground mb-6">
              Lägg till dina vänner och familj för att komma ihåg deras födelsedagar
            </p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-primary hover:shadow-soft"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lägg till första personen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={deleteContact}
                onUpdate={updateContact}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <AddContactDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddContact={addContact}
        />
        
        <MessageTemplateManager
          open={showMessageManager}
          onOpenChange={setShowMessageManager}
        />
        
        <SettingsPanel
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </div>
    </div>
  );
};

export default Index;