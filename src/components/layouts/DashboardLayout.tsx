import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User as UserIcon, Settings, Briefcase, Users, FileText, Send, PlusCircle,
  LogOut, ChevronLeft, ChevronRight, Home, Eye, Menu, X, BookmarkCheck, Building2,
  ChevronDown, ChevronUp, MessageCircle, Mail, Link2, Newspaper, Wrench
} from 'lucide-react';
import { profileService } from '@/features/profiles/services/profileService';
import { userService } from '@/features/users/services/userService';
import { invitationService } from '@/features/users/services/invitationService';
import { applicationService } from '@/features/applications/services/applicationService';
import { getUploadsUrl } from '@/lib/utils';
import { Profile, User } from '@/types';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ishLogo from '@/assets/images/ish-logo.PNG';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  path: string;
  badge?: number;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    labelKey: 'main',
    items: [
      { icon: Home, labelKey: 'dashboard', path: '/dashboard' },
      { icon: UserIcon, labelKey: 'myProfile', path: '/profile' },
      { icon: MessageCircle, labelKey: 'messages', path: '/chat' },
      { icon: Mail, labelKey: 'invitations', path: '/invitations' },
      { icon: Users, labelKey: 'employees', path: '/employees' },
    ],
    defaultOpen: true,
  },
  {
    labelKey: 'jobs',
    items: [
      { icon: Briefcase, labelKey: 'browseJobs', path: '/jobs' },
      { icon: BookmarkCheck, labelKey: 'savedJobs', path: '/jobs/saved' },
      { icon: PlusCircle, labelKey: 'postJob', path: '/jobs/create' },
      { icon: FileText, labelKey: 'myJobs', path: '/jobs/my' },
    ],
    defaultOpen: true,
  },
  {
    labelKey: 'services',
    items: [
      { icon: Wrench, labelKey: 'browseServices', path: '/services' },
      { icon: PlusCircle, labelKey: 'postService', path: '/services/create' },
      { icon: FileText, labelKey: 'myServices', path: '/services/my' },
    ],
    defaultOpen: true,
  },
  {
    labelKey: 'posts',
    items: [
      { icon: Newspaper, labelKey: 'browsePosts', path: '/posts' },
      { icon: PlusCircle, labelKey: 'createPost', path: '/posts/create' },
      { icon: FileText, labelKey: 'myPosts', path: '/posts/my' },
    ],
    defaultOpen: true,
  },
  {
    labelKey: 'applications',
    items: [
      { icon: Send, labelKey: 'myApplications', path: '/applications' },
    ],
    defaultOpen: true,
  },
  {
    labelKey: 'companies',
    items: [
      { icon: Building2, labelKey: 'myCompanies', path: '/companies' },
    ],
    defaultOpen: true,
  },
];

const settingsNavItems: NavItem[] = [
  { icon: Settings, labelKey: 'profileSettings', path: '/profile/settings' },
  { icon: Eye, labelKey: 'visibility', path: '/profile/settings?tab=visibility' },
  { icon: FileText, labelKey: 'myCv', path: '/profile/settings?tab=cv' },
];

