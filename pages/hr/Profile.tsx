
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Calendar, MapPin, Building, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/ui/Common';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold dark:text-white">{t('my_profile')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-light-border dark:border-dark-border text-center shadow-sm">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4 border-4 border-white dark:border-dark-surface shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-1">{user.fullName || user.username}</h2>
            <p className="text-muted text-sm mb-4">@{user.username}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-success-bg text-success-text text-xs font-bold uppercase tracking-wider">
              {user.role}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-light-border dark:border-dark-border shadow-sm">
            <h3 className="font-bold mb-4 dark:text-white">{t('contact_info')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-light-bg dark:bg-dark-surface flex items-center justify-center text-muted">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted leading-none mb-1">{t('email')}</p>
                  <p className="text-sm font-medium dark:text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-light-bg dark:bg-dark-surface flex items-center justify-center text-muted">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted leading-none mb-1">{t('role')}</p>
                  <p className="text-sm font-medium dark:text-white">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-light-border dark:border-dark-border shadow-sm">
            <h3 className="text-lg font-bold mb-6 dark:text-white">{t('account_details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">{t('username')}</p>
                    <p className="font-bold dark:text-white">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">{t('created_at')}</p>
                    <p className="font-bold dark:text-white">March 26, 2026</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">{t('last_login')}</p>
                    <p className="font-bold dark:text-white">April 08, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Building size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">{t('company')}</p>
                    <p className="font-bold dark:text-white">Main Company</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              title="Total Tasks" 
              value="12" 
              trend="+2" 
              trendType="up"
              icon={<Briefcase size={20} />}
            />
            <StatCard 
              title="Performance Score" 
              value="94%" 
              trend="+5%" 
              trendType="up"
              icon={<Shield size={20} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
