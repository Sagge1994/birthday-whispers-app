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
    },
    {
      icon: Users,
      title: "Dina kontakter",
      description: "Visa alla dina kontakter",
      action: () => setShowAllContacts(true),
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
    },
    {
      icon: MessageSquare,
      title: t('actions.messageTemplates'),
      description: t('actions.messageTemplatesDesc'),
      action: () => setShowMessageManager(true),
    },
    {
      icon: Bell,
      title: t('actions.notifications'),
      description: t('actions.notificationsDesc'),
      action: () => setShowSettings(true),
    },
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <LanguageSwitcher />
      
      {/* Mobile Header - Clean and minimal */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4 md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            Födelsedagar
          </h1>
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

      {/* Mobile Quick Add Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 md:hidden">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-primary text-primary-foreground shadow-lg rounded-full h-14 px-6 text-base font-medium"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Lägg till
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h1 className="font-semibold text-2xl text-foreground">
              {t('dashboard.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              <User className="w-3 h-3 mr-1" />
              {user?.email?.split('@')[0]}
            </Badge>
            <Link to="/subscription">
              <Button variant="ghost" size="sm">
                <Crown className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Row - Clean cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <Card className="border shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-foreground">{contacts.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Kontakter</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-foreground">{upcomingBirthdays.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Denna månad</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-foreground">{birthdaysToday.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Idag</div>
            </CardContent>
          </Card>
        </div>

        {/* This Month Section */}
        {upcomingBirthdays.length > 0 && (
          <section className="mb-6 p-4 rounded-xl bg-[hsl(350_70%_95%)] border border-[hsl(350_60%_90%)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Denna månad</h2>
              <Badge className="bg-primary text-primary-foreground">{upcomingBirthdays.length}</Badge>
            </div>
            
            <div className="space-y-3">
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
          </section>
        )}

        {/* Next Month Section */}
        {nextMonthBirthdays.length > 0 && (
          <section className="mb-6 p-4 rounded-xl bg-[hsl(270_50%_96%)] border border-[hsl(270_40%_90%)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[hsl(270_50%_85%)] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[hsl(270_40%_40%)]" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Nästa månad</h2>
              <Badge className="bg-[hsl(270_50%_85%)] text-[hsl(270_40%_30%)]">{nextMonthBirthdays.length}</Badge>
            </div>
            
            <div className="space-y-3">
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
          </section>
        )}

        {/* Quick Actions */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Snabbåtgärder</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="border-2 border-[hsl(350_60%_92%)] hover:border-primary/40 hover:bg-[hsl(350_70%_97%)] transition-all cursor-pointer"
                onClick={action.action}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{action.title}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {contacts.length === 0 && (
          <Card className="border shadow-soft">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🎂</div>
              <h3 className="text-lg font-medium mb-2">{t('dashboard.noContacts')}</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                {t('dashboard.noContactsDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.addFirstContact')}
                </Button>
                <Button onClick={() => setShowImporter(true)} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {t('dashboard.importFromPhone')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Contacts Modal View */}
        {showAllContacts && contacts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-foreground">Alla kontakter</h2>
                <Badge variant="secondary" className="text-xs">{contacts.length}</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAllContacts(false)}
              >
                Dölj
              </Button>
            </div>
            
            <div className="space-y-3">
              {sortedContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={deleteContact}
                  onUpdate={updateContact}
                  onEdit={handleEditContact}
                />
              ))}
            </div>
          </section>
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