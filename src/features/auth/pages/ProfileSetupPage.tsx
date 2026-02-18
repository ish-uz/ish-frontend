import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, MapPin, FileText, Upload, ArrowRight, X } from 'lucide-react';
import { profileService } from '@/features/profiles/services/profileService';
import ishLogo from '@/assets/images/ish-logo.PNG';
import { userService } from '@/features/users/services/userService';

export function ProfileSetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    bio: '',
  });

  // Check if profile already exists and is complete, and auto-fill user data
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await profileService.getCurrentProfile();
        if (profile && profile.isComplete) {
          // Profile is complete, redirect to profile settings
          navigate('/profile/settings');
        } else if (profile) {
          // Profile exists but incomplete, pre-fill data
          setFormData({
            fullName: profile.fullName || '',
            city: profile.city || '',
            bio: profile.bio || '',
          });
        }
      } catch (error: any) {
        // Profile doesn't exist (404) - try to get user data to auto-fill name
        if (error.response?.status === 401) {
          // Not authenticated, redirect to login
          navigate('/login');
        } else if (error.response?.status === 404) {
          // Profile doesn't exist, get user data to auto-fill fullName
          try {
            const currentUser = await userService.getCurrentUser();
            if (currentUser) {
              setFormData(prev => ({
                ...prev,
                fullName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
              }));
            }
          } catch (userError) {
            // Couldn't get user data, that's ok - user will fill manually
          }
        }
      }
    };
    checkProfile();
  }, [navigate]);
  const [, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: t('pages.profileSetup.avatarSize'),
        }));
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: '' }));
      }
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('pages.profileSetup.fullNameRequired');
    }

    if (!formData.city.trim()) {
      newErrors.city = t('pages.profileSetup.cityRequired');
    }

    if (!formData.bio.trim()) {
      newErrors.bio = t('pages.profileSetup.bioRequired');
    } else if (formData.bio.trim().length < 20) {
      newErrors.bio = t('pages.profileSetup.bioMin');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Create profile via API
      await profileService.createProfile({
        fullName: formData.fullName,
        city: formData.city,
        bio: formData.bio,
      });

      // After successful profile creation, redirect to profile settings
      navigate('/profile/settings');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || t('pages.profileSetup.createError');
      if (error.response?.status === 401) {
        // Not authenticated, redirect to login
        navigate('/login');
      } else {
        setErrors({ bio: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const cities = [
    'Toshkent',
    'Samarqand',
    'Buxoro',
    'Andijon',
    "Farg'ona",
    'Namangan',
    'Qarshi',
    'Nukus',
    'Termiz',
    'Guliston',
    'Jizzax',
    'Navoiy',
    'Urganch',
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl w-full'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center space-x-2 mb-4'>
            <img src={ishLogo} alt="ISH" className="h-12 w-auto object-contain rounded-lg" />
            <span className='text-2xl font-bold text-gray-900'>ISH</span>
          </div>
          <h2 className='text-3xl font-bold text-gray-900'>
            {t('pages.profileSetup.title')}
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            {t('pages.profileSetup.subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Avatar Upload */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t('pages.profileSetup.avatarLabel')}
              </label>
              <div className='flex items-center gap-6'>
                <div className='relative'>
                  {avatarPreview ? (
                    <div className='relative'>
                      <img
                        src={avatarPreview}
                        alt='Avatar preview'
                        className='w-24 h-24 rounded-full object-cover border-4 border-gray-200'
                      />
                      <button
                        type='button'
                        onClick={removeAvatar}
                        className='absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  ) : (
                    <div className='w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center'>
                      <User className='h-12 w-12 text-gray-400' />
                    </div>
                  )}
                </div>
                <div className='flex-1'>
                  <label
                    htmlFor='avatar'
                    className='inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0A66C2] hover:bg-blue-50 transition-colors'
                  >
                    <Upload className='h-5 w-5 text-gray-400' />
                    <span className='text-sm font-medium text-gray-700'>
                      {t('pages.profileSetup.uploadPhoto')}
                    </span>
                    <input
                      id='avatar'
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarChange}
                      className='hidden'
                    />
                  </label>
                  <p className='mt-1 text-xs text-gray-500'>
                    {t('pages.profileSetup.imageFormats')}
                  </p>
                  {errors.avatar && (
                    <p className='mt-1 text-sm text-red-600'>{errors.avatar}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor='fullName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {t('pages.profileSetup.fullName')}
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='fullName'
                  type='text'
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder={t('pages.profileSetup.fullNamePlaceholder')}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent ${
                    errors.fullName
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className='mt-1 text-sm text-red-600'>{errors.fullName}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor='city'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {t('pages.profileSetup.city')}
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <MapPin className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='city'
                  type='text'
                  list='cities'
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder={t('pages.profileSetup.cityPlaceholder')}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent ${
                    errors.city
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <datalist id='cities'>
                  {cities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              {errors.city && (
                <p className='mt-1 text-sm text-red-600'>{errors.city}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor='bio'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {t('pages.profileSetup.bio')}
              </label>
              <div className='relative'>
                <div className='absolute top-3 left-3 pointer-events-none'>
                  <FileText className='h-5 w-5 text-gray-400' />
                </div>
                <textarea
                  id='bio'
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder={t('pages.profileSetup.bioPlaceholder')}
                  rows={4}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none ${
                    errors.bio
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              <div className='flex items-center justify-between mt-1'>
                {errors.bio ? (
                  <p className='text-sm text-red-600'>{errors.bio}</p>
                ) : (
                  <p className='text-xs text-gray-500'>
                    {t('pages.profileSetup.bioCounter', { count: formData.bio.length })}
                  </p>
                )}
                <p className='text-xs text-gray-400'>
                  {t('pages.profileSetup.charCount', { count: formData.bio.length })}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <span>{t('pages.profileSetup.saving')}</span>
              ) : (
                <>
                  <span>{t('pages.profileSetup.continue')}</span>
                  <ArrowRight className='h-5 w-5' />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
