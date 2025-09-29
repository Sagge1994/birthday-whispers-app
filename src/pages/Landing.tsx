import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Bell, Users, Sparkles, Heart, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Landing = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Calendar,
      title: t('features.calendar.title'),
      description: t('features.calendar.description'),
      color: "bg-pastel-peach"
    },
    {
      icon: Users,
      title: t('features.import.title'),
      description: t('features.import.description'),
      color: "bg-pastel-mint"
    },
    {
      icon: Sparkles,
      title: t('features.ai.title'),
      description: t('features.ai.description'),
      color: "bg-pastel-lavender"
    },
    {
      icon: MessageSquare,
      title: t('features.sms.title'),
      description: t('features.sms.description'),
      color: "bg-pastel-blue"
    },
    {
      icon: Bell,
      title: t('features.notifications.title'),
      description: t('features.notifications.description'),
      color: "bg-pastel-pink"
    },
    {
      icon: Heart,
      title: t('features.neverMiss.title'),
      description: t('features.neverMiss.description'),
      color: "bg-gradient-accent"
    }
  ];

  const steps = [
    { step: "1", title: t('howItWorks.step1.title'), description: t('howItWorks.step1.description') },
    { step: "2", title: t('howItWorks.step2.title'), description: t('howItWorks.step2.description') },
    { step: "3", title: t('howItWorks.step3.title'), description: t('howItWorks.step3.description') },
    { step: "4", title: t('howItWorks.step4.title'), description: t('howItWorks.step4.description') }
  ];

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pastel-pink/20 to-pastel-lavender/30">
      <LanguageSwitcher />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-accent text-accent-foreground border-0 px-4 py-2">
            {t('hero.badge')}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
            {t('hero.title')}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              asChild
              size="lg" 
              className="bg-gradient-primary hover:shadow-soft text-lg px-8 py-6 transform hover:scale-105 transition-all duration-300"
            >
              <Link to="/auth">
                {t('hero.getStarted')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={scrollToFeatures}
              className="border-primary/20 hover:bg-pastel-lavender/50 text-lg px-8 py-6 transition-all duration-300"
            >
              {t('hero.viewFeatures')}
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{t('stats.freeTrial')}</div>
              <div className="text-sm text-muted-foreground">{t('stats.freeTrialText')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{t('stats.setupTime')}</div>
              <div className="text-sm text-muted-foreground">{t('stats.setupTimeText')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{t('stats.birthdays')}</div>
              <div className="text-sm text-muted-foreground">{t('stats.birthdaysText')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden group"
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('howItWorks.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-card border-0 shadow-card max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-6">🎈</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-primary hover:shadow-soft text-lg px-8 py-6"
              >
                <Link to="/auth">
                  {t('cta.startJourney')}
                  <Heart className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {t('cta.noCard')}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {t('cta.freeTrial')}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {t('cta.quickSetup')}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            {t('footer.madeWith')} <Heart className="w-4 h-4 inline text-red-500" /> {t('footer.toHelp')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;