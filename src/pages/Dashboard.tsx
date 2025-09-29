import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageSquare, 
  Bell, 
  Users, 
  Plus, 
  Settings,
  Download,
  Sparkles,
  Heart,
  Clock,
  Gift,
  Facebook
} from "lucide-react";
import { Contact } from "@/pages/Index";
import { ContactCard } from "@/components/ContactCard";
import { AddContactDialog } from "@/components/AddContactDialog";
import { MessageTemplateManager } from "@/components/MessageTemplateManager";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ContactImporter } from "@/components/ContactImporter";
import { FacebookImporter } from "@/components/FacebookImporter";
import { CalendarView } from "@/components/CalendarView";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
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
  const [showImporter, setShowImporter] = useState(false);
  const [showFacebookImporter, setShowFacebookImporter] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const addContact = (contact: Omit<Contact, "id">) => {
    const newContact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts([...contacts, newContact]);
  };

  const addMultipleContacts = (newContacts: Omit<Contact, "id">[]) => {
    const contactsWithIds = newContacts.map(contact => ({
      ...contact,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));
    setContacts([...contacts, ...contactsWithIds]);
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Get upcoming birthdays
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const upcoming = contacts.filter(contact => {
      const birthday = new Date(contact.birthday);
      const currentYear = today.getFullYear();
      birthday.setFullYear(currentYear);
      
      if (birthday < today) {
        birthday.setFullYear(currentYear + 1);
      }
      
      const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30; // Next 30 days
    });
    
    return upcoming.slice(0, 3); // Show max 3
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const quickActions = [
    {
      icon: Plus,
      title: "Add Birthday",
      description: "Quickly add someone new",
      action: () => setShowAddDialog(true),
      color: "bg-gradient-primary"
    },
    {
      icon: Download,
      title: "Import Contacts", 
      description: "Sync from your phone",
      action: () => setShowImporter(true),
      color: "bg-pastel-mint"
    },
    {
      icon: Facebook,
      title: "Facebook Import", 
      description: "Import from Facebook",
      action: () => setShowFacebookImporter(true),
      color: "bg-blue-500"
    },
    {
      icon: Calendar,
      title: "Calendar View",
      description: "See all birthdays visually",
      action: () => setShowCalendar(true),
      color: "bg-pastel-lavender"
    },
    {
      icon: MessageSquare,
      title: "Message Templates",
      description: "Manage your messages",
      action: () => setShowMessageManager(true),
      color: "bg-pastel-peach"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Set up reminders",
      action: () => setShowSettings(true),
      color: "bg-pastel-blue"
    },
    {
      icon: Sparkles,
      title: "AI Messages",
      description: "Generate personal wishes",
      action: () => {
        toast({
          title: "AI Messages",
          description: "Add a contact first, then use AI suggestions in the calendar view!",
        });
      },
      color: "bg-gradient-accent"
    }
  ];

  if (showCalendar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-pastel-pink/20 to-pastel-lavender/30">
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                🗓️ Birthday Calendar
              </h1>
              <p className="text-muted-foreground">
                Visual overview of all your important dates
              </p>
            </div>
            <Button
              onClick={() => setShowCalendar(false)}
              variant="outline"
              className="border-primary/20"
            >
              Back to Dashboard
            </Button>
          </div>
          
          <CalendarView contacts={contacts} onAddContact={addContact} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pastel-pink/20 to-pastel-lavender/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
            <h3 className="font-semibold text-lg mb-3 bg-gradient-primary bg-clip-text text-transparent">
              🎂 Birthday Dashboard
            </h3>
            <p className="text-xl text-muted-foreground">
              Your command center for never missing a special moment
            </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{contacts.length}</div>
              <div className="text-sm text-muted-foreground">Total Contacts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{upcomingBirthdays.length}</div>
              <div className="text-sm text-muted-foreground">Upcoming This Month</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Birthdays Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                onClick={action.action}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-primary" />
              Upcoming Birthdays
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBirthdays.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={deleteContact}
                  onUpdate={updateContact}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Contacts */}
        {contacts.length === 0 ? (
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎈</div>
              <h3 className="text-xl font-semibold mb-2">No contacts yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your friends and family to never miss their special days
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-primary hover:shadow-soft"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
                <Button 
                  onClick={() => setShowImporter(true)}
                  variant="outline"
                  className="border-primary/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import from Phone
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-primary" />
              Your Contacts ({contacts.length})
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.slice(0, 6).map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={deleteContact}
                  onUpdate={updateContact}
                />
              ))}
            </div>
            
            {contacts.length > 6 && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => setShowCalendar(true)}
                  variant="outline"
                  className="border-primary/20"
                >
                  View All {contacts.length} Contacts
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Dialogs */}
        <AddContactDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddContact={addContact}
        />
        
        <ContactImporter
          open={showImporter}
          onOpenChange={setShowImporter}
          onImportContacts={addMultipleContacts}
          existingContacts={contacts}
        />
        
        <FacebookImporter
          open={showFacebookImporter}
          onOpenChange={setShowFacebookImporter}
        />
        
        <MessageTemplateManager
          open={showMessageManager}
          onOpenChange={setShowMessageManager}
        />
        
        <SettingsPanel
          open={showSettings}
          onOpenChange={setShowSettings}
          contacts={contacts}
        />
      </div>
    </div>
  );
};

export default Dashboard;