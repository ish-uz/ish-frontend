import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileService } from '../services/profileService';
import { userService } from '@/features/users/services/userService';
import { getUploadsUrl } from '@/lib/utils';
import { Profile, Experience, Education } from '@/types';
import { 
  Settings, User, Briefcase, GraduationCap, FileText, 
  Eye, Save, Plus, X, Trash2, Upload, CheckCircle2, ChevronDown, Link2
} from 'lucide-react';
import { authService } from '@/features/auth/services/authService';
import { TELEGRAM_BOT_URL_LINK } from '@/constants';

type TabType = 'basic' | 'skills' | 'experience' | 'education' | 'cv' | 'visibility' | 'account';

export function ProfileSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get initial tab from URL query parameter
  const getInitialTab = (): TabType => {
    const tabParam = searchParams.get('tab');
    const validTabs: TabType[] = ['basic', 'skills', 'experience', 'education', 'cv', 'visibility', 'account'];
    if (tabParam && validTabs.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    return 'basic';
  };
  
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [basicData, setBasicData] = useState({
    fullName: '',
    city: '',
    title: '',
    bio: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);

  // Telegram link (account tab)
  const [telegramCode, setTelegramCode] = useState('');
  const [telegramLinking, setTelegramLinking] = useState(false);
  const [telegramLinkError, setTelegramLinkError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ telegramId?: string | null } | null>(null);

  // Update tab from URL when it changes
  useEffect(() => {
    const tabFromUrl = getInitialTab();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'account') {
      userService.getCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null));
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getCurrentProfile();
      setProfile(data);
      
      // Populate form data
      setBasicData({
        fullName: data.fullName || '',
        city: data.city || '',
        title: data.title || '',
        bio: data.bio || '',
      });
      setSkills(data.skills || []);
      setExperiences(data.experience || []);
      setEducations(data.education || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        navigate('/profile-setup');
      } else if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || t('pages.profileSettings.errors.failedLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const ext = (file.name || '').toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((e) => ext.endsWith(e))) return;
    setAvatarUploading(true);
    try {
      await userService.uploadAvatar(file);
      await loadProfile();
      window.dispatchEvent(new Event('ish:profile-updated'));
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveBasic = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile(basicData);
      setProfile(updated);
      setSuccess(t('pages.profileSettings.basic.successBasic'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.profileSettings.errors.failedUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSkills = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile({ skills });
      setProfile(updated);
      setSuccess(t('pages.profileSettings.skills.successSkills'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.profileSettings.errors.failedSkills'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExperience = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile({ experience: experiences });
      setProfile(updated);
      setSuccess(t('pages.profileSettings.experience.successExperience'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.profileSettings.errors.failedExperience'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEducation = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile({ education: educations });
      setProfile(updated);
      setSuccess(t('pages.profileSettings.education.successEducation'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.profileSettings.errors.failedEducation'));
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
    };
    setEducations([...educations, newEdu]);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleTelegramLink = async () => {
    if (!telegramCode.trim()) return;
    setTelegramLinkError(null);
    setTelegramLinking(true);
    try {
      await authService.telegramLink(telegramCode.trim());
      setSuccess(t('pages.profileSettings.telegram.linked') || 'Telegram linked successfully.');
      setTelegramCode('');
      userService.getCurrentUser().then(setCurrentUser);
      window.dispatchEvent(new Event('ish:profile-updated'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setTelegramLinkError(err.response?.data?.detail || t('pages.profileSettings.telegram.linkError') || 'Failed to link.');
    } finally {
      setTelegramLinking(false);
    }
  };

  const tabs = [
    { id: 'basic' as TabType, icon: User },
    { id: 'skills' as TabType, icon: Briefcase },
    { id: 'experience' as TabType, icon: Briefcase },
    { id: 'education' as TabType, icon: GraduationCap },
    { id: 'cv' as TabType, icon: FileText },
    { id: 'visibility' as TabType, icon: Eye },
    { id: 'account' as TabType, icon: Link2 },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{t('pages.profileSettings.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('pages.profileSettings.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('pages.profileSettings.title')}</h1>
          </div>
          <p className="text-slate-600 text-sm lg:text-base">
            {t('pages.profileSettings.subtitle')}
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Profile Summary Card - Mobile Optimized */}
        {profile && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="relative h-16 w-16 lg:h-20 lg:w-20 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
                {profile.avatar ? (
                  <img
                    src={getUploadsUrl(profile.avatar)}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                    <User className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-medium text-center px-1">
                  {avatarUploading ? t('common.loading') : t('pages.profile.changePhoto')}
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 truncate">{profile.fullName}</h2>
                <p className="text-slate-600 text-sm lg:text-base">{profile.city}</p>
                {profile.title && (
                  <p className="text-sm text-slate-500 mt-1 truncate">{profile.title}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                {profile.isComplete && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {t('pages.profileSettings.complete')}
                  </span>
                )}
                {profile.openToJobSeeker && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {t('pages.profileSettings.openToWork')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Mobile Tab Selector */}
          <div className="lg:hidden border-b border-slate-200">
            <button
              onClick={() => setMobileTabsOpen(!mobileTabsOpen)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center space-x-2">
                {activeTabData && <activeTabData.icon className="h-5 w-5 text-blue-600" />}
                <span className="font-medium text-slate-900">{activeTabData ? t(`pages.profileSettings.tabs.${activeTabData.id}`) : ''}</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${mobileTabsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {mobileTabsOpen && (
              <div className="border-t border-slate-100 py-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleTabChange(tab.id);
                        setMobileTabsOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-2.5 text-left
                        ${activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{t(`pages.profileSettings.tabs.${tab.id}`)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:block border-b border-slate-200">
            <nav className="flex space-x-1 px-4 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(`pages.profileSettings.tabs.${tab.id}`)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('pages.profileSettings.basic.fullName')}
                    </label>
                    <input
                      type="text"
                      value={basicData.fullName}
                      onChange={(e) => setBasicData({ ...basicData, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                      placeholder={t('pages.profileSettings.basic.fullNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('pages.profileSettings.basic.city')}
                    </label>
                    <input
                      type="text"
                      value={basicData.city}
                      onChange={(e) => setBasicData({ ...basicData, city: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                      placeholder={t('pages.profileSettings.basic.cityPlaceholder')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('pages.profileSettings.basic.professionalTitle')}
                  </label>
                  <input
                    type="text"
                    value={basicData.title}
                    onChange={(e) => setBasicData({ ...basicData, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                    placeholder={t('pages.profileSettings.basic.titlePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('pages.profileSettings.basic.bio')}
                  </label>
                  <textarea
                    value={basicData.bio}
                    onChange={(e) => setBasicData({ ...basicData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm lg:text-base"
                    placeholder={t('pages.profileSettings.basic.bioPlaceholder')}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {t('pages.profileSettings.basic.characters', { count: basicData.bio.length })}
                  </p>
                </div>
                <button
                  onClick={handleSaveBasic}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? t('pages.profileSettings.basic.saving') : t('pages.profileSettings.basic.saveChanges')}</span>
                </button>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('pages.profileSettings.skills.addSkill')}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                      placeholder={t('pages.profileSettings.skills.skillPlaceholder')}
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('pages.profileSettings.skills.yourSkills', { count: skills.length })}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-slate-500 text-sm">{t('pages.profileSettings.skills.noSkills')}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSaveSkills}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? t('pages.profileSettings.basic.saving') : t('pages.profileSettings.skills.saveSkills')}</span>
                </button>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{t('pages.profileSettings.experience.workExperience')}</h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('pages.profileSettings.experience.addExperience')}</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={exp.id || index} className="border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('pages.profileSettings.experience.jobTitle')}
                          </label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={t('pages.profileSettings.experience.jobTitlePlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('pages.profileSettings.experience.company')}
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={t('pages.profileSettings.experience.companyPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('pages.profileSettings.experience.location')}
                          </label>
                          <input
                            type="text"
                            value={exp.location || ''}
                            onChange={(e) => updateExperience(index, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={t('pages.profileSettings.experience.locationPlaceholder')}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              {t('pages.profileSettings.experience.start')}
                            </label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                              className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              {t('pages.profileSettings.experience.end')}
                            </label>
                            <input
                              type="month"
                              value={exp.endDate || ''}
                              onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                              className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('pages.profileSettings.experience.description')}
                          </label>
                          <textarea
                            value={exp.description || ''}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            placeholder={t('pages.profileSettings.experience.descriptionPlaceholder')}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => removeExperience(index)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t('pages.profileSettings.experience.remove')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {experiences.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      {t('pages.profileSettings.experience.noExperience')}
                    </p>
                  )}
                </div>
                {experiences.length > 0 && (
                  <button
                    onClick={handleSaveExperience}
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? t('pages.profileSettings.basic.saving') : t('pages.profileSettings.experience.saveExperience')}</span>
                  </button>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{t('pages.profileSettings.education.title')}</h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('pages.profileSettings.education.addEducation')}</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {educations.map((edu, index) => (
                    <div key={edu.id || index} className="border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('pages.profileSettings.education.school')}
                          </label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={t('pages.profileSettings.education.schoolPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('pages.profileSettings.education.degree')}
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={t('pages.profileSettings.education.degreePlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('pages.profileSettings.education.fieldOfStudy')}
                          </label>
                          <input
                            type="text"
                            value={edu.field || ''}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={t('pages.profileSettings.education.fieldPlaceholder')}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              {t('pages.profileSettings.education.start')}
                            </label>
                            <input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                              className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          {!edu.current && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('pages.profileSettings.education.end')}
                              </label>
                              <input
                                type="month"
                                value={edu.endDate || ''}
                                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={edu.current}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const updated = [...educations];
                                updated[index] = {
                                  ...updated[index],
                                  current: checked,
                                  ...(checked ? { endDate: '' } : {}),
                                };
                                setEducations(updated);
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">{t('pages.profileSettings.education.currentlyStudying')}</span>
                          </label>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => removeEducation(index)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t('pages.profileSettings.education.remove')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {educations.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      {t('pages.profileSettings.education.noEducation')}
                    </p>
                  )}
                </div>
                {educations.length > 0 && (
                  <button
                    onClick={handleSaveEducation}
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? t('pages.profileSettings.basic.saving') : t('pages.profileSettings.education.saveEducation')}</span>
                  </button>
                )}
              </div>
            )}

            {/* CV Tab */}
            {activeTab === 'cv' && (
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('pages.profileSettings.cv.uploadTitle')}</h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 lg:p-8 text-center">
                    <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm lg:text-base mb-1">{t('pages.profileSettings.cv.uploadHint')}</p>
                    <p className="text-xs text-slate-500 mb-4">{t('pages.profileSettings.cv.maxSize')}</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="cv-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError(t('pages.profileSettings.cv.fileSizeError'));
                            return;
                          }
                          try {
                            setSaving(true);
                            setError(null);
                            const updated = await profileService.uploadCV(file);
                            setProfile(updated);
                            setSuccess(t('pages.profileSettings.cv.successUpload'));
                            setTimeout(() => setSuccess(null), 3000);
                          } catch (err: any) {
                            setError(err.response?.data?.detail || t('pages.profileSettings.cv.failedUpload'));
                          } finally {
                            setSaving(false);
                            e.target.value = '';
                          }
                        }
                      }}
                      disabled={saving}
                    />
                    <label
                      htmlFor="cv-upload"
                      className={`inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium text-sm ${
                        saving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>{saving ? t('pages.profileSettings.cv.uploading') : t('pages.profileSettings.cv.chooseFile')}</span>
                    </label>
                  </div>
                  {profile?.cvFile && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-green-800">{t('pages.profileSettings.cv.cvUploaded')}</p>
                            <p className="text-xs text-green-600 truncate">{profile.cvFile}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm(t('pages.profileSettings.cv.deleteConfirm'))) return;
                            try {
                              setSaving(true);
                              setError(null);
                              const updated = await profileService.deleteCV();
                              setProfile(updated);
setSuccess(t('pages.profileSettings.cv.successDelete'));
                            setTimeout(() => setSuccess(null), 3000);
                            } catch (err: any) {
                              setError(err.response?.data?.detail || t('pages.profileSettings.cv.failedDelete'));
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                          className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visibility Tab */}
            {activeTab === 'visibility' && profile && (
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('pages.profileSettings.visibility.profileVisibility')}</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">{t('pages.profileSettings.visibility.openToWork')}</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      {t('pages.profileSettings.visibility.openToWorkDesc')}
                    </p>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.openToJobSeeker}
                        onChange={async (e) => {
                          try {
                            const updated = await profileService.updateOpenToWork(e.target.checked);
                            setProfile(updated);
                            setSuccess(t('pages.profileSettings.visibility.successVisibility'));
                            setTimeout(() => setSuccess(null), 3000);
                          } catch (err: any) {
                            setError(err.response?.data?.detail || t('pages.profileSettings.visibility.failedVisibility'));
                          }
                        }}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {t('pages.profileSettings.visibility.showOnEmployees')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Account / Telegram Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4 lg:space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('pages.profileSettings.telegram.title') || 'Telegram'}
                </h3>
                {currentUser?.telegramId ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800">
                      {t('pages.profileSettings.telegram.alreadyLinked') || 'Telegram is linked. You can log in with Telegram.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 lg:p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                      {t('pages.profileSettings.telegram.description') ||
                        'Link your Telegram to log in with a code from the bot (no password).'}
                    </p>
                    <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2">
                      <li>
                        <a
                          href={TELEGRAM_BOT_URL_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {t('pages.profileSettings.telegram.openBot') || 'Open the Telegram bot'}
                        </a>
                        {' '}
                        {t('pages.profileSettings.telegram.andGetLinkCode') || 'and tap "Link kodi".'}
                      </li>
                      <li>
                        {t('pages.profileSettings.telegram.enterCodeBelow') || 'Enter the code below.'}
                      </li>
                    </ol>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={telegramCode}
                        onChange={(e) => setTelegramCode(e.target.value.replace(/\D/g, ''))}
                        placeholder={t('pages.profileSettings.telegram.codePlaceholder') || '123456'}
                        className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleTelegramLink}
                        disabled={telegramLinking || telegramCode.length < 6}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {telegramLinking ? t('common.loading') : (t('pages.profileSettings.telegram.linkButton') || 'Link')}
                      </button>
                    </div>
                    {telegramLinkError && (
                      <p className="text-sm text-red-600">{telegramLinkError}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
