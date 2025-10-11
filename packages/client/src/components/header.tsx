import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, RefreshCw, ArrowLeft, Target } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  onRefresh,
  isRefreshing = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getHeaderIcon = () => {
    if (location.pathname.includes('/evaluation')) {
      return <Target className="w-6 h-6 text-white" />;
    }
    return <Building2 className="w-6 h-6 text-white" />;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-8">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              {getHeaderIcon()}
            </div>
            <div>
              <h1 className="text-2xl text-left font-semibold text-stone-800 tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-stone-500 font-medium mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
            >
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
