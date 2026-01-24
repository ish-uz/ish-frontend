import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { Profile } from '@/types';

interface OpenToWorkToggleProps {
  profile?: Profile;
  onUpdate?: (profile: Profile) => void;
}

export function OpenToWorkToggle({ profile, onUpdate }: OpenToWorkToggleProps) {
  const [isOpen, setIsOpen] = useState(profile?.openToJobSeeker || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsOpen(profile.openToJobSeeker || false);
    }
  }, [profile]);

  const handleToggle = async (checked: boolean) => {
    try {
      setLoading(true);
      const updatedProfile = await profileService.updateOpenToWork(checked);
      setIsOpen(checked);
      if (onUpdate) {
        onUpdate(updatedProfile);
      }
    } catch (error: any) {
      console.error('Failed to update open to work status:', error);
      // Revert on error
      setIsOpen(!checked);
      alert(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">Open To Work</h3>
        <p className="mt-1 text-sm text-gray-500">
          Make your profile visible on the Employees page so employers can find you
        </p>
      </div>
      <div className="ml-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={loading}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
}
