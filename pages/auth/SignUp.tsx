import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Moon, Sun, Globe, Check, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/ui/Common';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';

const signUpSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormInputs = z.infer<typeof signUpSchema>;

export const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang, toggleLang, theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    }
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpFormInputs) => {
    setError('');
    try {
      const { user, token } = await authService.register({
        username: data.username || '',
        email: data.email,
        password: data.password,
      });

      login(token, user);
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || t('registration_error'));
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
          className="group relative p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          title={theme === 'light' ? t('dark_mode') : t('light_mode')}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          {theme === 'light' ? (
            <Moon size={20} className="text-gray-700 relative z-10" />
          ) : (
            <Sun size={20} className="text-yellow-400 relative z-10" />
          )}
        </button>

        {/* Language Dropdown */}
        <div className="relative lang-menu">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Globe size={18} className="text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {lang === 'en' ? 'EN' : 'AR'}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    if (lang !== language.code) toggleLang();
                    setShowLangMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
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

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            to="/signin" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('back_to_signin')}</span>
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-bold">ERP</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              {t('create_account')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t('sign_up_subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('username')} <span className="text-gray-400 text-xs font-normal">{t('optional')}</span>
              </label>
              <input
                type="text"
                placeholder={t('username_placeholder')}
                {...register('username')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white dark:bg-gray-800 transition-all duration-200 dark:text-white"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {t(errors.username.message as string)}
                </p>
              )}
            </div>

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
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {t(errors.email.message as string)}
                </p>
              )}
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('confirm_password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('confirm_password_placeholder')}
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-800
                    ${errors.confirmPassword 
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700 focus:border-primary'
                    } focus:outline-none focus:ring-4 focus:ring-primary/20 dark:text-white pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {t(errors.confirmPassword.message as string)}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {password && password.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        password.length >= 8 
                          ? 'w-full bg-green-500' 
                          : password.length >= 6 
                          ? 'w-3/4 bg-yellow-500' 
                          : 'w-1/2 bg-red-500'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {password.length >= 8 ? t('strong') : password.length >= 6 ? t('medium') : t('weak')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t('password_requirements')}
                </p>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="mt-1 w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary focus:ring-2 transition-all"
              />
              <label className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('agree_terms')}{' '}
                <a href="/terms" className="text-primary hover:underline font-medium">
                  {t('terms_conditions')}
                </a>{' '}
                {t('and')}{' '}
                <a href="/privacy" className="text-primary hover:underline font-medium">
                  {t('privacy_policy')}
                </a>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {t(errors.agreeTerms.message as string)}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-shake">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('creating_account')}</span>
                </div>
              ) : (
                t('sign_up')
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t('already_have_account')}{' '}
              <Link
                to="/signin"
                className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                {t('sign_in')}
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Branding */}
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
            {t('join_future')}
          </h2>
          
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            {t('sign_up_hero_subtitle')}
          </p>

          {/* Benefits List */}
          <div className="mt-12 space-y-3 max-w-md">
            {[
              { icon: '🚀', text: t('benefit_fast_setup') },
              { icon: '🔒', text: t('benefit_secure') },
              { icon: '💼', text: t('benefit_pro_features') },
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-xl">{benefit.icon}</span>
                <span className="text-white/90">{benefit.text}</span>
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