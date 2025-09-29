import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Facebook, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FacebookImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FacebookImporter = ({ open, onOpenChange }: FacebookImporterProps) => {
  const { toast } = useToast();

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Facebook className="w-5 h-5 mr-2 text-blue-600" />
            Import from Facebook
          </DialogTitle>
          <DialogDescription>
            Connect your Facebook account to import birthday information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Backend Integration Required</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    To import birthdays from Facebook, you need to connect your project to Supabase for secure API handling and data storage.
                  </p>
                  <Badge className="bg-blue-600 text-white">
                    Supabase Integration Needed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-900 mb-2">Facebook API Limitations</h3>
                  <p className="text-sm text-orange-800">
                    Due to Facebook's privacy policies, birthday data access is limited and requires special app approval. We recommend using the contact import feature instead.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              For now, use the "Import Contacts" feature to sync birthdays from your phone contacts.
            </p>
            
            <Button 
              onClick={handleClose}
              className="bg-gradient-primary hover:shadow-soft"
            >
              Got it, use Contact Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};