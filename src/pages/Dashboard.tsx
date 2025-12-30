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

  // Get upcoming birthdays (all birthdays this month, sorted by day)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    
    const upcoming = contacts
      .filter(contact => {
        if (!contact.birthday) return false;
        const birthday = new Date(contact.birthday);
        return birthday.getMonth() === currentMonth;
      })
      .map(contact => {
        const birthday = new Date(contact.birthday!);
        return { contact, day: birthday.getDate() };
      })
      .sort((a, b) => a.day - b.day) // Sort by day of month
      .map(item => item.contact);
    
    return upcoming;
  };

  // Get next month's birthdays (sorted by day)
  const getNextMonthBirthdays = () => {
    const today = new Date();
    const nextMonth = (today.getMonth() + 1) % 12;
    
    const birthdays = contacts
      .filter(contact => {
        if (!contact.birthday) return false;
        const birthday = new Date(contact.birthday);
        return birthday.getMonth() === nextMonth;
      })
      .map(contact => {
        const birthday = new Date(contact.birthday!);
        return { contact, day: birthday.getDate() };
      })
      .sort((a, b) => a.day - b.day) // Sort by day of month
      .map(item => item.contact);
    
    return birthdays;
  };

  const birthdaysToday = getBirthdaysToday();
  const upcomingBirthdays = getUpcomingBirthdays();
  const nextMonthBirthdays = getNextMonthBirthdays();

  // Sort all contacts by upcoming birthday
  const sortedContacts = [...contacts].sort((a, b) => {
    // Contacts without birthday go to the end
    if (!a.birthday && !b.birthday) return 0;
    if (!a.birthday) return 1;
    if (!b.birthday) return -1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    
    const aDate = new Date(a.birthday);
    aDate.setFullYear(currentYear);
    aDate.setHours(0, 0, 0, 0);
    if (aDate < today) aDate.setFullYear(currentYear + 1);
    
    const bDate = new Date(b.birthday);
    bDate.setFullYear(currentYear);
    bDate.setHours(0, 0, 0, 0);
    if (bDate < today) bDate.setFullYear(currentYear + 1);
    
    return aDate.getTime() - bDate.getTime();
  });

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
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-background to-pastel-blue pb-20 md:pb-0">
      <LanguageSwitcher />
      
      {/* Mobile-optimized Header - Bigger and clearer */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-4 md:hidden shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Födelsedagar
            </h1>
            <p className="text-xs text-muted-foreground">Glöm aldrig en födelsedag</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Quick Add Button - Fixed at bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 md:hidden">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-primary hover:shadow-lg shadow-xl rounded-full h-14 px-6 text-base font-semibold"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Lägg till
        </Button>
      </div>

      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8 max-w-7xl">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
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


        {/* Quick Stats - Bigger on mobile */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-4 md:p-6 text-center">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-primary">
                {contacts.length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Kontakter</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-4 md:p-6 text-center">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-primary">{upcomingBirthdays.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Denna månad</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-4 md:p-6 text-center">
              <Gift className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-primary">{birthdaysToday.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">Idag</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Birthdays - Show FIRST so users see them immediately */}
        {upcomingBirthdays.length > 0 && (
          <div className="mb-8 md:mb-12 bg-pastel-pink/30 rounded-2xl p-4 md:p-6 border-2 border-primary/20">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center text-primary">
              <Calendar className="w-6 h-6 md:w-7 md:h-7 mr-2" />
              🎂 {t('dashboard.upcomingBirthdays')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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

        {/* Next Month Birthdays */}
        {nextMonthBirthdays.length > 0 && (
          <div className="mb-8 md:mb-12 bg-pastel-lavender/30 rounded-2xl p-4 md:p-6 border-2 border-accent/30">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center text-accent-foreground">
              <Clock className="w-6 h-6 md:w-7 md:h-7 mr-2 text-primary" />
              📅 {t('dashboard.nextMonthBirthdays')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {nextMonthBirthdays.map((contact) => (
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

        {/* Quick Actions - Now after birthdays */}
        <div className="mb-6 md:mb-12">
          <h2 className="text-lg md:text-2xl font-semibold mb-3 md:mb-6 flex items-center">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" />
            {t('dashboard.quickActions')}
          </h2>
          
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {quickActions.map((action, index) => {
              if (action.link) {
                return (
                  <Link key={index} to={action.link}>
                    <Card className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                      <CardContent className="p-3 md:p-6 text-center">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                          <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-1">{action.title}</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 hidden md:block">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              }
              
              return (
                <Card
                  key={index}
                  className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer group h-full"
                  onClick={action.action}
                >
                  <CardContent className="p-3 md:p-6 text-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-1">{action.title}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 hidden md:block">{action.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        {/* Your Contacts */}
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
              {(showAllContacts ? sortedContacts : sortedContacts.slice(0, 6)).map((contact) => (
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