import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Crown,
  LogOut,
  User
} from "lucide-react";
import { ContactCard } from "@/components/ContactCard";
import { AddContactDialog } from "@/components/AddContactDialog";
import { MessageTemplateManager } from "@/components/MessageTemplateManager";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ContactImporter } from "@/components/ContactImporter";
import { CalendarView } from "@/components/CalendarView";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useContacts, Contact } from "@/hooks/useContacts";

const FREE_CONTACT_LIMIT = 5;

const Dashboard = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { subscriptionStatus, user, signOut } = useAuth();
  const { contacts, loading, addContact, addMultipleContacts, deleteContact, updateContact } = useContacts();
  
  const { isPremium, checkLimitAndShowUpgrade, getWarningMessage } = useSubscriptionLimits(contacts.length);
  const { isRegistered } = usePushNotifications();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMessageManager, setShowMessageManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  const [showCalendar, setShowCalendar] = useState(false);

  const handleAddContact = async (contact: Omit<Contact, "id">) => {
    // Check subscription limits before adding
    if (!checkLimitAndShowUpgrade()) {
      return;
    }
    
    const success = await addContact(contact);
    if (!success) return;
    
    // Show warning if approaching limit
    const warningMessage = getWarningMessage();
    if (warningMessage && contacts.length + 1 >= FREE_CONTACT_LIMIT - 1) {
      toast({
        title: t('subscription.almostAtLimit'),
        description: warningMessage,
      });
    }
  };

  const handleEditContact = (contact: Contact) => {
    console.log('🟢 Dashboard: Edit contact clicked:', contact.name);
    setEditingContact(contact);
    setShowAddDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      setEditingContact(null);
    }
  };

  const handleAddMultipleContacts = async (newContacts: Omit<Contact, "id">[]) => {
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
    
    await addMultipleContacts(newContacts);
  };

  // Get birthdays today
  const getBirthdaysToday = () => {
    const today = new Date();
    return contacts.filter(contact => {
      if (!contact.birthday) return false;
      
      const birthday = new Date(contact.birthday);
      return birthday.getMonth() === today.getMonth() && 
             birthday.getDate() === today.getDate();
    });
  };

  // Get upcoming birthdays (sorted by closest first)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = contacts
      .filter(contact => contact.birthday) // Only contacts with birthdays
      .map(contact => {
        const birthday = new Date(contact.birthday!);
        const currentYear = today.getFullYear();
        birthday.setFullYear(currentYear);
        birthday.setHours(0, 0, 0, 0);
        
        if (birthday < today) {
          birthday.setFullYear(currentYear + 1);
        }
        
        const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { contact, daysUntil };
      })
      .filter(item => item.daysUntil <= 30) // Next 30 days
      .sort((a, b) => a.daysUntil - b.daysUntil) // Sort by closest first
      .slice(0, 3) // Show max 3
      .map(item => item.contact);
    
    return upcoming;
  };

  const birthdaysToday = getBirthdaysToday();
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
          
          <CalendarView contacts={contacts} onAddContact={handleAddContact} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-background to-pastel-blue p-4">
      <LanguageSwitcher />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h3 className="font-bold text-4xl mb-3 bg-gradient-primary bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h3>
            <p className="text-xl text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/20">
              <User className="w-3 h-3 mr-1" />
              {user?.email?.split('@')[0]}
            </Badge>
            <Link to="/subscription">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Crown className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutDialog(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>


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
              <div className="text-2xl font-bold text-primary">{birthdaysToday.length}</div>
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
                  onEdit={handleEditContact}
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
              {(showAllContacts ? contacts : contacts.slice(0, 6)).map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={deleteContact}
                  onUpdate={updateContact}
                  onEdit={handleEditContact}
                />
              ))}
            </div>
            
            {contacts.length > 6 && (
              <div className="text-center mt-8">
                {!showAllContacts ? (
                  <Button
                    onClick={() => setShowAllContacts(true)}
                    variant="outline"
                    className="border-primary/20"
                  >
                    {t('dashboard.viewAllContacts', { count: contacts.length })}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowAllContacts(false)}
                    variant="outline"
                    className="border-primary/20"
                  >
                    Visa färre kontakter
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dialogs */}
        <AddContactDialog
          open={showAddDialog}
          onOpenChange={handleDialogClose}
          onAddContact={handleAddContact}
          onUpdateContact={updateContact}
          editingContact={editingContact}
        />
        
        <ContactImporter
          open={showImporter}
          onOpenChange={setShowImporter}
          onImportContacts={handleAddMultipleContacts}
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
        
        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Logga ut</AlertDialogTitle>
              <AlertDialogDescription>
                Är du säker på att du vill logga ut?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction onClick={signOut}>
                Logga ut
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;