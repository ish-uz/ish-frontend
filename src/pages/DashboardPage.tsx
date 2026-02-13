import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, Eye, TrendingUp, Bell,
  ChevronRight, CheckCircle2, Clock
} from 'lucide-react';
import { profileService } from '@/features/profiles/services/profileService';
import { Profile } from '@/types';

interface StatCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  color: string;
}

interface DashboardStats {
  profileViews: number;
  jobsApplied: number;
  connections: number;
  notifications: number;
}

export function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileAndStats();
  }, []);

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

  const statCards: StatCard[] = [
    {
      icon: Eye,
      label: 'Profile Views',
      value: stats?.profileViews ?? '—',
      color: 'blue',
    },
    {
      icon: Briefcase,
      label: 'Jobs Applied',
      value: stats?.jobsApplied ?? '—',
      color: 'emerald',
    },
    {
      icon: Users,
      label: 'Connections',
      value: stats?.connections ?? '—',
      color: 'violet',
    },
    {
      icon: Bell,
      label: 'Notifications',
      value: stats?.notifications ?? '—',
      color: 'amber',
    },
  ];

  const recentActivity = [
    { 
      type: 'view',
      message: 'Your profile was viewed by a recruiter',
      time: '2 hours ago',
      icon: Eye
    },
    { 
      type: 'application',
      message: 'Your application for Senior Developer was reviewed',
      time: '1 day ago',
      icon: Briefcase
    },
    { 
      type: 'profile',
      message: 'Profile strength increased to 85%',
      time: '3 days ago',
      icon: TrendingUp
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate profile completion percentage
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

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Welcome back, {profile?.fullName?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-slate-600 mt-1">
          Here's what's happening with your profile today.
        </p>
      </div>

      {/* Profile Completion Banner */}
      {profileCompletion < 100 && (
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Complete your profile</h2>
              <p className="text-blue-100 text-sm">
                A complete profile gets 3x more visibility from employers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 lg:w-48">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
              <Link
                to="/profile/settings"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Complete Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats error banner */}
      {statsError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-amber-800">Не удалось загрузить статистику.</p>
          <button
            type="button"
            onClick={() => loadProfileAndStats()}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`
                  p-2.5 rounded-xl transition-colors
                  ${stat.color === 'blue' && 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}
                  ${stat.color === 'emerald' && 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}
                  ${stat.color === 'violet' && 'bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'}
                  ${stat.color === 'amber' && 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                {stat.change && (
                  <span className={`
                    text-xs font-medium px-2 py-1 rounded-full
                    ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                  `}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <Link 
              to="/notifications"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-start space-x-4"
                >
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <Link
              to="/jobs"
              className="flex items-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <Briefcase className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
              <span className="font-medium">Browse Jobs</span>
              <ChevronRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-blue-600" />
            </Link>
            <Link
              to="/employees"
              className="flex items-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <Users className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
              <span className="font-medium">Find Talent</span>
              <ChevronRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-blue-600" />
            </Link>
            <Link
              to="/profile/settings"
              className="flex items-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <CheckCircle2 className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
              <span className="font-medium">Update Profile</span>
              <ChevronRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-blue-600" />
            </Link>
          </div>

          {/* Open To Work Status */}
          {profile && (
            <div className="p-4 border-t border-slate-200">
              <div className={`
                p-4 rounded-xl
                ${profile.openToJobSeeker 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : 'bg-slate-50 border border-slate-200'
                }
              `}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Open To Work</span>
                  {profile.openToJobSeeker ? (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {profile.openToJobSeeker 
                    ? 'Employers can find you on the Employees page'
                    : 'Turn on to be visible to employers'
                  }
                </p>
                <Link
                  to="/profile/settings?tab=visibility"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                >
                  Manage visibility →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
