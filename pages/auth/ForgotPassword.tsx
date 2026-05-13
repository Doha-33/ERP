import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '../../client/apiClient';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setIsLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', data);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-primary" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('forgot_password_title', 'Forgot Password?')}
                </h1>
                <p className="text-gray-500">
                  {t('forgot_password_subtitle', "No worries, we'll send you reset instructions.")}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('email', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white
                      ${errors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-primary'
                      } focus:outline-none focus:ring-4 focus:ring-primary/20`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 text-center font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? t('sending', 'Sending...') : t('reset_password_btn', 'Reset Password')}
                </button>

                <Link
                  to="/signin"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                >
                  <ArrowLeft size={16} />
                  {t('back_to_login', 'Back to Login')}
                </Link>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-green-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('check_email', 'Check your email')}
              </h1>
              <p className="text-gray-500 mb-8">
                {t('reset_link_sent', 'We have sent a password reset link to your email.')}
              </p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {t('back_to_login', 'Back to Login')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
