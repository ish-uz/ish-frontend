import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Briefcase, GraduationCap, Mail, Phone, 
  Calendar, ExternalLink, Edit2, FileText, CheckCircle2,
  Building2, Clock, Award, Code
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { userService } from '@/features/users/services/userService';
import { Profile } from '@/types';

export function ProfileViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Profile;
      let profileUserId: number;
      
      if (id) {
        // Load profile by user ID
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
          setError('Invalid user ID');
          return;
        }
        data = await profileService.getProfileByUserId(userId);
        profileUserId = data.userId;
      } else {
        // Load current user's profile
        data = await profileService.getCurrentProfile();
        profileUserId = data.userId;
        setIsOwnProfile(true);
      }
      
      setProfile(data);
      
      // Check if this is the current user's own profile
      try {
        const currentUser = await userService.getCurrentUser();
        setIsOwnProfile(currentUser.id === profileUserId);
      } catch {
        // User not logged in or error - not own profile
        setIsOwnProfile(false);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        if (!id) {
          navigate('/profile-setup');
        } else {
          setError('Profile not found');
        }
      } else {
        setError(err.response?.data?.detail || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="h-40 bg-slate-200"></div>
              <div className="p-6">
                <div className="flex items-end -mt-16 mb-4">
                  <div className="h-32 w-32 rounded-2xl bg-slate-300 border-4 border-white"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
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
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
          {/* Cover Image */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 relative rounded-t-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwSDh2LTJoMjR2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 rounded-t-2xl"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end mb-4">
              {/* Avatar - positioned to overlap cover */}
              <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0 -mt-16 relative z-10">
                <User className="h-16 w-16 text-white" />
              </div>
              
              {/* Edit Button - Only for own profile */}
              {isOwnProfile && (
                <div className="sm:ml-auto mt-4 sm:mt-0">
                  <Link
                    to="/profile/settings"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                {profile.isComplete && (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                )}
              </div>
              {profile.title && (
                <p className="text-lg text-slate-600 mt-1">{profile.title}</p>
              )}
            </div>

            {/* Location & Status */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                {profile.city}
              </span>
              {profile.openToJobSeeker && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Open To Work
                </span>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-slate-700 whitespace-pre-line">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {profile.experience && profile.experience.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-6">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Work Experience</h2>
            </div>
            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div key={exp.id || index} className="relative pl-8 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {index !== profile.experience!.length - 1 && (
                    <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-slate-200"></div>
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mt-1">
                      <span className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {exp.company}
                      </span>
                      {exp.location && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {exp.location}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </div>
                    {exp.description && (
                      <p className="mt-3 text-slate-600 text-sm whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-6">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Education</h2>
            </div>
            <div className="space-y-6">
              {profile.education.map((edu, index) => (
                <div key={edu.id || index} className="relative pl-8 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {index !== profile.education!.length - 1 && (
                    <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-slate-200"></div>
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900">{edu.school}</h3>
                    <p className="text-slate-600">
                      {edu.degree}{edu.field && ` • ${edu.field}`}
                    </p>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(edu.startDate)} - {edu.current ? 'Present' : (edu.endDate ? formatDate(edu.endDate) : 'N/A')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CV Section */}
        {profile.cvFile && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Resume / CV</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Resume.pdf</p>
                  <p className="text-sm text-slate-500">Uploaded CV</p>
                </div>
              </div>
              <a
                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/uploads/${profile.cvFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View</span>
              </a>
            </div>
          </div>
        )}

        {/* Empty State - Prompt to complete profile */}
        {isOwnProfile && (!profile.skills?.length && !profile.experience?.length && !profile.education?.length) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 text-center">
            <Award className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Make your profile stand out!
            </h3>
            <p className="text-slate-600 mb-4">
              Add your skills, experience, and education to increase your visibility to employers.
            </p>
            <Link
              to="/profile/settings"
              className="inline-flex items-center px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Complete Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
