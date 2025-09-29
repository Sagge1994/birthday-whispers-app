import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Bell, Users, Sparkles, Heart, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Calendar View",
      description: "Visualize all birthdays in a beautiful calendar interface. Click on any date to see who's celebrating or add new birthdays instantly.",
      color: "bg-pastel-peach"
    },
    {
      icon: Users,
      title: "Import Contacts",
      description: "Automatically import contacts from your phone. We'll find the ones with birthdays and let you choose which to add.",
      color: "bg-pastel-mint"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Messages",
      description: "Generate personalized birthday messages using AI. Each message is tailored to the person and feels genuinely heartfelt.",
      color: "bg-pastel-lavender"
    },
    {
      icon: MessageSquare,
      title: "One-Click SMS",
      description: "Send birthday wishes directly through SMS with pre-filled personalized messages. Never forget to reach out again.",
      color: "bg-pastel-blue"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get timely reminders on your phone. Choose when to be notified - same day, day before, or even a week in advance.",
      color: "bg-pastel-pink"
    },
    {
      icon: Heart,
      title: "Never Miss a Birthday",
      description: "Thoughtful design that helps you maintain meaningful relationships by remembering the dates that matter most.",
      color: "bg-gradient-accent"
    }
  ];

  const steps = [
    { step: "1", title: "Add Your Loved Ones", description: "Import from contacts or add manually" },
    { step: "2", title: "Customize Messages", description: "Use AI suggestions or write your own" },
    { step: "3", title: "Set Reminders", description: "Choose when you want to be notified" },
    { step: "4", title: "Never Forget Again", description: "Get notified and send wishes with one tap" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pastel-pink/20 to-pastel-lavender/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-accent text-accent-foreground border-0 px-4 py-2">
            🎂 Never Miss a Birthday Again
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
            Remember Every 
            <br />
            Special Moment
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A beautiful and intuitive app that helps you remember birthdays, send personalized messages, 
            and strengthen your relationships with the people who matter most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              asChild
              size="lg" 
              className="bg-gradient-primary hover:shadow-soft text-lg px-8 py-6 transform hover:scale-105 transition-all duration-300"
            >
              <Link to="/dashboard">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/20 hover:bg-pastel-lavender/50 text-lg px-8 py-6 transition-all duration-300"
            >
              View Features
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Free to Use</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2 min</div>
              <div className="text-sm text-muted-foreground">Setup Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Birthdays</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thoughtfully designed features that make remembering birthdays effortless and meaningful
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
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Get started in minutes with our simple 4-step process
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
              Ready to Never Forget Again?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of people who've transformed their relationships by remembering 
              what matters most. Start building stronger connections today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-primary hover:shadow-soft text-lg px-8 py-6"
              >
                <Link to="/dashboard">
                  Start Your Journey
                  <Heart className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                100% free forever
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                2-minute setup
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Made with <Heart className="w-4 h-4 inline text-red-500" /> to help you stay connected
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;