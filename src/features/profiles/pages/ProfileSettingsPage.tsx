import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { Profile, Experience, Education } from '@/types';
import { 
  Settings, User, Briefcase, GraduationCap, FileText, 
  Eye, Save, Plus, X, Trash2, Upload, CheckCircle2, ChevronDown
} from 'lucide-react';

type TabType = 'basic' | 'skills' | 'experience' | 'education' | 'cv' | 'visibility';

export function ProfileSettingsPage() {
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
    const validTabs: TabType[] = ['basic', 'skills', 'experience', 'education', 'cv', 'visibility'];
    if (tabParam && validTabs.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    return 'basic';
  };
  
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);

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
        setError(err.response?.data?.detail || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasic = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile(basicData);
      setProfile(updated);
      setSuccess('Basic information updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
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
      setSuccess('Skills updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update skills');
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
      setSuccess('Work experience updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update experience');
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
      setSuccess('Education updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update education');
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

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic Info', icon: User },
    { id: 'skills' as TabType, label: 'Skills', icon: Briefcase },
    { id: 'experience' as TabType, label: 'Experience', icon: Briefcase },
    { id: 'education' as TabType, label: 'Education', icon: GraduationCap },
    { id: 'cv' as TabType, label: 'CV', icon: FileText },
    { id: 'visibility' as TabType, label: 'Visibility', icon: Eye },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
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
            Retry
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Profile Settings</h1>
          </div>
          <p className="text-slate-600 text-sm lg:text-base">
            Manage your profile information and visibility settings
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
              <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
              </div>
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
                    Complete
                  </span>
                )}
                {profile.openToJobSeeker && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Open To Work
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
                <span className="font-medium text-slate-900">{activeTabData?.label}</span>
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
                      <span className="font-medium">{tab.label}</span>
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
                    <span>{tab.label}</span>
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={basicData.fullName}
                      onChange={(e) => setBasicData({ ...basicData, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      value={basicData.city}
                      onChange={(e) => setBasicData({ ...basicData, city: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                      placeholder="Your city"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={basicData.title}
                    onChange={(e) => setBasicData({ ...basicData, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={basicData.bio}
                    onChange={(e) => setBasicData({ ...basicData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm lg:text-base"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {basicData.bio.length} characters
                  </p>
                </div>
                <button
                  onClick={handleSaveBasic}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Add Skill
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                      placeholder="e.g., JavaScript, Python"
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
                    Your Skills ({skills.length})
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
                      <p className="text-slate-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSaveSkills}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Skills'}</span>
                </button>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Work Experience</h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Experience</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={exp.id || index} className="border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Job Title *
                          </label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Company *
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={exp.location || ''}
                            onChange={(e) => updateExperience(index, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Start *
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
                              End
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
                            Description
                          </label>
                          <textarea
                            value={exp.description || ''}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            placeholder="Describe your responsibilities..."
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => removeExperience(index)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {experiences.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      No work experience added yet. Click "Add Experience" to get started.
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
                    <span>{saving ? 'Saving...' : 'Save Experience'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Education</h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Education</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {educations.map((edu, index) => (
                    <div key={edu.id || index} className="border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            School/University *
                          </label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="School name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Degree *
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., Bachelor's"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={edu.field || ''}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Start *
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
                                End
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
                            <span className="text-sm text-slate-700">Currently studying here</span>
                          </label>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => removeEducation(index)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {educations.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      No education added yet. Click "Add Education" to get started.
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
                    <span>{saving ? 'Saving...' : 'Save Education'}</span>
                  </button>
                )}
              </div>
            )}

            {/* CV Tab */}
            {activeTab === 'cv' && (
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Your CV</h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 lg:p-8 text-center">
                    <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm lg:text-base mb-1">Upload your CV (PDF, DOC, DOCX)</p>
                    <p className="text-xs text-slate-500 mb-4">Max file size: 5MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="cv-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('File size must be less than 5MB');
                            return;
                          }
                          try {
                            setSaving(true);
                            setError(null);
                            const updated = await profileService.uploadCV(file);
                            setProfile(updated);
                            setSuccess('CV uploaded successfully!');
                            setTimeout(() => setSuccess(null), 3000);
                          } catch (err: any) {
                            setError(err.response?.data?.detail || 'Failed to upload CV');
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
                      <span>{saving ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                  </div>
                  {profile?.cvFile && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-green-800">CV uploaded</p>
                            <p className="text-xs text-green-600 truncate">{profile.cvFile}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm('Are you sure you want to delete your CV?')) return;
                            try {
                              setSaving(true);
                              setError(null);
                              const updated = await profileService.deleteCV();
                              setProfile(updated);
                              setSuccess('CV deleted successfully!');
                              setTimeout(() => setSuccess(null), 3000);
                            } catch (err: any) {
                              setError(err.response?.data?.detail || 'Failed to delete CV');
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
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Visibility</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">Open To Work</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Make your profile visible on the Employees page so employers can find you.
                    </p>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.openToJobSeeker}
                        onChange={async (e) => {
                          try {
                            const updated = await profileService.updateOpenToWork(e.target.checked);
                            setProfile(updated);
                            setSuccess('Visibility settings updated!');
                            setTimeout(() => setSuccess(null), 3000);
                          } catch (err: any) {
                            setError(err.response?.data?.detail || 'Failed to update visibility');
                          }
                        }}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Show my profile on Employees page
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
