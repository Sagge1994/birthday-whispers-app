import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  sv: {
    translation: {
      // Hero Section
      "hero.badge": "🎂 Missa aldrig en födelsedag igen",
      "hero.title": "Kom ihåg varje\nspeciellt ögonblick",
      "hero.description": "En vacker och intuitiv app som hjälper dig att komma ihåg födelsedagar, skicka personliga meddelanden och stärka dina relationer med de människor som betyder mest.",
      "hero.getStarted": "Kom igång gratis",
      "hero.viewFeatures": "Se funktioner",
      
      // Stats
      "stats.freeTrial": "1 månad",
      "stats.freeTrialText": "Gratis provperiod",
      "stats.setupTime": "2 min",
      "stats.setupTimeText": "Installationstid",
      "stats.birthdays": "∞",
      "stats.birthdaysText": "Födelsedagar",
      
      // Features
      "features.title": "Allt du behöver",
      "features.subtitle": "Genomtänkta funktioner som gör det enkelt och meningsfullt att komma ihåg födelsedagar",
      "features.calendar.title": "Smart kalendervy",
      "features.calendar.description": "Visualisera alla födelsedagar i ett vackert kalendergränssnitt. Klicka på vilket datum som helst för att se vem som firar eller lägg till nya födelsedagar direkt.",
      "features.import.title": "Importera kontakter",
      "features.import.description": "Importera automatiskt kontakter från din telefon. Vi hittar de med födelsedagar och låter dig välja vilka du vill lägga till.",
      "features.ai.title": "AI-drivna meddelanden",
      "features.ai.description": "Generera personliga födelsedagsmeddelanden med AI. Varje meddelande är skräddarsytt för personen och känns genuint hjärtligt.",
      "features.sms.title": "SMS med ett klick",
      "features.sms.description": "Skicka födelsedagsönskningar direkt via SMS med förfyllda personliga meddelanden. Glöm aldrig att höra av dig igen.",
      "features.notifications.title": "Smarta notifikationer",
      "features.notifications.description": "Få påminnelser i tid på din telefon. Välj när du vill bli påmind - samma dag, dagen innan eller till och med en vecka i förväg.",
      "features.neverMiss.title": "Missa aldrig en födelsedag",
      "features.neverMiss.description": "Genomtänkt design som hjälper dig att upprätthålla meningsfulla relationer genom att komma ihåg de datum som betyder mest.",
      
      // How it works
      "howItWorks.title": "Så fungerar det",
      "howItWorks.subtitle": "Kom igång på några minuter med vår enkla 4-stegs process",
      "howItWorks.step1.title": "Lägg till dina nära och kära",
      "howItWorks.step1.description": "Importera från kontakter eller lägg till manuellt",
      "howItWorks.step2.title": "Anpassa meddelanden",
      "howItWorks.step2.description": "Använd AI-förslag eller skriv egna",
      "howItWorks.step3.title": "Ställ in påminnelser",
      "howItWorks.step3.description": "Välj när du vill bli påmind",
      "howItWorks.step4.title": "Glöm aldrig igen",
      "howItWorks.step4.description": "Bli påmind och skicka önskningar med ett tryck",
      
      // CTA Section
      "cta.title": "Redo att aldrig glömma igen?",
      "cta.description": "Gå med tusentals människor som har förvandlat sina relationer genom att komma ihåg det som betyder mest. Börja bygga starkare kontakter idag.",
      "cta.startJourney": "Starta din resa",
      "cta.noCard": "Inget kreditkort krävs",
      "cta.freeTrial": "1 månad gratis",
      "cta.quickSetup": "2-minuters setup",
      
      // Footer
      "footer.madeWith": "Gjord med",
      "footer.toHelp": "för att hjälpa dig att hålla kontakten",
      
      // Auth
      "auth.login": "Logga in",
      "auth.signup": "Skapa konto",
      "auth.email": "E-post",
      "auth.password": "Lösenord",
      "auth.confirmPassword": "Bekräfta lösenord",
      "auth.loginButton": "Logga in",
      "auth.signupButton": "Skapa konto",
      "auth.switchToSignup": "Har du inget konto? Skapa ett",
      "auth.switchToLogin": "Har du redan ett konto? Logga in",
      "auth.signingIn": "Loggar in...",
      "auth.creatingAccount": "Skapar konto...",
      
      // Navigation
      "nav.backToHome": "Tillbaka till startsidan"
    }
  },
  en: {
    translation: {
      // Hero Section
      "hero.badge": "🎂 Never Miss a Birthday Again",
      "hero.title": "Remember Every\nSpecial Moment",
      "hero.description": "A beautiful and intuitive app that helps you remember birthdays, send personalized messages, and strengthen your relationships with the people who matter most.",
      "hero.getStarted": "Get Started Free",
      "hero.viewFeatures": "View Features",
      
      // Stats
      "stats.freeTrial": "1 month",
      "stats.freeTrialText": "Free Trial",
      "stats.setupTime": "2 min",
      "stats.setupTimeText": "Setup Time",
      "stats.birthdays": "∞",
      "stats.birthdaysText": "Birthdays",
      
      // Features
      "features.title": "Everything You Need",
      "features.subtitle": "Thoughtfully designed features that make remembering birthdays effortless and meaningful",
      "features.calendar.title": "Smart Calendar View",
      "features.calendar.description": "Visualize all birthdays in a beautiful calendar interface. Click on any date to see who's celebrating or add new birthdays instantly.",
      "features.import.title": "Import Contacts",
      "features.import.description": "Automatically import contacts from your phone. We'll find the ones with birthdays and let you choose which to add.",
      "features.ai.title": "AI-Powered Messages",
      "features.ai.description": "Generate personalized birthday messages using AI. Each message is tailored to the person and feels genuinely heartfelt.",
      "features.sms.title": "One-Click SMS",
      "features.sms.description": "Send birthday wishes directly through SMS with pre-filled personalized messages. Never forget to reach out again.",
      "features.notifications.title": "Smart Notifications",
      "features.notifications.description": "Get timely reminders on your phone. Choose when to be notified - same day, day before, or even a week in advance.",
      "features.neverMiss.title": "Never Miss a Birthday",
      "features.neverMiss.description": "Thoughtful design that helps you maintain meaningful relationships by remembering the dates that matter most.",
      
      // How it works
      "howItWorks.title": "How It Works",
      "howItWorks.subtitle": "Get started in minutes with our simple 4-step process",
      "howItWorks.step1.title": "Add Your Loved Ones",
      "howItWorks.step1.description": "Import from contacts or add manually",
      "howItWorks.step2.title": "Customize Messages",
      "howItWorks.step2.description": "Use AI suggestions or write your own",
      "howItWorks.step3.title": "Set Reminders",
      "howItWorks.step3.description": "Choose when you want to be notified",
      "howItWorks.step4.title": "Never Forget Again",
      "howItWorks.step4.description": "Get notified and send wishes with one tap",
      
      // CTA Section
      "cta.title": "Ready to Never Forget Again?",
      "cta.description": "Join thousands of people who've transformed their relationships by remembering what matters most. Start building stronger connections today.",
      "cta.startJourney": "Start Your Journey",
      "cta.noCard": "No credit card required",
      "cta.freeTrial": "1 month free trial",
      "cta.quickSetup": "2-minute setup",
      
      // Footer
      "footer.madeWith": "Made with",
      "footer.toHelp": "to help you stay connected",
      
      // Auth
      "auth.login": "Login",
      "auth.signup": "Sign Up",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.loginButton": "Login",
      "auth.signupButton": "Create Account",
      "auth.switchToSignup": "Don't have an account? Sign up",
      "auth.switchToLogin": "Already have an account? Login",
      "auth.signingIn": "Signing in...",
      "auth.creatingAccount": "Creating account...",
      
      // Navigation
      "nav.backToHome": "Back to Home"
    }
  },
  es: {
    translation: {
      // Hero Section
      "hero.badge": "🎂 Nunca más pierdas un cumpleaños",
      "hero.title": "Recuerda cada\nmomento especial",
      "hero.description": "Una aplicación hermosa e intuitiva que te ayuda a recordar cumpleaños, enviar mensajes personalizados y fortalecer tus relaciones con las personas que más importan.",
      "hero.getStarted": "Comenzar gratis",
      "hero.viewFeatures": "Ver características",
      
      // Stats
      "stats.freeTrial": "1 mes",
      "stats.freeTrialText": "Prueba gratuita",
      "stats.setupTime": "2 min",
      "stats.setupTimeText": "Tiempo de configuración",
      "stats.birthdays": "∞",
      "stats.birthdaysText": "Cumpleaños",
      
      // Features
      "features.title": "Todo lo que necesitas",
      "features.subtitle": "Características cuidadosamente diseñadas que hacen que recordar cumpleaños sea fácil y significativo",
      "features.calendar.title": "Vista de calendario inteligente",
      "features.calendar.description": "Visualiza todos los cumpleaños en una hermosa interfaz de calendario. Haz clic en cualquier fecha para ver quién celebra o agregar nuevos cumpleaños al instante.",
      "features.import.title": "Importar contactos",
      "features.import.description": "Importa automáticamente contactos desde tu teléfono. Encontraremos los que tienen cumpleaños y te dejaremos elegir cuáles agregar.",
      "features.ai.title": "Mensajes con IA",
      "features.ai.description": "Genera mensajes de cumpleaños personalizados usando IA. Cada mensaje está adaptado a la persona y se siente genuinamente sincero.",
      "features.sms.title": "SMS con un clic",
      "features.sms.description": "Envía deseos de cumpleaños directamente por SMS con mensajes personalizados prellenados. Nunca olvides comunicarte de nuevo.",
      "features.notifications.title": "Notificaciones inteligentes",
      "features.notifications.description": "Recibe recordatorios oportunos en tu teléfono. Elige cuándo ser notificado: el mismo día, el día anterior o incluso una semana antes.",
      "features.neverMiss.title": "Nunca pierdas un cumpleaños",
      "features.neverMiss.description": "Diseño reflexivo que te ayuda a mantener relaciones significativas recordando las fechas que más importan.",
      
      // How it works
      "howItWorks.title": "Cómo funciona",
      "howItWorks.subtitle": "Comienza en minutos con nuestro simple proceso de 4 pasos",
      "howItWorks.step1.title": "Agrega a tus seres queridos",
      "howItWorks.step1.description": "Importa desde contactos o agrega manualmente",
      "howItWorks.step2.title": "Personaliza mensajes",
      "howItWorks.step2.description": "Usa sugerencias de IA o escribe los tuyos",
      "howItWorks.step3.title": "Configura recordatorios",
      "howItWorks.step3.description": "Elige cuándo quieres ser notificado",
      "howItWorks.step4.title": "Nunca olvides de nuevo",
      "howItWorks.step4.description": "Recibe notificaciones y envía deseos con un toque",
      
      // CTA Section
      "cta.title": "¿Listo para nunca olvidar de nuevo?",
      "cta.description": "Únete a miles de personas que han transformado sus relaciones recordando lo que más importa. Comienza a construir conexiones más fuertes hoy.",
      "cta.startJourney": "Comienza tu viaje",
      "cta.noCard": "No se requiere tarjeta de crédito",
      "cta.freeTrial": "Prueba gratuita de 1 mes",
      "cta.quickSetup": "Configuración de 2 minutos",
      
      // Footer
      "footer.madeWith": "Hecho con",
      "footer.toHelp": "para ayudarte a mantenerte conectado",
      
      // Auth
      "auth.login": "Iniciar sesión",
      "auth.signup": "Registrarse",
      "auth.email": "Correo electrónico",
      "auth.password": "Contraseña",
      "auth.confirmPassword": "Confirmar contraseña",
      "auth.loginButton": "Iniciar sesión",
      "auth.signupButton": "Crear cuenta",
      "auth.switchToSignup": "¿No tienes cuenta? Regístrate",
      "auth.switchToLogin": "¿Ya tienes cuenta? Inicia sesión",
      "auth.signingIn": "Iniciando sesión...",
      "auth.creatingAccount": "Creando cuenta...",
      
      // Navigation
      "nav.backToHome": "Volver al inicio"
    }
  },
  fr: {
    translation: {
      // Hero Section
      "hero.badge": "🎂 Ne ratez plus jamais un anniversaire",
      "hero.title": "Souvenez-vous de chaque\nmoment spécial",
      "hero.description": "Une application belle et intuitive qui vous aide à vous souvenir des anniversaires, envoyer des messages personnalisés et renforcer vos relations avec les personnes qui comptent le plus.",
      "hero.getStarted": "Commencer gratuitement",
      "hero.viewFeatures": "Voir les fonctionnalités",
      
      // Stats  
      "stats.freeTrial": "1 mois",
      "stats.freeTrialText": "Essai gratuit",
      "stats.setupTime": "2 min",
      "stats.setupTimeText": "Temps d'installation",
      "stats.birthdays": "∞",
      "stats.birthdaysText": "Anniversaires",
      
      // Features
      "features.title": "Tout ce dont vous avez besoin",
      "features.subtitle": "Fonctionnalités soigneusement conçues qui rendent la mémorisation des anniversaires facile et significative",
      "features.calendar.title": "Vue calendrier intelligente",
      "features.calendar.description": "Visualisez tous les anniversaires dans une belle interface de calendrier. Cliquez sur n'importe quelle date pour voir qui célèbre ou ajouter de nouveaux anniversaires instantanément.",
      "features.import.title": "Importer les contacts",
      "features.import.description": "Importez automatiquement les contacts depuis votre téléphone. Nous trouverons ceux avec des anniversaires et vous laisserons choisir lesquels ajouter.",
      "features.ai.title": "Messages alimentés par l'IA",
      "features.ai.description": "Générez des messages d'anniversaire personnalisés en utilisant l'IA. Chaque message est adapté à la personne et semble genuinement sincère.",
      "features.sms.title": "SMS en un clic",
      "features.sms.description": "Envoyez des vœux d'anniversaire directement par SMS avec des messages personnalisés pré-remplis. N'oubliez plus jamais de prendre contact.",
      "features.notifications.title": "Notifications intelligentes",
      "features.notifications.description": "Recevez des rappels opportuns sur votre téléphone. Choisissez quand être notifié - le jour même, la veille ou même une semaine à l'avance.",
      "features.neverMiss.title": "Ne ratez jamais un anniversaire",
      "features.neverMiss.description": "Design réfléchi qui vous aide à maintenir des relations significatives en vous souvenant des dates qui comptent le plus.",
      
      // How it works
      "howItWorks.title": "Comment ça marche",
      "howItWorks.subtitle": "Commencez en quelques minutes avec notre processus simple en 4 étapes",
      "howItWorks.step1.title": "Ajoutez vos proches",
      "howItWorks.step1.description": "Importez depuis les contacts ou ajoutez manuellement",
      "howItWorks.step2.title": "Personnalisez les messages",
      "howItWorks.step2.description": "Utilisez les suggestions IA ou écrivez les vôtres",
      "howItWorks.step3.title": "Configurez les rappels",
      "howItWorks.step3.description": "Choisissez quand vous voulez être notifié",
      "howItWorks.step4.title": "N'oubliez plus jamais",
      "howItWorks.step4.description": "Soyez notifié et envoyez des vœux d'un toucher",
      
      // CTA Section
      "cta.title": "Prêt à ne plus jamais oublier ?",
      "cta.description": "Rejoignez des milliers de personnes qui ont transformé leurs relations en se souvenant de ce qui compte le plus. Commencez à construire des connexions plus fortes aujourd'hui.",
      "cta.startJourney": "Commencez votre voyage",
      "cta.noCard": "Aucune carte de crédit requise",
      "cta.freeTrial": "Essai gratuit d'1 mois",
      "cta.quickSetup": "Configuration de 2 minutes",
      
      // Footer
      "footer.madeWith": "Fait avec",
      "footer.toHelp": "pour vous aider à rester connecté",
      
      // Auth
      "auth.login": "Se connecter",
      "auth.signup": "S'inscrire",
      "auth.email": "Email",
      "auth.password": "Mot de passe",
      "auth.confirmPassword": "Confirmer le mot de passe",
      "auth.loginButton": "Se connecter",
      "auth.signupButton": "Créer un compte",
      "auth.switchToSignup": "Pas de compte ? Inscrivez-vous",
      "auth.switchToLogin": "Déjà un compte ? Connectez-vous",
      "auth.signingIn": "Connexion en cours...",
      "auth.creatingAccount": "Création du compte...",
      
      // Navigation
      "nav.backToHome": "Retour à l'accueil"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'sv', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;