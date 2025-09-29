import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Cake, MessageSquare, Plus } from "lucide-react";
import { Contact } from "@/hooks/useContacts";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { sv } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { QuickAddBirthdayDialog } from "@/components/QuickAddBirthdayDialog";

interface CalendarViewProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, "id">) => void;
}

export const CalendarView = ({ contacts, onAddContact }: CalendarViewProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);

  // Get birthdays for the current month
  const getBirthdaysForDate = (date: Date) => {
    return contacts.filter(contact => {
      const contactBirthday = new Date(contact.birthday);
      return contactBirthday.getDate() === date.getDate() && 
             contactBirthday.getMonth() === date.getMonth();
    });
  };

  // Get all birthday dates in current month
  const getBirthdayDates = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    return daysInMonth.filter(date => getBirthdaysForDate(date).length > 0);
  };

  const birthdayDates = getBirthdayDates();
  const selectedDateBirthdays = getBirthdaysForDate(selectedDate);

  const handleQuickAdd = (date: Date) => {
    setQuickAddDate(date);
    setShowQuickAdd(true);
  };

  const sendSMS = (contact: Contact) => {
    const defaultMessage = `Grattis på födelsedagen! 🎉 Hoppas du får en fantastisk dag! 🎂`;
    const message = contact.custom_message || defaultMessage;
    const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
    
    toast({
      title: "SMS förberett!",
      description: `Meddelande till ${contact.name} är redo att skicka`,
    });
  };

  const getAge = (contact: Contact) => {
    const today = new Date();
    const birthDate = new Date(contact.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age + 1; // Next birthday age
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="border-primary/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-2xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            {format(currentMonth, 'MMMM yyyy', { locale: sv })}
          </h2>
          
          <Button
            variant="outline" 
            size="icon"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="border-primary/20"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Cake className="w-4 h-4" />
          <span>{birthdayDates.length} födelsedagar denna månad</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={sv}
                className="w-full pointer-events-auto"
                modifiers={{
                  birthday: birthdayDates
                }}
                modifiersStyles={{
                  birthday: {
                    backgroundColor: 'hsl(var(--pastel-peach))',
                    color: 'hsl(var(--foreground))',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    position: 'relative'
                  }
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dayBirthdays = getBirthdaysForDate(date);
                    const hasBirthday = dayBirthdays.length > 0;
                    
                    return (
                      <div className="relative w-full h-full flex items-center justify-center group">
                        <span>{date.getDate()}</span>
                        {hasBirthday && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        {!hasBirthday && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdd(date);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity p-0 hover:bg-pastel-mint/30"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Cake className="w-5 h-5 mr-2" />
                {format(selectedDate, 'd MMMM', { locale: sv })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateBirthdays.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-muted-foreground text-sm">
                    Inga födelsedagar denna dag
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateBirthdays.map((contact) => (
                    <div key={contact.id} className="p-4 bg-background/50 rounded-lg border border-primary/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Fyller {getAge(contact)} år
                          </p>
                        </div>
                        <Badge className="bg-gradient-accent text-accent-foreground border-0">
                          🎉 Födelsedag!
                        </Badge>
                      </div>
                      
                      <Button
                        onClick={() => sendSMS(contact)}
                        className="w-full bg-gradient-primary hover:shadow-soft transition-all duration-300"
                        size="sm"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Skicka grattis-SMS
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          {birthdayDates.length > 0 && (
            <Card className="bg-pastel-mint/20 border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm">Denna månad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {birthdayDates.slice(0, 5).map((date) => {
                    const dayBirthdays = getBirthdaysForDate(date);
                    return (
                      <div key={date.toISOString()} className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {format(date, 'd MMM', { locale: sv })}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dayBirthdays.map((contact) => (
                            <Badge key={contact.id} variant="outline" className="text-xs border-primary/20">
                              {contact.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {birthdayDates.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{birthdayDates.length - 5} fler...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Quick Add Dialog */}
      <QuickAddBirthdayDialog
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        selectedDate={quickAddDate}
        onAddContact={onAddContact}
      />
    </div>
  );
};