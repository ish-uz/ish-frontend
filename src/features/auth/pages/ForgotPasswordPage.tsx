import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import ishLogo from '@/assets/images/ish-logo.PNG';
import { authService } from '../services/authService';

type Step = 'email' | 'reset';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = t('pages.auth.emailInvalid');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('pages.auth.emailInvalid');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateReset = () => {
    const e: Record<string, string> = {};
    if (!code.trim() || code.length !== 6) e.code = t('pages.auth.forgotPasswordPage.codeRequired');
    if (!newPassword || newPassword.length < 6) e.newPassword = t('pages.auth.passwordMin');
    if (newPassword !== confirmPassword) e.confirmPassword = t('pages.auth.passwordsMismatch');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await authService.forgotPassword(email.trim());
      setStep('reset');
    } catch (err: any) {
      setErrors({ email: err.response?.data?.detail || t('pages.auth.forgotPasswordPage.requestFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReset()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await authService.resetPassword(email.trim(), code.trim(), newPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrors({ code: err.response?.data?.detail || t('pages.auth.forgotPasswordPage.resetFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <img src={ishLogo} alt="ISH" className="h-12 w-auto object-contain rounded-lg" />
            <span className="text-2xl font-bold text-gray-900">ISH</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 'email'
              ? t('pages.auth.forgotPasswordPage.title')
              : success
                ? t('pages.auth.forgotPasswordPage.doneTitle')
                : t('pages.auth.forgotPasswordPage.resetTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email' && t('pages.auth.forgotPasswordPage.subtitle')}
            {step === 'reset' && !success && t('pages.auth.forgotPasswordPage.enterCode')}
            {success && t('pages.auth.forgotPasswordPage.doneSubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center py-4">
              <p className="text-gray-700 mb-6">{t('pages.auth.forgotPasswordPage.doneMessage')}</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182]"
              >
                <span>{t('pages.auth.signIn')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          ) : step === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pages.auth.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('pages.auth.emailPlaceholder')}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182] disabled:opacity-50"
              >
                {isLoading ? t('pages.auth.loading') : t('pages.auth.forgotPasswordPage.sendCode')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pages.auth.forgotPasswordPage.code')}
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent ${
                    errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pages.auth.forgotPasswordPage.newPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('pages.auth.passwordMin')}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A66C2] ${
                      errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pages.auth.confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('pages.auth.confirmPasswordPlaceholder')}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#0A66C2] ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('pages.auth.telegram.back')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182] disabled:opacity-50"
                >
                  {isLoading ? t('pages.auth.loading') : t('pages.auth.forgotPasswordPage.resetButton')}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-gray-600">
              <Link to="/login" className="font-medium text-[#0A66C2] hover:text-[#004182]">
                {t('pages.auth.loginLink')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
