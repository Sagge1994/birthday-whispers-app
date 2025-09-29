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

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Contact>) => void;
  onEdit?: (contact: Contact) => void;
}

export const ContactCard = ({ contact, onDelete, onUpdate, onEdit }: ContactCardProps) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { sendSMS } = useSMS();
  const { scheduleLocalNotification } = usePushNotifications();
  
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

  const scheduleNotification = () => {
    if (!contact.birthday) {
      toast({
        title: "Ingen födelsedag",
        description: "Denna kontakt har ingen födelsedag angiven för att ställa in påminnelse",
        variant: "destructive"
      });
      return;
    }
    
    const birthdayDate = new Date(contact.birthday);
    const birthdayYear = getBirthdayYear(contact.birthday);
    const message = getContactMessage(contact, birthdayYear);
    
    birthdayDate.setFullYear(birthdayYear);
    
    // Schedule notification for the day before
    const reminderDate = new Date(birthdayDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    
    // Create different notification messages based on whether phone exists
    const notificationTitle = `${contact.name}s födelsedag imorgon!`;
    const notificationMessage = contact.phone 
      ? `${message} (Tryck för att skicka SMS)`
      : `Glöm inte gratta ${contact.name} imorgon! ${message}`;
    
    scheduleLocalNotification(
      notificationTitle,
      notificationMessage,
      reminderDate
    );
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{contact.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              {formatBirthday()}
            </div>
            <p className="text-sm text-muted-foreground">
              {getAgeText()}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="z-[100] min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-1"
            >
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Edit button clicked for:', contact.name);
                  if (onEdit) {
                    onEdit(contact);
                  } else {
                    console.error('onEdit callback is missing');
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-2" />
                Redigera
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(contact.id)} 
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('contact.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {contact.birthday ? (
            isToday ? (
              <Badge className="bg-gradient-accent text-accent-foreground border-0">
                {t('contact.birthdayToday')}
              </Badge>
            ) : isSoon ? (
              <Badge variant="secondary" className="bg-pastel-peach/50">
                {getDaysText()}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-primary/20">
                {getDaysText()}
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="border-muted/30 text-muted-foreground">
              Ingen födelsedag angiven
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {contact.phone ? (
            <Button 
              onClick={handleSendSMS}
              className="w-full bg-gradient-primary hover:shadow-soft transition-all duration-300"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('contact.sendSMS')}
            </Button>
          ) : (
            <Button 
              onClick={scheduleNotification}
              className="w-full bg-gradient-primary hover:shadow-soft transition-all duration-300"
              size="sm"
            >
              <Bell className="w-4 h-4 mr-2" />
              Ställ in påminnelse
            </Button>
          )}
          
          {contact.phone && (
            <Button 
              onClick={scheduleNotification}
              variant="outline"
              className="w-full border-primary/20"
              size="sm"
            >
              <Bell className="w-4 h-4 mr-2" />
              Ställ in påminnelse
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};