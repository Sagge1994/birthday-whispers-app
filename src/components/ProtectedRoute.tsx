import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-background to-pastel-blue flex items-center justify-center">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎂</div>
            <div className="text-xl font-semibold mb-2">Laddar...</div>
            <div className="text-muted-foreground">Förbereder din födelsedagsapp</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};