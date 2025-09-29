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
  Crown
} from "lucide-react";
import { Contact } from "@/pages/Index";
import { ContactCard } from "@/components/ContactCard";
import { AddContactDialog } from "@/components/AddContactDialog";
import { MessageTemplateManager } from "@/components/MessageTemplateManager";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ContactImporter } from "@/components/ContactImporter";
import { CalendarView } from "@/components/CalendarView";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileAppInfo } from "@/components/MobileAppInfo";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const FREE_CONTACT_LIMIT = 5;

const Dashboard = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { subscriptionStatus } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Anna Svensson",
      birthday: "2025-02-05",
      phone: "+46701234567"
    },
    {
      id: "2", 
      name: "Erik Johansson", 
      birthday: "2025-02-14",
      phone: "+46701234568"
    },
    {
      id: "3",
      name: "Maria Lindqvist",
      birthday: "2025-02-20", 
      phone: "+46701234569"
    }
  ]);
  
  const { isPremium, checkLimitAndShowUpgrade, getWarningMessage } = useSubscriptionLimits(contacts.length);
  const { isRegistered } = usePushNotifications();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMessageManager, setShowMessageManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  
  const [showCalendar, setShowCalendar] = useState(false);

  const addContact = (contact: Omit<Contact, "id">) => {
    // Check subscription limits before adding
    if (!checkLimitAndShowUpgrade()) {
      return;
    }
    
    const newContact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts([...contacts, newContact]);
    
    // Show warning if approaching limit
    const warningMessage = getWarningMessage();
    if (warningMessage && contacts.length + 1 >= FREE_CONTACT_LIMIT - 1) {
      toast({
        title: t('subscription.almostAtLimit'),
        description: warningMessage,
      });
    }
  };

  const addMultipleContacts = (newContacts: Omit<Contact, "id">[]) => {
    // Check if adding these contacts would exceed the limit
    const totalAfterImport = contacts.length + newContacts.length;
    
    if (!isPremium && totalAfterImport > FREE_CONTACT_LIMIT) {
      toast({
        title: t('subscription.importLimitReached'),
        description: t('subscription.canOnlyImport', { 
          count: Math.max(0, FREE_CONTACT_LIMIT - contacts.length) 
        }),
        variant: "destructive",
      });
      return;
    }
    
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
      title: t('actions.addBirthday'),
      description: t('actions.addBirthdayDesc'),
      action: () => setShowAddDialog(true),
      color: "bg-gradient-primary"
    },
    {
      icon: Download,
      title: t('actions.importContacts'), 
      description: t('actions.importContactsDesc'),
      action: () => setShowImporter(true),
    },
    {
      icon: Calendar,
      title: t('actions.calendarView'),
      description: t('actions.calendarViewDesc'),
      action: () => setShowCalendar(true),
      color: "bg-pastel-lavender"
    },
    {
      icon: MessageSquare,
      title: t('actions.messageTemplates'),
      description: t('actions.messageTemplatesDesc'),
      action: () => setShowMessageManager(true),
      color: "bg-pastel-peach"
    },
    {
      icon: Bell,
      title: t('actions.notifications'),
      description: t('actions.notificationsDesc'),
      action: () => setShowSettings(true),
      color: "bg-pastel-blue"
    },
    {
      icon: Sparkles,
      title: t('actions.aiMessages'),
      description: t('actions.aiMessagesDesc'),
      action: () => {
        toast({
          title: t('actions.aiMessagesTitle'),
          description: t('actions.aiMessagesAlert'),
        });
      },
      color: "bg-gradient-accent"
    },
    {
      icon: Crown,
      title: "Premium",
      description: "Uppgradera till Premium-funktioner",
      action: () => {},
      color: "bg-gradient-primary",
      link: "/subscription"
    }
  ];

  if (showCalendar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-pastel-pink/20 to-pastel-lavender/30">
        <LanguageSwitcher />
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t('dashboard.birthdayCalendar')}
              </h1>
              <p className="text-muted-foreground">
                {t('dashboard.calendarSubtitle')}
              </p>
            </div>
            <Button
              onClick={() => setShowCalendar(false)}
              variant="outline"
              className="border-primary/20"
            >
              {t('dashboard.backToDashboard')}
            </Button>
          </div>
          
          <CalendarView contacts={contacts} onAddContact={addContact} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-background to-pastel-blue p-4">
      <LanguageSwitcher />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
            <h3 className="font-bold text-4xl mb-3 bg-gradient-primary bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h3>
            <p className="text-xl text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
        </div>

        {/* Mobile App Info */}
        <MobileAppInfo />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">
                {contacts.length}
                {!isPremium && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{FREE_CONTACT_LIMIT}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{t('dashboard.totalContacts')}</div>
              {!isPremium && contacts.length >= FREE_CONTACT_LIMIT - 1 && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {contacts.length >= FREE_CONTACT_LIMIT ? 
                    t('subscription.limitReached') : 
                    t('subscription.contactsRemaining', { count: FREE_CONTACT_LIMIT - contacts.length })
                  }
                </Badge>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{upcomingBirthdays.length}</div>
              <div className="text-sm text-muted-foreground">{t('dashboard.upcomingThisMonth')}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">{t('dashboard.birthdaysToday')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary" />
            {t('dashboard.quickActions')}
          </h2>
          
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {quickActions.map((action, index) => {
               if (action.link) {
                 return (
                   <Link key={index} to={action.link}>
                     <Card className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                       <CardContent className="p-6 text-center">
                         <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                           <action.icon className="w-6 h-6 text-white" />
                         </div>
                         <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                         <p className="text-xs text-muted-foreground">{action.description}</p>
                       </CardContent>
                     </Card>
                   </Link>
                 );
               }
               
               return (
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
               );
             })}
           </div>
        </div>

        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-primary" />
              {t('dashboard.upcomingBirthdays')}
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
              <h3 className="text-xl font-semibold mb-2">{t('dashboard.noContacts')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('dashboard.noContactsDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-primary hover:shadow-soft"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.addFirstContact')}
                </Button>
                <Button 
                  onClick={() => setShowImporter(true)}
                  variant="outline"
                  className="border-primary/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('dashboard.importFromPhone')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-primary" />
              {t('dashboard.yourContacts')} ({contacts.length})
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
                  {t('dashboard.viewAllContacts', { count: contacts.length })}
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