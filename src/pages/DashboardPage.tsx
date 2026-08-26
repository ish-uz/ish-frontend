import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase, Users, Eye, Bell, ChevronRight, Clock,
  Wrench, Newspaper, FileText, User as UserIcon, Zap, TrendingUp,
} from 'lucide-react';
import { profileService } from '@/features/profiles/services/profileService';
import { getUploadsUrl } from '@/lib/utils';
import { Profile } from '@/types';

interface StatCard {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  value: number | null;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}

interface QuickAction {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  descKey: string;
  color: 'blue' | 'violet' | 'emerald' | 'orange' | 'pink' | 'indigo';
}

interface DashboardStats {
  profileViews: number;
  jobsApplied: number;
  connections: number;
  notifications: number;
}

const statColorClasses = {
  blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
  violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
  amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
};

const quickActionColorClasses = {
  blue: { icon: 'bg-blue-100 text-blue-600', card: 'hover:border-blue-200 hover:shadow-blue-100/80' },
  violet: { icon: 'bg-violet-100 text-violet-600', card: 'hover:border-violet-200 hover:shadow-violet-100/80' },
  emerald: { icon: 'bg-emerald-100 text-emerald-600', card: 'hover:border-emerald-200 hover:shadow-emerald-100/80' },
  orange: { icon: 'bg-orange-100 text-orange-600', card: 'hover:border-orange-200 hover:shadow-orange-100/80' },
  pink: { icon: 'bg-pink-100 text-pink-600', card: 'hover:border-pink-200 hover:shadow-pink-100/80' },
  indigo: { icon: 'bg-indigo-100 text-indigo-600', card: 'hover:border-indigo-200 hover:shadow-indigo-100/80' },
};

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useCountUp(target: number | null, duration = 700, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (target == null || !enabled) {
      setValue(target ?? 0);
      return;
    }
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    const start = performance.now();
    setValue(0);

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, enabled]);

  return target == null ? null : value;
}

