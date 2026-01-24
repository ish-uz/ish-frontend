import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  User, Settings, Briefcase, Users, FileText, Send, PlusCircle,
  LogOut, ChevronLeft, ChevronRight, Home, Eye, Menu, X
} from 'lucide-react';
import { profileService } from '@/features/profiles/services/profileService';
import { Profile } from '@/types';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'My Profile', path: '/profile' },
  { icon: Briefcase, label: 'Browse Jobs', path: '/jobs' },
  { icon: PlusCircle, label: 'Post a Job', path: '/jobs/create' },
  { icon: FileText, label: 'My Jobs', path: '/jobs/my' },
  { icon: Send, label: 'My Applications', path: '/applications' },
  { icon: Users, label: 'Employees', path: '/employees' },
];

const settingsNavItems: NavItem[] = [
  { icon: Settings, label: 'Profile Settings', path: '/profile/settings' },
  { icon: Eye, label: 'Visibility', path: '/profile/settings?tab=visibility' },
  { icon: FileText, label: 'My CV', path: '/profile/settings?tab=cv' },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getCurrentProfile();
      setProfile(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActiveRoute = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
              ISH
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
              ISH
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-slate-900">ISH</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Profile Card */}
        {profile && (
          <div className={`p-4 ${sidebarOpen ? 'px-4' : 'px-2'}`}>
            <Link
              to="/profile"
              className={`
                flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100
                hover:from-blue-50 hover:to-blue-100 transition-all group
                ${!sidebarOpen && 'justify-center'}
              `}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <User className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {profile.fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {profile.title || 'Add your title'}
                  </p>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Menu
              </p>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : ''}`} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {item.badge && sidebarOpen && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings Navigation */}
          <div className="pt-4 mt-4 border-t border-slate-200 space-y-1">
            {sidebarOpen && (
              <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Settings
              </p>
            )}
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all
                    ${isActive
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className={`
              flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl
              text-red-600 hover:bg-red-50 transition-all
              ${!sidebarOpen && 'justify-center'}
            `}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 ease-in-out pt-16 lg:pt-0
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}
