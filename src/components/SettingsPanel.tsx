import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationSettings } from "@/components/NotificationSettings";
import { Contact } from "@/hooks/useContacts";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
}

export const SettingsPanel = ({ open, onOpenChange, contacts }: SettingsPanelProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] bg-gradient-card border-0 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifikationsinställningar
          </DialogTitle>
          <DialogDescription>
            Anpassa när du vill få påminnelser om födelsedagar
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <NotificationSettings contacts={contacts} />
        </div>

        <div className="flex-shrink-0 pt-4 border-t">
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-primary hover:shadow-soft"
          >
            Stäng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};