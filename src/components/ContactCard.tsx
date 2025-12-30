import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MessageSquare, Trash2, Calendar, Bell, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Contact } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useSMS } from "@/hooks/useSMS";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { getContactMessage, getBirthdayYear } from '@/lib/messageUtils';
import { ReminderDialog } from "./ReminderDialog";

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Contact>) => void;
  onEdit?: (contact: Contact) => void;
}

export const ContactCard = ({ contact, onDelete, onUpdate, onEdit }: ContactCardProps) => {
  console.log('🟡 ContactCard rendered for:', contact.name, 'onEdit received:', !!onEdit);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { sendSMS } = useSMS();
  const { scheduleLocalNotification } = usePushNotifications();
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  
  const calculateDaysUntilBirthday = () => {
    if (!contact.birthday) return null;
    
    const today = new Date();
    const birthday = new Date(contact.birthday);
    const currentYear = today.getFullYear();
    
    // Set birthday to current year
    birthday.setFullYear(currentYear);
    
    // If birthday has passed this year, set to next year
    if (birthday < today) {
      birthday.setFullYear(currentYear + 1);
    }
    
    const diffTime = birthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntil = calculateDaysUntilBirthday();
  const isToday = daysUntil === 0;
  const isSoon = daysUntil !== null && daysUntil <= 7 && daysUntil > 0;

  const formatBirthday = () => {
    if (!contact.birthday) return t('contact.noBirthdaySet') || 'Ingen födelsedag angiven';
    
    const date = new Date(contact.birthday);
    // Use current language for date formatting
    const locale = i18n.language === 'sv' ? 'sv-SE' : 
                  i18n.language === 'es' ? 'es-ES' :
                  i18n.language === 'fr' ? 'fr-FR' : 'en-US';
                  
    return date.toLocaleDateString(locale, { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getAge = () => {
    if (!contact.birthday) return null;
    
    const today = new Date();
    const birthDate = new Date(contact.birthday);
    
    // Check if birthday has a valid year (not just month-day)
    const birthYear = birthDate.getFullYear();
    if (birthYear < 1900 || birthYear > today.getFullYear()) {
      return null; // Invalid or missing year
    }
    
    // Calculate the age they turn this year
    return today.getFullYear() - birthYear;
  };

  const getAgeText = () => {
    const age = getAge();
    console.log('Age calculation:', { 
      contactName: contact.name, 
      birthday: contact.birthday, 
      calculatedAge: age 
    });
    
    if (age === null) {
      return t('contact.turnsAgeUnknown');
    }
    
    // Direct string for debugging
    return `Fyller ${age} år`;
  };

  const getDaysText = () => {
    if (daysUntil === null) return '';
    if (daysUntil === 1) {
      return `📅 Om ${daysUntil} dag`;
    }
    return `📅 Om ${daysUntil} dagar`;
  };

  const handleSendSMS = () => {
    if (!contact.phone) {
      toast({
        title: "Inget telefonnummer",
        description: "Denna kontakt har inget telefonnummer sparat",
        variant: "destructive"
      });
      return;
    }

    if (!contact.birthday) {
      toast({
        title: "Ingen födelsedag",
        description: "Denna kontakt har ingen födelsedag angiven för att skicka meddelande",
        variant: "destructive"
      });
      return;
    }

    const birthdayYear = getBirthdayYear(contact.birthday);
    const message = getContactMessage(contact, birthdayYear);
    sendSMS(contact.phone, message);
  };

  const handleOpenReminderDialog = () => {
    if (!contact.birthday) {
      toast({
        title: "Ingen födelsedag",
        description: "Denna kontakt har ingen födelsedag angiven för att ställa in påminnelse",
        variant: "destructive"
      });
      return;
    }
    setShowReminderDialog(true);
  };

  const handleScheduleReminder = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const reminderDate = new Date(date);
    reminderDate.setHours(hours, minutes, 0, 0);
    
    const birthdayYear = getBirthdayYear(contact.birthday!);
    const message = getContactMessage(contact, birthdayYear);
    
    // Create notification message
    const notificationTitle = `🎂 ${contact.name}s födelsedag!`;
    const notificationMessage = contact.phone 
      ? `${message} (Tryck för att skicka SMS)`
      : `Glöm inte gratta ${contact.name}! ${message}`;
    
    scheduleLocalNotification(
      notificationTitle,
      notificationMessage,
      reminderDate
    );
    
    toast({
      title: "Påminnelse inställd! 🔔",
      description: `Du kommer bli påmind ${reminderDate.toLocaleDateString('sv-SE')} kl ${time}`,
    });
  };

  return (
    <>
      <Card className="border shadow-soft hover:shadow-card transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base truncate">{contact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{formatBirthday()}</span>
                    {contact.birthday && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {isToday ? "Idag!" : getDaysText()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {contact.phone && (
                <Button 
                  onClick={handleSendSMS}
                  size="sm"
                  className="h-8 px-3"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
              <Button 
                onClick={handleOpenReminderDialog}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="z-[100] min-w-[120px] bg-background border shadow-lg rounded-lg p-1"
                >
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onEdit) onEdit(contact);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    Redigera
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(contact.id)} 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('contact.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReminderDialog
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        contact={contact}
        onSchedule={handleScheduleReminder}
      />
    </>
  );
};
