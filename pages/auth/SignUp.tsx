
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Moon, Sun } from 'lucide-react';
import { Button, Input } from '../../components/ui/Common';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';

const signUpSchema = z.object({
  username: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpFormInputs = z.infer<typeof signUpSchema>;

export const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang, toggleLang, theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: SignUpFormInputs) => {
    setError('');
    try {
      // Use the requested keys: username, email, password
      const { user, token } = await authService.register({
        username: data.username || '',
        email: data.email,
        password: data.password,
      });

      // Update context state
      login(token, user);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-bg transition-colors duration-300">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
        <div className="absolute top-8 right-8 flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg bg-gray-50 dark:bg-gray-800"
            title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={toggleLang} className="text-sm font-bold text-gray-400 hover:text-primary transition-colors px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              {lang === 'en' ? 'AR' : 'EN'}
          </button>
        </div>
        
        <Link to="/signin" className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-1 hover:text-primary transition-colors w-fit font-medium">
           &larr; Back to sign in
        </Link>
        
        <div className="max-w-md mx-auto w-full">
           <div className="mb-10 lg:hidden flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                ERP
              </div>
           </div>

           <h1 className="text-4xl font-bold mb-3 dark:text-white tracking-tight">{t('sign_up')}</h1>
           <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Create an admin account to get started.</p>

           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input 
                 label="Username (Optional)" 
                 placeholder="username" 
                 {...register('username')}
                 error={errors.username?.message}
              />

              <Input 
                 label={t('email')} 
                 type="email" 
                 placeholder="mail@example.com" 
                 {...register('email')}
                 error={errors.email?.message}
              />
              
              <Input 
                 label={t('password')} 
                 type="password" 
                 placeholder={t('password')} 
                 {...register('password')}
                 error={errors.password?.message}
              />

              {error && (
                 <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/20 flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                 </div>
              )}

              <div className="flex items-start gap-2">
                 <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" required />
                 <span className="text-sm text-gray-500 leading-tight">
                    By creating an account you agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                 </span>
              </div>

              <Button type="submit" fullWidth className="h-11" disabled={isSubmitting}>
                 {isSubmitting ? 'Creating account...' : t('sign_up')}
              </Button>
           </form>

           <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account? <Link to="/signin" className="text-primary font-bold hover:underline">{t('sign_in')}</Link>
           </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col items-center justify-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20" 
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
         </div>
         <div className="relative z-10 text-center px-12">
             <div className="mb-8 mx-auto w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl font-bold shadow-2xl border border-white/20">
                <div className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">ERP</div>
             </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Join the Future</h2>
            <p className="text-primary-soft/80 text-lg max-w-sm mx-auto leading-relaxed">
               Create an account to start managing your enterprise more efficiently.
            </p>
         </div>
         
         {/* Decorative elements */}
         <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
         <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};
