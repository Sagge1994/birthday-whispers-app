import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  name: string;
  birthday: string;
  phone?: string;
  custom_message?: string;
  yearly_messages?: Record<string, string>;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load contacts from database
  const loadContacts = async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      setContacts(data?.map(contact => ({
        ...contact,
        yearly_messages: contact.yearly_messages as Record<string, string> || undefined
      })) || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Kunde inte ladda kontakter",
        description: "Försök ladda om sidan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new contact
  const addContact = async (contactData: Omit<Contact, "id">) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          ...contactData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [...prev, {
        ...data,
        yearly_messages: data.yearly_messages as Record<string, string> || undefined
      }]);
      
      toast({
        title: "Kontakt tillagd!",
        description: `${contactData.name} har lagts till i din lista`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Kunde inte lägga till kontakt",
        description: "Försök igen",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add multiple contacts
  const addMultipleContacts = async (contactsData: Omit<Contact, "id">[]) => {
    if (!user || contactsData.length === 0) return false;

    try {
      const contactsWithUserId = contactsData.map(contact => ({
        ...contact,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsWithUserId)
        .select();

      if (error) throw error;

      setContacts(prev => [...prev, ...data.map(contact => ({
        ...contact,
        yearly_messages: contact.yearly_messages as Record<string, string> || undefined
      }))]);
      
      toast({
        title: "Kontakter importerade!",
        description: `${contactsData.length} kontakter har lagts till`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding multiple contacts:', error);
      toast({
        title: "Kunde inte importera kontakter",
        description: "Försök igen",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update contact
  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => prev.map(c => c.id === id ? {
        ...data,
        yearly_messages: data.yearly_messages as Record<string, string> || undefined
      } : c));
      
      return true;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Kunde inte uppdatera kontakt",
        description: "Försök igen",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete contact
  const deleteContact = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: "Kontakt borttagen",
        description: "Kontakten har tagits bort från din lista",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Kunde inte ta bort kontakt",
        description: "Försök igen",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load contacts when user changes
  useEffect(() => {
    loadContacts();
  }, [user]);

  return {
    contacts,
    loading,
    addContact,
    addMultipleContacts,
    updateContact,
    deleteContact,
    loadContacts
  };
};