function AnimatedStatValue({ target }: { target: number | null }) {
  const value = useCountUp(target);
  if (value == null) return <>—</>;
  return <>{value}</>;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    loadProfileAndStats();
  }, []);

  useEffect(() => {
    if (loading) return;
    const id = requestAnimationFrame(() => setProgressReady(true));
    return () => cancelAnimationFrame(id);
  }, [loading]);

  const loadProfileAndStats = async () => {
    try {
      const profileData = await profileService.getCurrentProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
    try {
      setStatsError(false);
      const statsData = await profileService.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setStatsError(true);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    { path: '/jobs', icon: Briefcase, labelKey: 'browseJobs', descKey: 'quickActionJobsDesc', color: 'blue' },
    { path: '/employees', icon: Users, labelKey: 'findTalent', descKey: 'quickActionFindTalentDesc', color: 'violet' },
    { path: '/profile/settings', icon: UserIcon, labelKey: 'updateProfile', descKey: 'quickActionUpdateProfileDesc', color: 'emerald' },
    { path: '/services', icon: Wrench, labelKey: 'browseServices', descKey: 'quickActionServicesDesc', color: 'orange' },
    { path: '/posts', icon: Newspaper, labelKey: 'browsePosts', descKey: 'quickActionPostsDesc', color: 'pink' },
    { path: '/profile/settings?tab=cv', icon: FileText, labelKey: 'myCv', descKey: 'quickActionCvDesc', color: 'indigo' },
  ];

  const statCards: StatCard[] = [
    { icon: Eye, labelKey: 'profileViews', value: stats?.profileViews ?? null, color: 'blue' },
    { icon: Briefcase, labelKey: 'jobsApplied', value: stats?.jobsApplied ?? null, color: 'emerald' },
    { icon: Users, labelKey: 'connections', value: stats?.connections ?? null, color: 'violet' },
    { icon: Bell, labelKey: 'notifications', value: stats?.notifications ?? null, color: 'amber' },
  ];

  const recentActivity = [
    { messageKey: 'activityViewed' as const, timeKey: 'hoursAgo' as const, icon: Eye },
    { messageKey: 'activityApplication' as const, timeKey: 'dayAgo' as const, icon: Briefcase },
    { messageKey: 'activityStrength' as const, timeKey: 'daysAgo' as const, icon: TrendingUp },
  ];

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.fullName) score += 15;
    if (profile.city) score += 10;
    if (profile.title) score += 15;
    if (profile.bio && profile.bio.length > 20) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.experience && profile.experience.length > 0) score += 15;
    if (profile.education && profile.education.length > 0) score += 10;
    if (profile.cvFile) score += 5;
    return Math.min(score, 100);
  };

  const getQuickActionLabel = (labelKey: string) => {
    if (labelKey === 'browseServices' || labelKey === 'browsePosts' || labelKey === 'myCv') {
      return t(`dashboard.sidebar.${labelKey}`);
    }
    return t(`dashboard.${labelKey}`);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-40 bg-slate-200 rounded-2xl" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 motion-safe:[&_*]:will-change-auto">
      {/* Welcome */}
      <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          {t('dashboard.welcome', { name: profile?.fullName?.split(' ')[0] || t('dashboard.user') })}
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">{t('dashboard.welcomeSub')}</p>
      </div>

      {/* Profile banner + sidebar links */}
      <div className="grid lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '80ms' }}>
        {profileCompletion < 100 ? (
          <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-violet-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-blue-600/20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold mb-1">{t('dashboard.completeProfile')}</h2>
                <p className="text-blue-100 text-sm mb-4">{t('dashboard.completeProfileDesc')}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-blue-100">{t('dashboard.progress')}</span>
                    <span className="font-semibold tabular-nums">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-white/25 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-[width] duration-1000 ease-out-soft"
                      style={{ width: progressReady ? `${profileCompletion}%` : '0%' }}
                    />
                  </div>
                </div>
                <Link
                  to="/profile/settings"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {t('dashboard.completeNow')}
                </Link>
              </div>
              <div className="flex-shrink-0 self-center sm:self-auto">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-110 motion-safe:animate-soft-pulse" />
                  <div className="absolute inset-0 rounded-full border border-white/10 scale-125" />
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-white/20 ring-4 ring-white/30 flex items-center justify-center">
                    {profile?.avatar ? (
                      <img
                        src={getUploadsUrl(profile.avatar)}
                        alt={profile.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-10 w-10 text-white/80" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 ring-2 ring-emerald-100">
              {profile?.avatar ? (
                <img src={getUploadsUrl(profile.avatar)} alt={profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600">
                  <UserIcon className="h-7 w-7 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{profile?.fullName}</p>
              <p className="text-sm text-slate-500 truncate">{profile?.title || t('dashboard.sidebar.addYourTitle')}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">{t('dashboard.profileComplete')}</p>
            </div>
          </div>
        )}

        {/* Sidebar-style quick links */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {quickActions.slice(0, 3).map((action) => {
            const Icon = action.icon;
            const colors = quickActionColorClasses[action.color];
            return (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-3 p-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className={`p-2 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${colors.icon}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {getQuickActionLabel(action.labelKey)}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{t(`dashboard.${action.descKey}`)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 flex-shrink-0 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {statsError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between animate-fade-up">
          <p className="text-sm text-amber-800">{t('dashboard.statsError')}</p>
          <button
            type="button"
            onClick={() => loadProfileAndStats()}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
          >
            {t('dashboard.retry')}
          </button>
        </div>
      )}

      {/* Quick Actions grid */}
      <section className="animate-fade-up" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.quickActions')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colors = quickActionColorClasses[action.color];
            return (
              <Link
                key={action.path}
                to={action.path}
                style={{ animationDelay: `${200 + index * 50}ms` }}
                className={`group flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm
                  transition-all duration-200 ease-out-soft
                  hover:-translate-y-1 hover:shadow-md
                  active:translate-y-0 active:scale-[0.98]
                  animate-fade-up ${colors.card}`}
              >
                <div className={`p-3 rounded-2xl mb-3 transition-transform duration-200 group-hover:scale-110 ${colors.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {getQuickActionLabel(action.labelKey)}
                </p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-snug">
                  {t(`dashboard.${action.descKey}`)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: '280ms' }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.labelKey}
              style={{ animationDelay: `${300 + index * 60}ms` }}
              className="group bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm
                transition-all duration-200 ease-out-soft
                hover:-translate-y-1 hover:shadow-md hover:border-slate-300
                animate-fade-up"
            >
              <div className={`inline-flex p-2 rounded-xl mb-3 transition-colors duration-200 ${statColorClasses[stat.color]}`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                <AnimatedStatValue target={stat.value} />
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t(`dashboard.${stat.labelKey}`)}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity + Open to Work */}
      <div className="grid lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '360ms' }}>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">{t('dashboard.recentActivity')}</h2>
            <Link
              to="/notifications"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 group"
            >
              {t('dashboard.viewAll')}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-slate-100 rounded-xl flex-shrink-0">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">{t(`dashboard.${activity.messageKey}`)}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t(`dashboard.${activity.timeKey}`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {profile && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-900">{t('dashboard.openToWork')}</span>
              {profile.openToJobSeeker ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {t('dashboard.active')}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {t('dashboard.inactive')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {profile.openToJobSeeker ? t('dashboard.openToWorkDesc') : t('dashboard.openToWorkOff')}
            </p>
            <Link
              to="/profile/settings?tab=visibility"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
            >
              {t('dashboard.manageVisibility')}
            </Link>

            <div className="mt-5 pt-5 border-t border-slate-100 space-y-1">
              {quickActions.slice(3).map((action) => {
                const Icon = action.icon;
                const colors = quickActionColorClasses[action.color];
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${colors.icon}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                      {getQuickActionLabel(action.labelKey)}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
