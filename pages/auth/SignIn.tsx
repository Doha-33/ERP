import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, Clock, Moon, Sun, Globe, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input } from '../../components/ui/Common';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const SignIn: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang, toggleLang, theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLangMenu && !(event.target as Element).closest('.lang-menu')) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLangMenu]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    if (cooldown > 0) return;
    setLoginError('');
    
    try {
      const credentials = {
        email: data.email,
        password: data.password,
        username: data.username || undefined
      };

      const { user, token } = await authService.login(credentials);
      login(token, user);
      
      // Store remember me preference
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 429) {
        setLoginError(t('too_many_attempts'));
        setCooldown(60);
      } else {
        setLoginError(error.message || t('login_error'));
      }
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Top Bar Controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="group relative p-2.5 rounded-xl bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          title={theme === 'light' ? t('dark_mode') : t('light_mode')}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          {theme === 'light' ? (
            <Moon size={20} className="text-gray-700 dark:text-gray-300 relative z-10" />
          ) : (
            <Sun size={20} className="text-yellow-400 relative z-10" />
          )}
        </button>

        {/* Language Dropdown */}
        <div className="relative lang-menu">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Globe size={18} className="text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {lang === 'en' ? 'EN' : 'AR'}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    if (lang !== language.code) toggleLang();
                    setShowLangMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-300  transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{language.flag}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language.name}
                    </span>
                  </div>
                  {lang === language.code && (
                    <Check size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-bold">ERP</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              {t('welcome_back')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t('sign_in_subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="hello@example.com"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-800
                  ${errors.email 
                    ? 'border-red-300 dark:border-red-700 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-primary'
                  } focus:outline-none focus:ring-4 focus:ring-primary/20 dark:text-white`}
                disabled={cooldown > 0}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {t(errors.email.message as string)}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('username_optional')}
              </label>
              <input
                type="text"
                placeholder={t('username_placeholder')}
                {...register('username')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white dark:bg-gray-800 transition-all duration-200 dark:text-white"
                disabled={cooldown > 0}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('password_placeholder')}
                  {...register('password')}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-800
                    ${errors.password 
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700 focus:border-primary'
                    } focus:outline-none focus:ring-4 focus:ring-primary/20 dark:text-white pr-12`}
                  disabled={cooldown > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {t(errors.password.message as string)}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary focus:ring-2 transition-all"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                  {t('remember_me')}
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                {t('forgot_password')}
              </Link>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-shake">
                <div className="flex items-start gap-3">
                  {cooldown > 0 ? (
                    <Clock size={18} className="text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {loginError}
                    </p>
                    {cooldown > 0 && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        {t('wait_seconds', { seconds: cooldown })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || cooldown > 0}
              className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {cooldown > 0 ? (
                <div className="flex items-center justify-center gap-2">
                  <Clock size={18} className="animate-pulse" />
                  <span>{t('wait_seconds', { seconds: cooldown })}</span>
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('signing_in')}</span>
                </div>
              ) : (
                t('sign_in')
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t('no_account')}{' '}
              <Link
                to="/signup"
                className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                {t('sign_up')}
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white px-12 text-center">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
              <div className="text-5xl font-bold bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                ERP
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            {t('hero_title')}
          </h2>
          
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            {t('hero_subtitle')}
          </p>

          {/* Feature List */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
            {['secure', 'fast', 'reliable', 'scalable'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                <span className="text-white/80 capitalize">{t(feature)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};