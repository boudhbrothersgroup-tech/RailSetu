import React, { useState, useEffect } from 'react';
import { localDbService, UserProfile } from '../services/LocalDbService';
import { 
  Settings, User, Heart, LifeBuoy, MessageSquare, Info, Shield, 
  Moon, Sun, Bell, Database, RefreshCw, ChevronRight, LogIn, LogOut, CheckCircle 
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate: (route: string, params?: any) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, theme, setTheme }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [cacheSize, setCacheSize] = useState('0.00 KB');
  const [clearing, setClearing] = useState(false);
  const [clearMsg, setClearMsg] = useState(false);

  useEffect(() => {
    setUser(localDbService.getCurrentUser());
    setNotifyEnabled(localDbService.isNotificationsEnabled());
    setCacheSize(localDbService.getOfflineCacheSize());
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localDbService.setTheme(nextTheme);
  };

  const handleToggleNotify = () => {
    const nextVal = !notifyEnabled;
    setNotifyEnabled(nextVal);
    localDbService.toggleNotificationsEnabled(nextVal);
  };

  const handleClearCache = () => {
    setClearing(true);
    setClearMsg(false);
    setTimeout(() => {
      localDbService.clearOfflineCache();
      setCacheSize(localDbService.getOfflineCacheSize());
      setClearing(false);
      setClearMsg(true);
      setTimeout(() => setClearMsg(false), 2500);
    }, 1000);
  };

  const handleLogout = () => {
    localDbService.signOut();
    setUser(null);
    onNavigate('home');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-150 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* AppBar */}
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-400" />
          <span className="font-bold text-sm font-sans">Settings & Profiles</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile / Account Card */}
        {user ? (
          <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3.5 min-w-0" onClick={() => onNavigate('profile')}>
              <div className="w-11 h-11 bg-blue-100 text-[#0D47A1] rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs truncate">{user.name}</h3>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 text-[8px] rounded-full uppercase">
                  Authenticated Account
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs">Guest Passenger</h3>
                <p className="text-[10px] text-slate-400">Offline Caches Enabled</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('auth')}
              className="px-3 py-1.5 bg-[#0D47A1] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Feature Navigation Grid */}
        <div className={`rounded-xl border shadow-sm overflow-hidden divide-y ${isDark ? 'bg-slate-900 border-slate-800 divide-slate-800' : 'bg-white border-slate-100 divide-slate-100'}`}>
          <div className={`p-2.5 text-[9px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-950/40 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
            Passenger Services
          </div>

          <div 
            onClick={() => onNavigate('profile')}
            className={`flex justify-between items-center p-3 hover:bg-slate-50/10 cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold">My Travel Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div 
            onClick={() => onNavigate('favourites')}
            className={`flex justify-between items-center p-3 hover:bg-slate-50/10 cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-xs font-semibold">Favorite Pinned Rails</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Configuration Toggles */}
        <div className={`rounded-xl border shadow-sm overflow-hidden divide-y ${isDark ? 'bg-slate-900 border-slate-800 divide-slate-800' : 'bg-white border-slate-100 divide-slate-100'}`}>
          <div className={`p-2.5 text-[9px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-950/40 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
            Personalization Settings
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex justify-between items-center p-3">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="text-xs font-semibold">Dark Theme Mode</span>
            </div>
            <button
              onClick={handleToggleTheme}
              className={`w-9 h-5 rounded-full transition-colors relative ${isDark ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${isDark ? 'right-0.5' : 'left-0.5'}`}></div>
            </button>
          </div>

          {/* Push Notifications Toggle */}
          <div className="flex justify-between items-center p-3">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold">FCM Push Alerts</span>
            </div>
            <button
              onClick={handleToggleNotify}
              className={`w-9 h-5 rounded-full transition-colors relative ${notifyEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${notifyEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
            </button>
          </div>

          {/* Local Storage Cache management */}
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold">Offline GNWL Cache</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{cacheSize}</span>
            </div>
            
            {clearMsg && (
              <div className="text-[9px] text-emerald-600 font-bold text-center bg-emerald-50 py-1 rounded">
                ✓ Local timetables and histories cleared!
              </div>
            )}

            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="w-full py-1.5 bg-red-50 hover:bg-red-100 disabled:bg-slate-100 border border-red-200 text-red-600 font-bold rounded-lg text-[10px] text-center"
            >
              {clearing ? 'Clearing Storage...' : 'Wipe Offline Cache Directories'}
            </button>
          </div>
        </div>

        {/* Support and Info */}
        <div className={`rounded-xl border shadow-sm overflow-hidden divide-y ${isDark ? 'bg-slate-900 border-slate-800 divide-slate-800' : 'bg-white border-slate-100 divide-slate-100'}`}>
          <div className={`p-2.5 text-[9px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-950/40 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
            Help & Regulatory Desk
          </div>

          <div 
            onClick={() => onNavigate('support')}
            className={`flex justify-between items-center p-3 hover:bg-slate-50/10 cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <LifeBuoy className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-semibold">Contact Support Helpdesk</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div 
            onClick={() => onNavigate('feedback')}
            className={`flex justify-between items-center p-3 hover:bg-slate-50/10 cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-[#FF9800]" />
              <span className="text-xs font-semibold">App Feedback Submission</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div 
            onClick={() => onNavigate('about')}
            className={`flex justify-between items-center p-3 hover:bg-slate-50/10 cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold">About & App Update Checks</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div 
            onClick={() => onNavigate('privacy')}
            className={`flex justify-between items-center p-3 hover:bg-slate-50/10 cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold">Privacy Policy Compliance</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-[9px] text-slate-400 font-mono">
            RailSetu is GNWL & IRCTC Standardized • Secure Sandboxed Build 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};
