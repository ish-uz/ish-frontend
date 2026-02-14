import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Briefcase, Users, Wrench, LogIn, UserPlus, Menu, X, User, LogOut } from 'lucide-react';
import { userService } from '@/features/users/services/userService';
import { User as UserType } from '@/types';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when token changes in same tab
    const handleTokenChange = () => {
      checkAuth();
    };
    
    window.addEventListener('tokenChanged', handleTokenChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChanged', handleTokenChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2] text-white font-bold text-xl">
              ISH
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900">ISH</span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                {t('nav.tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/jobs"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>{t('nav.search')}</span>
            </Link>
            <Link
              to="/jobs"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              <span>{t('nav.findJob')}</span>
            </Link>
            <Link
              to="/employees"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>{t('nav.employees')}</span>
            </Link>
            <Link
              to="/freelancers"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Wrench className="h-4 w-4" />
              <span>{t('nav.freelancers')}</span>
            </Link>
          </nav>

          {/* Desktop: Language + Auth */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            {loading ? (
              <div className="h-10 w-20 bg-gray-100 rounded animate-pulse"></div>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-[#0A66C2] transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-[#0A66C2] transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t('nav.login')}</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 rounded-full bg-[#0A66C2] px-4 py-2 text-white hover:bg-[#004182] transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t('nav.register')}</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#0A66C2] transition-colors"
            aria-label={t('common.menu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>{t('nav.search')}</span>
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                <span>{t('nav.findJob')}</span>
              </Link>
              <Link
                to="/employees"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>{t('nav.employees')}</span>
              </Link>
              <Link
                to="/freelancers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Wrench className="h-4 w-4" />
                <span>{t('nav.freelancers')}</span>
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
            <LanguageSwitcher className="px-4 py-2 md:hidden" />
                {loading ? (
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                ) : isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>{t('nav.login')}</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>{t('nav.register')}</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
