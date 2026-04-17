import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Globe, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Common';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme, lang, toggleLang } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <Menu className="text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button 
          onClick={toggleLang}
          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
        >
          <Globe size={20} />
          <span className="uppercase">{lang}</span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded-xl transition-colors"
          >
            <img 
              src={user?.avatar || "https://picsum.photos/100/100"} 
              alt="User" 
              className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" 
            />
            <div className="hidden md:flex flex-col items-start">
               <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.fullName || user?.username || 'User'}</span>
               <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role ? t(user.role) : t('admin')}</span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 hidden md:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)}></div>
              <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-56 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-50 dark:border-dark-border">
                  <p className="text-sm font-bold dark:text-white">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link 
                    to="/profile" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <User size={18} />
                    {t('my_profile')}
                  </Link>
                </div>
                <div className="p-2 border-t border-gray-50 dark:border-dark-border">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};