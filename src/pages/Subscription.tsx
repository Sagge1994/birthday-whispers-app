import { SubscriptionManager } from "@/components/SubscriptionManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Subscription = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-background to-pastel-blue">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('dashboard.backToDashboard')}
            </Button>
          </Link>
        </div>
        
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default Subscription;