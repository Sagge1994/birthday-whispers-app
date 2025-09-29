import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MessageSquare, Trash2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Contact } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Contact>) => void;
}

export const ContactCard = ({ contact, onDelete, onUpdate }: ContactCardProps) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  const calculateDaysUntilBirthday = () => {
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
  const isSoon = daysUntil <= 7 && daysUntil > 0;

  const formatBirthday = () => {
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
    const today = new Date();
    const birthDate = new Date(contact.birthday);
    
    // Check if birthday has a valid year (not just month-day)
    const birthYear = birthDate.getFullYear();
    if (birthYear < 1900 || birthYear > today.getFullYear()) {
      return null; // Invalid or missing year
    }
    
    let age = today.getFullYear() - birthYear;
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age + (isToday ? 0 : 1);
  };

  const getAgeText = () => {
    const age = getAge();
    if (age === null) {
      return t('contact.turnsAgeUnknown');
    }
    return t('contact.turnsAge', { age });
  };

  const getDaysText = () => {
    if (daysUntil === 1) {
      return t('contact.inDay', { days: daysUntil });
    }
    return t('contact.inDays', { days: daysUntil });
  };

  const sendSMS = () => {
    const defaultMessage = t('contact.defaultMessage');
    const message = contact.customMessage || defaultMessage;
    
    // Create SMS URL
    const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
    
    // Open SMS app
    window.location.href = smsUrl;
    
    toast({
      title: t('contact.smsReady'),
      description: t('contact.smsReadyDesc', { name: contact.name }),
    });
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('contact.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {isToday ? (
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
          )}
        </div>

        {/* SMS Button */}
        <Button 
          onClick={sendSMS}
          className="w-full bg-gradient-primary hover:shadow-soft transition-all duration-300"
          size="sm"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {t('contact.sendSMS')}
        </Button>
      </CardContent>
    </Card>
  );
};