import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { PhoneInput } from '../components/PhoneInput';
import { authService } from '../services/authService';

export function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {}
  );
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phone || phone.length < 15) {
      newErrors.phone = "Telefon raqamini to'liq kiriting";
    }

    if (!password || password.length < 6) {
      newErrors.password = "Parol kamida 6 ta belgi bo'lishi kerak";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const translateError = (errorMessage: string): string => {
    const errorLower = errorMessage.toLowerCase();
    
    // Common error translations
    if (errorLower.includes('incorrect phone') || errorLower.includes('incorrect password')) {
      return "Telefon raqami yoki parol noto'g'ri";
    }
    if (errorLower.includes('invalid') || errorLower.includes('incorrect')) {
      return "Telefon raqami yoki parol noto'g'ri";
    }
    if (errorLower.includes('not found')) {
      return "Foydalanuvchi topilmadi";
    }
    if (errorLower.includes('unauthorized')) {
      return "Kirish rad etildi. Iltimos, ma'lumotlaringizni tekshiring";
    }
    
    // Default message
    return "Kirish muvaffaqiyatsiz. Iltimos, telefon raqami va parolni tekshiring";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Login API call
      const authResponse = await authService.login({
        phone: phone,
        password: password,
      });

      // Save token
      localStorage.setItem('token', authResponse.access_token);

      // After login, go to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      const rawErrorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      const errorMessage = translateError(rawErrorMessage);
      
      // Show general error banner
      setGeneralError(errorMessage);
      
      // Also show error on password field
      setErrors({
        password: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <Link to='/' className='inline-flex items-center space-x-2 mb-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#0A66C2] text-white font-bold text-xl'>
              ISH
            </div>
            <span className='text-2xl font-bold text-gray-900'>ISH</span>
          </Link>
          <h2 className='text-3xl font-bold text-gray-900'>Kirish</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Yoki{' '}
            <Link
              to='/register'
              className='font-medium text-[#0A66C2] hover:text-[#004182]'
            >
              ro'yxatdan o'ting
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {/* Error Banner */}
          {generalError && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-red-800'>{generalError}</p>
                <p className='text-xs text-red-600 mt-1'>
                  Iltimos, telefon raqami va parolni tekshiring yoki{' '}
                  <Link to='/register' className='font-medium underline hover:text-red-800'>
                    ro'yxatdan o'ting
                  </Link>
                </p>
              </div>
              <button
                type='button'
                onClick={() => setGeneralError(null)}
                className='text-red-400 hover:text-red-600 transition-colors'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              error={errors.phone}
            />

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Parol
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Parolingizni kiriting'
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent ${
                    errors.password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='mt-1 text-sm text-red-600'>{errors.password}</p>
              )}
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  className='h-4 w-4 text-[#0A66C2] focus:ring-[#0A66C2] border-gray-300 rounded'
                />
                <label
                  htmlFor='remember-me'
                  className='ml-2 block text-sm text-gray-700'
                >
                  Eslab qolish
                </label>
              </div>
              <Link
                to='/forgot-password'
                className='text-sm font-medium text-[#0A66C2] hover:text-[#004182]'
              >
                Parolni unutdingizmi?
              </Link>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <span>Kuting...</span>
              ) : (
                <>
                  <span>Kirish</span>
                  <ArrowRight className='h-5 w-5' />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Yoki</span>
              </div>
            </div>
          </div>

          {/* Social login */}
          <div className='mt-6 grid grid-cols-2 gap-3'>
            <button
              type='button'
              className='w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              <svg className='h-5 w-5' viewBox='0 0 24 24'>
                <path
                  fill='currentColor'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='currentColor'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='currentColor'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='currentColor'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              <span className='ml-2'>Google</span>
            </button>
            <button
              type='button'
              className='w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.305-2.051 4.348-.577.523-1.314.923-2.076 1.23-.752.304-1.551.456-2.441.456-.89 0-1.689-.152-2.441-.456-.762-.307-1.499-.707-2.076-1.23-1.155-1.043-1.882-2.49-2.051-4.348C3.936 7.776 4.224 7.2 4.6 6.72c.376-.48.84-.864 1.368-1.152.528-.288 1.104-.432 1.728-.432.624 0 1.2.144 1.728.432.528.288.992.672 1.368 1.152.376.48.664 1.056.832 1.44z' />
              </svg>
              <span className='ml-2'>Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
