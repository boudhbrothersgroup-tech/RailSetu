import React, { useState, useEffect } from 'react';
import { 
  SplashView, HomeView, SearchView, HistoryView, 
  PnrView, LiveStatusView, CoachPositionView, PlatformLocatorView, 
  DisruptionUpdatesView, SeatAvailabilityView, ScheduleView, FareEnquiryView 
} from './simulatedScreens';
import { SettingsView } from './SettingsView';
import { AuthView } from './AuthView';
import { UserProfileView } from './UserProfileView';
import { FavouritesView } from './FavouritesView';
import { SupportFeedbackView } from './SupportFeedbackView';
import { AboutVersionView } from './AboutVersionView';
import { SavedItem } from '../types';
import { localDbService, PushNotification } from '../services/LocalDbService';
import { 
  Home, Search, History as HistoryIcon, Settings, AlertOctagon, 
  Wifi, Battery, Loader, RefreshCw, Smartphone, BellRing, X 
} from 'lucide-react';

interface PhoneSimulatorProps {
  currentScreen: string;
  setScreen: (screen: string, params?: any) => void;
  screenParams: any;
  simulatedState: 'success' | 'loading' | 'empty' | 'error';
  setSimulatedState: (state: 'success' | 'loading' | 'empty' | 'error') => void;
  history: SavedItem[];
  saved: SavedItem[];
  onAddHistory: (item: SavedItem) => void;
  onAddSaved: (item: SavedItem) => void;
  onRemoveSaved: (id: string) => void;
  onClearHistory: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  currentScreen,
  setScreen,
  screenParams,
  simulatedState,
  setSimulatedState,
  history,
  saved,
  onAddHistory,
  onAddSaved,
  onRemoveSaved,
  onClearHistory
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toast, setToast] = useState<PushNotification | null>(null);

  // Synchronize initial theme & listen to notifications
  useEffect(() => {
    setTheme(localDbService.getTheme());
    
    // Register FCM callback
    localDbService.onNotification((n) => {
      setToast(n);
      
      // Auto dismiss toast after 4 seconds
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    });
  }, []);

  const handleNavigate = (route: string, params?: any) => {
    setScreen(route, params);
  };

  const renderActiveScreen = () => {
    // If simulatedState is override, show standard mock states (except for splash)
    if (currentScreen !== 'splash' && !['auth', 'profile', 'favourites', 'support', 'feedback', 'about', 'privacy'].includes(currentScreen)) {
      if (simulatedState === 'loading') {
        return (
          <div className={`h-full w-full flex flex-col items-center justify-center p-6 text-center select-none animate-pulse ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-700'}`}>
            <Loader className="w-10 h-10 text-[#0D47A1] animate-spin mb-4" />
            <p className="font-bold text-sm">Connecting RailSetu Node...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving official timetable and passenger database indices.</p>
          </div>
        );
      }
      if (simulatedState === 'empty') {
        return (
          <div className={`h-full w-full flex flex-col items-center justify-center p-6 text-center select-none ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-700'}`}>
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Smartphone className="w-8 h-8" />
            </div>
            <p className="font-bold text-sm">Database Record Empty</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
              There are no matching services, scheduled departures, or historic reservations loaded on this viewport.
            </p>
            <button 
              onClick={() => setSimulatedState('success')}
              className="mt-4 px-4 py-1.5 bg-[#0D47A1] hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              Reset to Success
            </button>
          </div>
        );
      }
      if (simulatedState === 'error') {
        return (
          <div className={`h-full w-full flex flex-col items-center justify-center p-6 text-center select-none ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-700'}`}>
            <AlertOctagon className="w-12 h-12 text-red-500 mb-3" />
            <p className="font-bold text-sm text-red-600">Connection Latency Error</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
              A physical signal failure or route database timeout occurred while fetching real-time updates.
            </p>
            <button 
              onClick={() => setSimulatedState('success')}
              className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Sync
            </button>
          </div>
        );
      }
    }

    const commonProps = {
      onNavigate: handleNavigate,
      params: screenParams,
      history,
      saved,
      onAddHistory,
      onAddSaved,
      onRemoveSaved,
      onClearHistory
    };

    switch (currentScreen) {
      case 'splash':
        return <SplashView onFinish={() => handleNavigate('home')} />;
      case 'home':
        return <HomeView {...commonProps} />;
      case 'search-tab':
        return <SearchView {...commonProps} />;
      case 'history-tab':
        return <HistoryView {...commonProps} />;
      case 'settings-tab':
        return <SettingsView onNavigate={handleNavigate} theme={theme} setTheme={setTheme} />;
      
      // NEW CUSTOM SCREENS
      case 'auth':
        return <AuthView onNavigate={handleNavigate} onSuccess={() => handleNavigate('profile')} onCancel={() => handleNavigate('settings-tab')} />;
      case 'profile':
        return <UserProfileView onNavigate={handleNavigate} onSignOut={() => handleNavigate('settings-tab')} />;
      case 'favourites':
        return <FavouritesView onNavigate={handleNavigate} />;
      case 'support':
        return <SupportFeedbackView onNavigate={handleNavigate} initialTab="support" />;
      case 'feedback':
        return <SupportFeedbackView onNavigate={handleNavigate} initialTab="feedback" />;
      case 'about':
        return <AboutVersionView onNavigate={handleNavigate} initialTab="about" />;
      case 'privacy':
        return <AboutVersionView onNavigate={handleNavigate} initialTab="privacy" />;
      
      // EXISTING UTILITIES
      case 'pnr':
        return <PnrView {...commonProps} />;
      case 'live-status':
        return <LiveStatusView {...commonProps} />;
      case 'coach':
        return <CoachPositionView {...commonProps} />;
      case 'platforms':
        return <PlatformLocatorView {...commonProps} />;
      case 'cancelled':
        return <DisruptionUpdatesView {...commonProps} initialType="Cancelled" />;
      case 'rescheduled':
        return <DisruptionUpdatesView {...commonProps} initialType="Rescheduled" />;
      case 'diverted':
        return <DisruptionUpdatesView {...commonProps} initialType="Diverted" />;
      case 'seats':
        return <SeatAvailabilityView {...commonProps} />;
      case 'schedule':
        return <ScheduleView {...commonProps} />;
      case 'fare':
        return <FareEnquiryView {...commonProps} />;
      default:
        return <HomeView {...commonProps} />;
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center w-full max-w-[360px] mx-auto select-none">
      {/* Outer Phone Shell Case */}
      <div className={`relative w-full aspect-[9/18.5] rounded-[44px] shadow-2xl p-3 border-[6px] transition-all duration-300 ring-4 flex flex-col overflow-hidden ${
        isDark 
          ? 'bg-slate-950 border-slate-900 ring-slate-800/80 shadow-indigo-950/20' 
          : 'bg-slate-900 border-slate-800 ring-slate-700/50'
      }`}>
        
        {/* Dynamic Notch / Camera Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="w-8 h-1 bg-slate-900 rounded-full"></div>
        </div>

        {/* Android Top StatusBar */}
        <div className={`h-6 flex justify-between items-center px-6 text-[9px] font-bold z-40 select-none pt-1 transition-colors ${
          isDark ? 'bg-slate-950 text-slate-300' : 'bg-[#0D47A1] text-white'
        }`}>
          <span>10:08 AM</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" />
            <span className="font-mono text-[8px]">5G</span>
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Viewer Frame */}
        <div className={`flex-1 relative flex flex-col overflow-hidden rounded-b-[28px] ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}>
          
          {/* Simulated FCM Push Notification Slide-Down Toast */}
          {toast && (
            <div className="absolute top-2 left-2 right-2 bg-slate-900/95 border border-slate-800 text-white p-3 rounded-xl shadow-lg z-50 flex items-start gap-2.5 animate-bounce select-none pointer-events-auto">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-[10px] font-extrabold truncate">{toast.title}</h4>
                <p className="text-[9px] text-slate-300 mt-0.5 leading-tight">{toast.body}</p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="p-0.5 text-slate-400 hover:text-white rounded-full transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {renderActiveScreen()}
        </div>

        {/* Bottom Navigation Drawer Bar (Do not show on Splash) */}
        {currentScreen !== 'splash' && (
          <div className={`border-t py-2 px-2 flex justify-around items-center rounded-b-[32px] shadow-sm z-40 transition-all ${
            isDark ? 'bg-slate-950 border-slate-900 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <button 
              id="nav-btn-home"
              onClick={() => handleNavigate('home')} 
              className="flex flex-col items-center gap-1 group cursor-pointer flex-1"
            >
              <div className={`w-12 h-6.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                ['home', 'pnr', 'live-status', 'coach', 'platforms', 'cancelled', 'rescheduled', 'diverted', 'about', 'privacy', 'seats', 'schedule', 'fare', 'auth', 'profile', 'favourites', 'support', 'feedback'].includes(currentScreen) 
                  ? 'bg-[#0D47A1] text-white shadow-sm' 
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-extrabold tracking-tight transition-all ${
                ['home', 'pnr', 'live-status', 'coach', 'platforms', 'cancelled', 'rescheduled', 'diverted', 'about', 'privacy', 'seats', 'schedule', 'fare', 'auth', 'profile', 'favourites', 'support', 'feedback'].includes(currentScreen) 
                  ? 'text-[#0D47A1] dark:text-blue-400' 
                  : 'text-slate-400'
              }`}>Home</span>
            </button>

            <button 
              id="nav-btn-search"
              onClick={() => handleNavigate('search-tab')} 
              className="flex flex-col items-center gap-1 group cursor-pointer flex-1"
            >
              <div className={`w-12 h-6.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'search-tab' 
                  ? 'bg-[#0D47A1] text-white shadow-sm' 
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <Search className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-extrabold tracking-tight transition-all ${
                currentScreen === 'search-tab' 
                  ? 'text-[#0D47A1] dark:text-blue-400' 
                  : 'text-slate-400'
              }`}>Search</span>
            </button>

            <button 
              id="nav-btn-history"
              onClick={() => handleNavigate('history-tab')} 
              className="flex flex-col items-center gap-1 group cursor-pointer flex-1"
            >
              <div className={`w-12 h-6.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'history-tab' 
                  ? 'bg-[#0D47A1] text-white shadow-sm' 
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <HistoryIcon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-extrabold tracking-tight transition-all ${
                currentScreen === 'history-tab' 
                  ? 'text-[#0D47A1] dark:text-blue-400' 
                  : 'text-slate-400'
              }`}>History</span>
            </button>

            <button 
              id="nav-btn-settings"
              onClick={() => handleNavigate('settings-tab')} 
              className="flex flex-col items-center gap-1 group cursor-pointer flex-1"
            >
              <div className={`w-12 h-6.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'settings-tab' 
                  ? 'bg-[#0D47A1] text-white shadow-sm' 
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <Settings className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-extrabold tracking-tight transition-all ${
                currentScreen === 'settings-tab' 
                  ? 'text-[#0D47A1] dark:text-blue-400' 
                  : 'text-slate-400'
              }`}>Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* State Switcher Tool panel next to / under phone */}
      <div className={`w-full border rounded-2xl p-3 mt-4 text-center shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Simulated Network Status Previewer</p>
        <div className="flex gap-1.5 justify-center">
          {(['success', 'loading', 'empty', 'error'] as const).map((st) => (
            <button
              id={`state-preview-${st}`}
              key={st}
              onClick={() => setSimulatedState(st)}
              className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg capitalize border shadow-sm transition ${
                simulatedState === st 
                  ? 'bg-[#0D47A1] text-white border-[#0D47A1]' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-250 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
