import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-pastel-lavender/50"
      >
        <span className="mr-2">{currentLanguage.flag}</span>
        {currentLanguage.name}
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 min-w-[200px] bg-background/95 backdrop-blur-sm border-primary/20 shadow-card">
          <CardContent className="p-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                variant="ghost"
                className="w-full justify-start h-auto py-3 px-4"
              >
                <span className="mr-3 text-lg">{language.flag}</span>
                <span className="flex-1 text-left">{language.name}</span>
                {i18n.language === language.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};