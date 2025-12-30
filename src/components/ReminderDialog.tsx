import { useState } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Contact } from "@/hooks/useContacts";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onSchedule: (date: Date, time: string) => void;
}

export const ReminderDialog = ({ open, onOpenChange, contact, onSchedule }: ReminderDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    // Default to day before birthday
    if (contact.birthday) {
      const birthday = new Date(contact.birthday);
      const today = new Date();
      birthday.setFullYear(today.getFullYear());
      if (birthday < today) {
        birthday.setFullYear(today.getFullYear() + 1);
      }
      birthday.setDate(birthday.getDate() - 1);
      return birthday;
    }
    return new Date();
  });
  
  const [selectedTime, setSelectedTime] = useState("10:00");

  const timeOptions = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00"
  ];

  const handleSchedule = () => {
    if (selectedDate) {
      onSchedule(selectedDate, selectedTime);
      onOpenChange(false);
    }
  };

  const formatBirthdayInfo = () => {
    if (!contact.birthday) return "";
    const birthday = new Date(contact.birthday);
    return format(birthday, "d MMMM", { locale: sv });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Ställ in påminnelse
          </DialogTitle>
          <DialogDescription>
            Välj när du vill bli påmind om {contact.name}s födelsedag ({formatBirthdayInfo()})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Datum</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: sv }) : "Välj datum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tid</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Välj tid" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Snabbval</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (contact.birthday) {
                    const birthday = new Date(contact.birthday);
                    const today = new Date();
                    birthday.setFullYear(today.getFullYear());
                    if (birthday < today) {
                      birthday.setFullYear(today.getFullYear() + 1);
                    }
                    setSelectedDate(birthday);
                    setSelectedTime("10:00");
                  }
                }}
              >
                Samma dag
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (contact.birthday) {
                    const birthday = new Date(contact.birthday);
                    const today = new Date();
                    birthday.setFullYear(today.getFullYear());
                    if (birthday < today) {
                      birthday.setFullYear(today.getFullYear() + 1);
                    }
                    birthday.setDate(birthday.getDate() - 1);
                    setSelectedDate(birthday);
                    setSelectedTime("18:00");
                  }
                }}
              >
                Dagen innan
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (contact.birthday) {
                    const birthday = new Date(contact.birthday);
                    const today = new Date();
                    birthday.setFullYear(today.getFullYear());
                    if (birthday < today) {
                      birthday.setFullYear(today.getFullYear() + 1);
                    }
                    birthday.setDate(birthday.getDate() - 7);
                    setSelectedDate(birthday);
                    setSelectedTime("10:00");
                  }
                }}
              >
                En vecka innan
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSchedule} className="bg-gradient-primary">
            <Bell className="w-4 h-4 mr-2" />
            Ställ in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