export function DashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(navGroups.filter(g => g.defaultOpen).map(g => g.labelKey))
  );
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [invitationPendingCount, setInvitationPendingCount] = useState(0);
  const [jobApplicationPendingCount, setJobApplicationPendingCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const stats = await profileService.getDashboardStats();
      setMessageUnreadCount(stats.notifications ?? 0);
    } catch {
      // ignore: user may be logged out or stats unavailable
    }
  }, []);

  const loadInvitationCount = useCallback(async () => {
    try {
      const { items } = await invitationService.listReceived(0, 100);
      setInvitationPendingCount(items.filter((i) => i.status === 'pending').length);
    } catch {
      // ignore
    }
  }, []);

  const loadJobApplicationCount = useCallback(async () => {
    try {
      const count = await applicationService.getIncomingPendingCount();
      setJobApplicationPendingCount(count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  // Refetch when NOT on chat pages (initial load + when leaving Messages)
  const isOnChatSection = location.pathname === '/chat' || location.pathname.startsWith('/chat/');
  useEffect(() => {
    if (isOnChatSection) return;
    loadUnreadCount();
  }, [location.pathname, isOnChatSection, loadUnreadCount]);

  useEffect(() => {
    loadInvitationCount();
    loadJobApplicationCount();
  }, [location.pathname, loadInvitationCount, loadJobApplicationCount]);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadInvitationCount();
      loadJobApplicationCount();
    }, 30000);
    return () => window.clearInterval(id);
  }, [loadInvitationCount, loadJobApplicationCount]);

  // Refetch when user opens a chat and marks as read (so badge updates immediately)
  useEffect(() => {
    const handler = () => loadUnreadCount();
    window.addEventListener('ish:refresh-message-unread', handler);
    return () => window.removeEventListener('ish:refresh-message-unread', handler);
  }, [loadUnreadCount]);

  useEffect(() => {
    const handler = () => loadInvitationCount();
    window.addEventListener('ish:refresh-invitation-unread', handler);
    return () => window.removeEventListener('ish:refresh-invitation-unread', handler);
  }, [loadInvitationCount]);

  useEffect(() => {
    const handler = () => loadJobApplicationCount();
    window.addEventListener('ish:refresh-job-application-unread', handler);
    return () => window.removeEventListener('ish:refresh-job-application-unread', handler);
  }, [loadJobApplicationCount]);

  // Refetch profile when avatar (or profile) is updated elsewhere (e.g. profile/settings)
  useEffect(() => {
    const handler = () => loadProfile();
    window.addEventListener('ish:profile-updated', handler);
    return () => window.removeEventListener('ish:profile-updated', handler);
  }, []);

  const loadProfile = async () => {
    try {
      const [profileData, userData] = await Promise.all([
        profileService.getCurrentProfile(),
        userService.getCurrentUser(),
      ]);
      setProfile(profileData);
      setCurrentUser(userData);
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

  const toggleGroup = (groupLabelKey: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupLabelKey)) {
        newSet.delete(groupLabelKey);
      } else {
        newSet.add(groupLabelKey);
      }
      return newSet;
    });
  };

  const isActiveRoute = (path: string) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    // Handle query parameters
    if (path.includes('?')) {
      return currentPath + currentSearch === path;
    }
    
    // Exact match
    if (currentPath === path) {
      return true;
    }
    
    // Check if current path starts with this path + '/'
    const pathWithSlash = path + '/';
    if (currentPath.startsWith(pathWithSlash)) {
      // Get all nav items to check for more specific matches
      const allNavItems = navGroups.flatMap(g => g.items).concat(settingsNavItems);
      
      // Check if there's a more specific route that also matches
      const hasMoreSpecificMatch = allNavItems.some(item => {
        const itemPath = item.path.split('?')[0]; // Remove query params
        if (itemPath === path) return false; // Don't compare with itself
        if (itemPath.length <= path.length) return false; // Not more specific
        
        // Check if the more specific path matches current path
        return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
      });
      
      // Only activate if there's no more specific matching route
      return !hasMoreSpecificMatch;
    }
    
    return false;
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
            <img src={ishLogo} alt="ISH" className="h-9 w-auto object-contain rounded-lg" />
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
          fixed top-0 left-0 z-40 h-screen flex flex-col bg-white border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-slate-200">
          <Link to="/" className="flex items-center space-x-3">
            <img src={ishLogo} alt="ISH" className="h-10 w-auto object-contain flex-shrink-0 rounded-lg" />
            {sidebarOpen && (
              <div className="flex flex-col justify-center min-w-0 leading-tight">
                <span className="text-lg font-bold text-slate-900">ISH</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                  {t('nav.tagline')}
                </span>
              </div>
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

        {/* Language + Profile */}
        <div className={`flex-shrink-0 p-4 ${sidebarOpen ? 'px-4' : 'px-2'} flex flex-col gap-2`}>
          <div className={!sidebarOpen ? 'flex justify-center' : ''}>
            <LanguageSwitcher variant="sidebar" />
          </div>
          {profile && (
            <Link
              to="/profile"
              className={`
                flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100
                hover:from-blue-50 hover:to-blue-100 transition-all group
                ${!sidebarOpen && 'justify-center'}
              `}
            >
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={getUploadsUrl(profile.avatar)}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {profile.fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {profile.title || t('dashboard.sidebar.addYourTitle')}
                  </p>
                </div>
              )}
            </Link>
          )}
        </div>

        {/* Navigation — scrollable when content overflows */}
        <nav className="flex-1 min-h-0 px-3 py-2 space-y-1 overflow-y-auto">
          {/* Navigation Groups */}
          {navGroups.map((group) => {
            const isGroupOpen = openGroups.has(group.labelKey);
            const hasActiveItem = group.items.some(item => isActiveRoute(item.path));
            
            return (
              <div key={group.labelKey} className="space-y-1">
                {sidebarOpen ? (
                  <button
                    onClick={() => toggleGroup(group.labelKey)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider
                      hover:text-slate-600 transition-colors
                      ${hasActiveItem ? 'text-slate-600' : ''}
                    `}
                  >
                    <span>{t(`dashboard.sidebar.${group.labelKey}`)}</span>
                    {isGroupOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                ) : (
                  <div className="px-3 py-2">
                    <div className="h-px bg-slate-200"></div>
                  </div>
                )}
                
                {isGroupOpen && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const displayItem = item.path === '/chat'
                        ? { ...item, badge: messageUnreadCount > 0 ? messageUnreadCount : undefined }
                        : item.path === '/invitations'
                        ? { ...item, badge: invitationPendingCount > 0 ? invitationPendingCount : undefined }
                        : item.path === '/jobs/my'
                        ? { ...item, badge: jobApplicationPendingCount > 0 ? jobApplicationPendingCount : undefined }
                        : item;
                      const Icon = displayItem.icon;
                      const isActive = isActiveRoute(displayItem.path);
                      const itemLabel = t(`dashboard.sidebar.${displayItem.labelKey}`);
                      return (
                        <Link
                          key={displayItem.path}
                          to={displayItem.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all
                            ${isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }
                            ${!sidebarOpen && 'justify-center'}
                          `}
                          title={!sidebarOpen ? itemLabel : undefined}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {sidebarOpen && (
                            <span className="font-medium">{itemLabel}</span>
                          )}
                          {displayItem.badge != null && displayItem.badge > 0 && sidebarOpen && (
                            <span className="ml-auto bg-red-500 text-white text-xs min-w-[1.25rem] px-2 py-0.5 rounded-full text-center">
                              {displayItem.badge > 99 ? '99+' : displayItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Settings Navigation */}
          <div className="pt-4 mt-4 border-t border-slate-200 space-y-1">
            {sidebarOpen && (
              <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t('dashboard.sidebar.settings')}
              </p>
            )}
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              const itemLabel = t(`dashboard.sidebar.${item.labelKey}`);
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
                  title={!sidebarOpen ? itemLabel : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium">{itemLabel}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className={`
              flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl
              text-red-600 hover:bg-red-50 transition-all
              ${!sidebarOpen && 'justify-center'}
            `}
            title={!sidebarOpen ? t('dashboard.sidebar.logout') : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">{t('dashboard.sidebar.logout')}</span>}
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
        {/* Telegram link banner — show when user is logged in but has not linked Telegram */}
        {currentUser && !currentUser.telegramId && (
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
            <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-white/95">
                    {t('dashboard.telegramBanner.message')}
                  </p>
                </div>
                <Link
                  to="/profile/settings?tab=account"
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                >
                  {t('dashboard.telegramBanner.cta')}
                </Link>
              </div>
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
