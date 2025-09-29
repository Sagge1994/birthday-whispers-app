import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  subscription_end?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  refreshSubscriptionStatus: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  const refreshSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription when user logs in (defer with setTimeout to avoid deadlock)
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase.functions.invoke('check-subscription');
              if (error) {
                console.warn('Subscription check failed:', error);
                // Set default free subscription on error
                setSubscriptionStatus({ subscribed: false });
              } else {
                setSubscriptionStatus(data || { subscribed: false });
              }
            } catch (error) {
              console.warn('Error checking subscription:', error);
              setSubscriptionStatus({ subscribed: false });
            }
          }, 100);
        } else {
          setSubscriptionStatus(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription for existing session (defer with setTimeout)
      if (session?.user) {
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.functions.invoke('check-subscription');
            if (error) {
              console.warn('Subscription check failed:', error);
              setSubscriptionStatus({ subscribed: false });
            } else {
              setSubscriptionStatus(data || { subscribed: false });
            }
          } catch (error) {
            console.warn('Error checking subscription:', error);
            setSubscriptionStatus({ subscribed: false });
          }
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscriptionStatus(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      subscriptionStatus, 
      refreshSubscriptionStatus,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};