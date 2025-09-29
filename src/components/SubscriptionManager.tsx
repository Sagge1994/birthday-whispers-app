import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Bell, 
  Users,
  Gift,
  Tag,
  AlertTriangle,
  ArrowLeft,
  AlertCircle,
  Settings,
  X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  subscription_end?: string;
  plan_type?: 'monthly' | 'yearly';
}

export const SubscriptionManager = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [familyCode, setFamilyCode] = useState("");
  const [hasFamilyAccess, setHasFamilyAccess] = useState(false);

  // Valid family codes 
  const FAMILY_CODES = ["FAMILY2025", "GRANDMA", "SIBLINGS", "PARENTS", "TEST2025", "BETA", "DEMO", "FREE", "TESTARE"];

  useEffect(() => {
    checkSubscriptionStatus();
    checkFamilyCode();
  }, [user]);

  const checkFamilyCode = () => {
    const savedCode = localStorage.getItem("family_code_applied");
    if (savedCode && FAMILY_CODES.includes(savedCode)) {
      setHasFamilyAccess(true);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          language: i18n.language,
          plan_type: planType
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skapa checkout-session. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    // Show loading toast
    toast({
      title: "Öppnar Stripe hanteringspanel...",
      description: "Du kommer att skickas till Stripe för att hantera din prenumeration",
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data?.url) {
        // Open in new tab and show instruction
        window.open(data.url, '_blank');
        toast({
          title: "Stripe hanteringspanel öppnad!",
          description: "Kolla efter en ny flik där du kan hantera prenumeration, fakturor och betalmetoder",
        });
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Kunde inte öppna hanteringspanelen", 
        description: "Detta kan bero på att du inte har en aktiv Stripe-prenumeration eller att Stripe Customer Portal inte är aktiverat.",
        variant: "destructive"
      });
    }
  };

  const applyFamilyCode = () => {
    if (FAMILY_CODES.includes(familyCode.toUpperCase())) {
      localStorage.setItem("family_code_applied", familyCode.toUpperCase());
      setHasFamilyAccess(true);
      setFamilyCode("");
      toast({
        title: t('subscription.codeApplied'),
        description: t('subscription.freeForFamily'),
      });
    } else {
      toast({
        title: t('subscription.invalidCode'),
        description: "Kontrollera koden och försök igen.",
        variant: "destructive"
      });
    }
  };

  const removeFamilyAccess = () => {
    localStorage.removeItem("family_code_applied");
    setHasFamilyAccess(false);
    toast({
      title: "Familjerabatt avslutad",
      description: "Du kan återaktivera den när som helst med din kod.",
    });
  };

  const isCurrentlyFree = !subscriptionStatus?.subscribed && !hasFamilyAccess;
  const isPremium = subscriptionStatus?.subscribed || hasFamilyAccess;

  const features = [
    t('subscription.feature1'),
    t('subscription.feature2'), 
    t('subscription.feature3'),
    t('subscription.feature4'),
    t('subscription.feature5')
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-primary" />
          {t('subscription.title')}
        </h1>
      </div>

      {/* Current Plan Status */}
      {isPremium && (
        <Card className="bg-gradient-accent border-0 shadow-card mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  {hasFamilyAccess ? (
                    <Gift className="w-8 h-8 text-accent-foreground" />
                  ) : (
                    <Crown className="w-8 h-8 text-accent-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-accent-foreground">
                      {hasFamilyAccess ? 'Familjerabatt Aktiv' : 'Premium Plan'}
                    </h3>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ✓ Aktiv
                    </Badge>
                  </div>
                  <p className="text-lg text-accent-foreground/80 mb-4">
                    {hasFamilyAccess ? 
                      'Du har full tillgång till alla Premium-funktioner gratis!' : 
                      `Premium ${subscriptionStatus?.plan_type || ''} - Fullständig tillgång`
                    }
                  </p>
                  
                  {/* Benefits List */}
                  <div className="grid md:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-accent-foreground/90">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Obegränsade kontakter</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent-foreground/90">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">AI-meddelanden</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent-foreground/90">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">SMS-integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent-foreground/90">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Avancerade påminnelser</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent-foreground/90">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Anpassade meddelanden</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent-foreground/90">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Prioritetsupport</span>
                    </div>
                  </div>

                  {/* Plan Details */}
                  {hasFamilyAccess && (
                    <div className="bg-accent-foreground/10 rounded-lg p-3 mb-4">
                      <h4 className="font-semibold text-accent-foreground mb-2">Om din familjerabatt:</h4>
                      <ul className="text-sm text-accent-foreground/80 space-y-1">
                        <li>• Giltig så länge du har tillgång till koden</li>
                        <li>• Kan användas på flera enheter med samma kod</li>
                        <li>• Samma funktioner som Premium månadsplan</li>
                        <li>• Ingen automatisk förnyelse eller fakturering</li>
                      </ul>
                    </div>
                  )}

                  {subscriptionStatus?.subscribed && subscriptionStatus?.subscription_end && (
                    <div className="bg-accent-foreground/10 rounded-lg p-3 mb-4">
                      <h4 className="font-semibold text-accent-foreground mb-2">Prenumerationsdetaljer:</h4>
                      <div className="text-sm text-accent-foreground/80 space-y-1">
                        <div>Nästa faktura: {new Date(subscriptionStatus.subscription_end).toLocaleDateString('sv-SE')}</div>
                        <div>Plan: {subscriptionStatus.plan_type === 'yearly' ? 'Årlig' : 'Månadsvis'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {subscriptionStatus?.subscribed && !hasFamilyAccess && (
                  <Button 
                    onClick={handleManageSubscription}
                    variant="outline"
                    className="border-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Hantera prenumeration
                  </Button>
                )}
                {hasFamilyAccess && (
                  <Button 
                    onClick={removeFamilyAccess}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Avsluta rabatt
                  </Button>
                )}
              </div>
            </div>

            {/* Action descriptions */}
            <div className="border-t border-accent-foreground/20 pt-4 mt-6">
              {subscriptionStatus?.subscribed && !hasFamilyAccess && (
                <div className="flex items-start gap-2 text-sm text-accent-foreground/70">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Hantera prenumeration:</strong> Öppnar Stripe där du kan se fakturor, ändra betalmetod, 
                    ladda ner kvitton och säga upp prenumerationen.
                  </div>
                </div>
              )}
              {hasFamilyAccess && (
                <div className="flex items-start gap-2 text-sm text-accent-foreground/70">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Avsluta rabatt:</strong> Tar bort gratiskoden från denna enhet. 
                    Du kommer att begränsas till gratis-planen (5 kontakter) men kan återaktivera 
                    rabatten när som helst med samma kod.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Code Section */}
      {!hasFamilyAccess && (
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              {t('subscription.familyCode')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('subscription.familyCodeDesc')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="familyCode">{t('subscription.enterCode')}</Label>
                <Input
                  id="familyCode"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  placeholder="FAMILY2025"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={applyFamilyCode}
                className="mt-6"
                disabled={!familyCode}
              >
                {t('subscription.applyCode')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans - Only show if not premium */}
      {!isPremium && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="bg-gradient-card border-0 shadow-card relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('subscription.freePlan')}</CardTitle>
                {isCurrentlyFree && (
                  <Badge variant="secondary">Aktuell plan</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('subscription.freePlanDesc')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                Gratis
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Upp till 5 kontakter
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Grundläggande påminnelser
                </li>
              </ul>
              
              {/* Warning about limitations */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 mb-1">Begränsningar med gratis-planen:</p>
                     <ul className="text-orange-700 space-y-1">
                       <li>• Max 5 kontakter totalt</li>
                       <li>• Kan inte lägga till fler kontakter när gränsen nås</li>
                     </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Fortsätt med gratis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-gradient-primary border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold">
              Populär
            </div>
            
            <CardHeader className="text-white">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Premium
              </CardTitle>
              <p className="text-sm text-white/80">
                {t('subscription.premiumFeatures')}
              </p>
            </CardHeader>
            <CardContent className="text-white">
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">11 kr</span>
                  <span className="text-sm text-white/70">/{t('subscription.monthly')}</span>
                </div>
                <div className="text-sm text-white/70">
                  eller 110 kr/år ({t('subscription.save')})
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <Button 
                  onClick={() => handleUpgrade('monthly')}
                  disabled={loading}
                  className="w-full bg-white text-primary hover:bg-white/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('subscription.upgradeNow')} - {t('subscription.monthly')}
                </Button>
                <Button 
                  onClick={() => handleUpgrade('yearly')}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {t('subscription.upgradeNow')} - {t('subscription.yearly')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};