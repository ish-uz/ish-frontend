import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import ishLogo from '@/assets/images/ish-logo.PNG';
import { authService } from '../services/authService';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const emailFromState = (location.state as { email?: string } | null)?.email;

  const [mode, setMode] = useState<'link' | 'form'>('form');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');

  const [email, setEmail] = useState(emailFromState || '');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl.trim() !== '') {
      setMode('link');
      setStatus('loading');
      authService
        .verifyEmail(tokenFromUrl)
        .then((data) => {
          setStatus('success');
          setVerifiedEmail(data.email);
        })
        .catch((err: any) => {
          setStatus('error');
          setMessage(err.response?.data?.detail || t('pages.auth.verifyEmail.failed'));
        });
    } else if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [tokenFromUrl, emailFromState, t]);

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || code.trim().length !== 6) return;
    setStatus('loading');
    setMessage('');
    try {
      const data = await authService.verifyEmailByCode(email.trim(), code.trim());
      setStatus('success');
      setVerifiedEmail(data.email);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.detail || t('pages.auth.verifyEmail.failed'));
    }
  };

  const showForm = mode === 'form' && status !== 'success' && status !== 'loading';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <img src={ishLogo} alt="ISH" className="h-12 w-auto object-contain rounded-lg" />
            <span className="text-2xl font-bold text-gray-900">ISH</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">{t('pages.auth.verifyEmail.title')}</h2>
          {showForm && (
            <p className="mt-2 text-sm text-gray-600">
              {t('pages.auth.verifyEmail.enterCode')}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {mode === 'link' && status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-[#0A66C2] animate-spin mb-4" />
              <p className="text-gray-600">{t('pages.auth.verifyEmail.verifying')}</p>
            </div>
          )}

          {showForm && status !== 'loading' && (
            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pages.auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('pages.auth.emailPlaceholder')}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pages.auth.verifyEmail.code')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                  required
                />
              </div>
              {status === 'error' && message && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading' || email.trim() === '' || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182] disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t('pages.auth.verifyEmail.submit')
                )}
              </button>
            </form>
          )}

          {status === 'loading' && mode === 'form' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-[#0A66C2] animate-spin mb-4" />
              <p className="text-gray-600">{t('pages.auth.verifyEmail.verifying')}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-1">
                {t('pages.auth.verifyEmail.success')}
              </p>
              {verifiedEmail && (
                <p className="text-sm text-gray-600 mb-6">{verifiedEmail}</p>
              )}
              <Link
                to="/profile-setup"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182]"
              >
                {t('pages.auth.verifyEmail.continueToProfile')}
              </Link>
              <p className="mt-3 text-sm text-gray-500">
                <Link to="/login" className="text-[#0A66C2] hover:underline">
                  {t('pages.auth.verifyEmail.goToLogin')}
                </Link>
              </p>
            </div>
          )}

          {status === 'error' && mode === 'link' && (
            <div className="text-center py-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {t('pages.auth.verifyEmail.errorTitle')}
              </p>
              <p className="text-sm text-gray-600 mb-6">{message}</p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182]"
              >
                {t('pages.auth.verifyEmail.registerAgain')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
