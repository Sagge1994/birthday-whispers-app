import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const FREE_CONTACT_LIMIT = 5;

export const useSubscriptionLimits = (currentContactCount: number) => {
  const { subscriptionStatus } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Check if user has family access
  const [hasFamilyAccess, setHasFamilyAccess] = useState(false);

  useEffect(() => {
    const savedCode = localStorage.getItem("family_code_applied");
    const FAMILY_CODES = ["FAMILY2025", "GRANDMA", "SIBLINGS", "PARENTS"];
    setHasFamilyAccess(savedCode ? FAMILY_CODES.includes(savedCode) : false);
  }, []);

  const isPremium = subscriptionStatus?.subscribed || hasFamilyAccess;
  const canAddMoreContacts = isPremium || currentContactCount < FREE_CONTACT_LIMIT;
  const contactsRemaining = isPremium ? Infinity : Math.max(0, FREE_CONTACT_LIMIT - currentContactCount);

  const checkLimitAndShowUpgrade = (): boolean => {
    if (canAddMoreContacts) {
      return true;
    }

    // Show upgrade toast when limit is reached
    toast({
      title: t('subscription.limitReached'),
      description: t('subscription.upgradeToAddMore'),
      variant: "destructive",
    });

    // Redirect to subscription page
    setTimeout(() => {
      navigate('/subscription');
    }, 1000); // Small delay to let user see the toast

    return false;
  };

  const getWarningMessage = (): string | null => {
    if (isPremium) return null;
    
    const remaining = contactsRemaining;
    if (remaining <= 2 && remaining > 0) {
      return t('subscription.contactsRemaining', { count: remaining });
    }
    if (remaining === 0) {
      return t('subscription.limitReachedMessage');
    }
    return null;
  };

  return {
    isPremium,
    canAddMoreContacts,
    contactsRemaining,
    checkLimitAndShowUpgrade,
    getWarningMessage
  };
};