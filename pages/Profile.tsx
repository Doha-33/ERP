
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Common';
import { User, Mail, Shield, Calendar, Activity, Building, MapPin } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={64} className="text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">{user.username}</h2>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">{user.role}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${user.state === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {user.state || 'ACTIVE'}
          </div>
        </Card>

        {/* Right Column: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white border-b pb-2">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Email Address</p>
                  <p className="text-sm font-medium dark:text-gray-200">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Role</p>
                  <p className="text-sm font-medium dark:text-gray-200">{user.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Member Since</p>
                  <p className="text-sm font-medium dark:text-gray-200">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Last Login</p>
                  <p className="text-sm font-medium dark:text-gray-200">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white border-b pb-2">Organization Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                  <Building size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Company</p>
                  <p className="text-sm font-medium dark:text-gray-200">Default Company</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-cyan-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Branch</p>
                  <p className="text-sm font-medium dark:text-gray-200">Main Branch</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
