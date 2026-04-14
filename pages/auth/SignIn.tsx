
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, Clock, Moon, Sun } from 'lucide-react';
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

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    if (cooldown > 0) return;
    setLoginError('');
    
    try {
      // Use the requested keys: email, password, username
      const credentials = {
        email: data.email,
        password: data.password,
        username: data.username || undefined
      };

      // Use the authService for login
      const { user, token } = await authService.login(credentials);

      // Update context state
      login(token, user);
      
      // Redirect to dashboard
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 429) {
        setLoginError("Too many login attempts. Please wait 60 seconds.");
        setCooldown(60);
      } else {
        setLoginError(error.message || t('login_error'));
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-bg transition-colors duration-300">
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
        
        <div className="max-w-md mx-auto w-full">
           <div className="mb-10 lg:hidden flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                ERP
              </div>
           </div>

           <h1 className="text-4xl font-bold mb-3 dark:text-white tracking-tight">{t('sign_in')}</h1>
           <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Welcome back! Please enter your details.</p>

           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input 
                 label={t('email')} 
                 type="email" 
                 placeholder="mail@example.com" 
                 {...register('email')}
                 error={errors.email?.message}
                 disabled={cooldown > 0}
              />

              <Input 
                 label="Username (Optional)" 
                 type="text" 
                 placeholder="username" 
                 {...register('username')}
                 error={errors.username?.message}
                 disabled={cooldown > 0}
              />
              
              <div className="relative">
                 <Input 
                    label={t('password')} 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t('password')} 
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={cooldown > 0}
                 />
                 <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] rtl:right-auto rtl:left-3 text-gray-400 hover:text-gray-600"
                 >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                 </button>
              </div>

              {loginError && (
                 <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/20 flex items-start gap-2 animate-pulse">
                    {cooldown > 0 ? <Clock size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                    <span>{loginError}</span>
                 </div>
              )}

              <div className="flex items-center justify-between">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm text-gray-500">Keep me logged in</span>
                 </label>
                 <a href="#" className="text-sm text-primary font-medium hover:underline">Forgot password?</a>
              </div>

              <Button type="submit" fullWidth className="h-11" disabled={isSubmitting || cooldown > 0}>
                 {cooldown > 0 ? `Wait ${cooldown}s` : isSubmitting ? 'Signing in...' : t('sign_in')}
              </Button>
           </form>

           <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">{t('sign_up')}</Link>
           </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-primary flex-col items-center justify-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20" 
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
         </div>
         
         <div className="relative z-10 text-center px-12">
            <div className="mb-8 mx-auto w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl font-bold shadow-2xl border border-white/20">
               <div className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">ERP</div>
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Enterprise Solution</h2>
            <p className="text-primary-soft/80 text-lg max-w-sm mx-auto leading-relaxed">
               Manage your business operations with our comprehensive and secure platform.
            </p>
         </div>

         {/* Decorative elements */}
         <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
         <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};
