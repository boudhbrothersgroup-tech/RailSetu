import React, { useState, useEffect } from 'react';
import { 
  Train, PNRStatus, LiveTrainStatus, ClassSeatAvailability, DisruptedTrain, PlatformDetails, SavedItem 
} from '../types';
import { 
  MOCK_TRAINS, MOCK_PNRS, MOCK_LIVE_STATUS, MOCK_SEAT_AVAILABILITY, 
  MOCK_DISRUPTIONS, MOCK_PLATFORMS, MOCK_COACH_LAYOUTS, FARE_BREAKUP_CC, FARE_BREAKUP_EC 
} from '../data/mockData';
import { 
  Search, Train as TrainIcon, HelpCircle, FileText, CheckCircle, RefreshCw, 
  AlertTriangle, Navigation, MapPin, Calendar, Users, Grid, Settings, 
  History, Info, ChevronRight, Bookmark, ArrowRight, Share2, Shield, Trash2, Check, Copy
} from 'lucide-react';
import { railwayRepository } from '../repositories/RailwayRepository';

interface ScreenProps {
  onNavigate: (route: string, params?: any) => void;
  params?: any;
  history: SavedItem[];
  saved: SavedItem[];
  onAddHistory: (item: SavedItem) => void;
  onAddSaved: (item: SavedItem) => void;
  onRemoveSaved: (id: string) => void;
  onClearHistory: () => void;
}

// ==========================================
// CENTRALIZED COMPONENT LOADER AND ERROR HANDLERS
// ==========================================
export const ScreenLoader: React.FC<{ message?: string }> = ({ message = "Querying live Indian Railways servers..." }) => (
  <div className="flex flex-col items-center justify-center p-6 text-center select-none py-10 animate-pulse bg-white rounded-xl border border-slate-100 my-2 shadow-sm">
    <RefreshCw className="w-8 h-8 text-[#0D47A1] animate-spin mb-3" />
    <p className="font-bold text-xs text-slate-700">{message}</p>
    <p className="text-[10px] text-slate-400 mt-1">Establishing direct secure uplink connection...</p>
  </div>
);

export const ScreenError: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center my-2 space-y-2 shadow-sm">
    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
    <h4 className="font-bold text-xs text-red-800">Uplink Gateway Error</h4>
    <p className="text-[10px] text-red-600/95 leading-normal max-w-xs mx-auto">{error}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="mt-2.5 px-3 py-1 bg-white hover:bg-slate-50 text-red-700 border border-red-200 rounded-md text-[10px] font-bold shadow-xs transition"
      >
        Retry Uplink
      </button>
    )}
  </div>
);


// ==========================================
// 1. SPLASH VIEW
// ==========================================
export const SplashView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-full bg-[#0D47A1] flex flex-col items-center justify-between p-8 text-white select-none relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#FF9800]/10 rounded-full blur-2xl"></div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Animated App Icon */}
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 relative animate-pulse">
          <TrainIcon className="w-14 h-14 text-[#0D47A1]" />
          <div className="absolute -bottom-1 right-2 px-1.5 py-0.5 bg-[#FF9800] text-[8px] font-extrabold text-white rounded-md tracking-wider">
            SETU
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-wider mb-2 font-sans">
          RailSetu
        </h1>
        <p className="text-blue-100 text-xs text-center font-mono tracking-tight">
          Your Indian Railways Commute Companion
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        {/* Loader */}
        <div className="flex space-x-1.5 justify-center items-center">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#FF9800] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <div className="text-center">
          <p className="text-[10px] text-blue-200/80 font-mono">INFORMATION-ONLY • NO ADS</p>
          <p className="text-[9px] text-blue-200/60 mt-0.5">Material 3 • Indian Railways</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. HOME VIEW
// ==========================================
export const HomeView: React.FC<ScreenProps> = ({ onNavigate }) => {
  const menuItems = [
    { label: 'PNR Status', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-100', route: 'pnr' },
    { label: 'Live Train', icon: MapPin, color: 'bg-orange-50 text-orange-700 border-orange-100', route: 'live-status' },
    { label: 'Train Schedule', icon: Calendar, color: 'bg-teal-50 text-teal-700 border-teal-100', route: 'schedule' },
    { label: 'Seat Availability', icon: Users, color: 'bg-indigo-50 text-indigo-700 border-indigo-100', route: 'seats' },
    { label: 'Fare Enquiry', icon: HelpCircle, color: 'bg-green-50 text-green-700 border-green-100', route: 'fare' },
    { label: 'Coach Position', icon: Grid, color: 'bg-purple-50 text-purple-700 border-purple-100', route: 'coach' },
    { label: 'Platform Finder', icon: Navigation, color: 'bg-amber-50 text-amber-700 border-amber-100', route: 'platforms' },
    { label: 'Cancelled Trains', icon: AlertTriangle, color: 'bg-red-50 text-red-700 border-red-100', route: 'cancelled' },
    { label: 'Diverted Trains', icon: RefreshCw, color: 'bg-zinc-50 text-zinc-700 border-zinc-100', route: 'diverted' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* AppBar */}
      <div className="bg-[#0D47A1] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <TrainIcon className="w-5 h-5 text-white" />
          <span className="font-bold text-lg font-sans tracking-wide">RailSetu</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('about')}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Flag Stripes */}
      <div className="h-1 bg-gradient-to-r from-[#0D47A1] via-white to-[#FF9800]"></div>

      {/* Body Content */}
      <div className="p-4 space-y-4">
        {/* Custom greeting panel */}
        <div className="bg-gradient-to-br from-blue-900 to-[#0D47A1] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/5 rounded-full"></div>
          <p className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold">National Transit Helper</p>
          <h2 className="text-lg font-bold mt-1">Hello Passenger!</h2>
          <p className="text-xs text-blue-100/80 mt-1 leading-relaxed">
            Welcome to the direct, clean Indian Railways information board. Safe travels!
          </p>
          <div className="mt-3 flex gap-2">
            <span className="px-2 py-0.5 bg-white/10 text-[9px] font-mono rounded-full border border-white/10">No Login</span>
            <span className="px-2 py-0.5 bg-white/10 text-[9px] font-mono rounded-full border border-white/10">No Ads</span>
          </div>
        </div>

        {/* Dynamic Search Box Shortcut */}
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF9800]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Quick Train Search</p>
              <p className="text-[10px] text-slate-400">Search routes between stations</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('search-tab')} 
            className="text-xs bg-[#0D47A1] text-white px-3 py-1.5 rounded-lg font-medium shadow-sm hover:bg-blue-800 transition"
          >
            Go to Search
          </button>
        </div>

        {/* Feature Grid Section */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Railway Utilities</p>
          <div className="grid grid-cols-3 gap-2">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate(item.route)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 bg-white hover:shadow-md transition duration-200 group`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Safety Alert Banner */}
        <div className="bg-[#FF9800]/10 border border-[#FF9800]/20 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-[#FF9800]">Official Commuter Guideline</p>
            <p className="text-[9px] text-slate-600 mt-0.5 leading-snug">
              Always double-check platform numbers with the station audio announcers as sudden operational switches can occur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. SEARCH VIEW
// ==========================================
export const SearchView: React.FC<ScreenProps> = ({ onNavigate, onAddHistory }) => {
  const [fromCode, setFromCode] = useState('NDLS');
  const [toCode, setToCode] = useState('BSB');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!fromCode.trim() || !toCode.trim()) {
      setError('Please provide both FROM and TO station codes.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await railwayRepository.searchTrains(fromCode, toCode, '2026-07-20');
      setResults(data);

      onAddHistory({
        id: `hist-${Date.now()}`,
        type: 'search',
        title: `${fromCode.toUpperCase()} to ${toCode.toUpperCase()}`,
        subtitle: `Found ${data.length} live trains`,
        timestamp: new Date().toISOString(),
        payload: { from: fromCode.toUpperCase(), to: toCode.toUpperCase() }
      });
    } catch (err: any) {
      setError('Railway information is currently unavailable. Please try again later.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <Search className="w-5 h-5 text-orange-400" />
        <span className="font-bold text-lg font-sans">Search Trains</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Form Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm relative">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase">From Station</label>
              <input 
                type="text" 
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value.toUpperCase())}
                placeholder="Station Code e.g. NDLS"
                className="font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm mt-1 focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1 z-10">
              <button 
                onClick={handleSwap}
                className="w-8 h-8 bg-[#FF9800] text-white rounded-full flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-md border-2 border-white"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase">To Station</label>
              <input 
                type="text" 
                value={toCode}
                onChange={(e) => setToCode(e.target.value.toUpperCase())}
                placeholder="Station Code e.g. BSB"
                className="font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm mt-1 focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>

            <button 
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-[#0D47A1] hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-lg text-xs mt-2 shadow transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              {loading ? 'Searching live servers...' : 'Search Trains Between Stations'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && <ScreenLoader message={`Searching trains from ${fromCode} to ${toCode}...`} />}

        {/* Error Block */}
        {error && <ScreenError error={error} onRetry={handleSearch} />}

        {/* Results Container */}
        {!loading && !error && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              {searched ? 'Train Services Found' : 'Suggested Routes'}
            </p>

            <div className="space-y-2.5">
              {(searched ? results : MOCK_TRAINS).map((train, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:border-blue-200 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-[#0D47A1]/5 text-[#0D47A1] text-[9px] font-mono px-2 py-0.5 rounded-full border border-[#0D47A1]/10">
                      {train.number}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800 mt-1">{train.name}</h3>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-tight text-[#FF9800] px-1.5 py-0.5 bg-orange-50 rounded border border-orange-100">
                    {train.type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 items-center mt-3 py-1.5 bg-slate-50 rounded-lg px-2 text-center text-slate-600">
                  <div>
                    <p className="font-bold text-xs text-slate-800">{train.departureTime}</p>
                    <p className="text-[9px] text-slate-400">{train.fromCode}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 leading-none">{train.duration}</span>
                    <div className="w-12 h-[1.5px] bg-slate-300 relative my-1">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#FF9800] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-800">{train.arrivalTime}</p>
                    <p className="text-[9px] text-slate-400">{train.toCode}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 text-[10px]">
                  <div className="flex gap-1">
                    {train.classes.map((cls, cIdx) => (
                      <span key={cIdx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-bold text-[9px]">
                        {cls}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => onNavigate('seats', { trainNumber: train.number })}
                      className="text-xs text-[#0D47A1] hover:underline font-bold"
                    >
                      Check Seats
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                      onClick={() => onNavigate('live-status', { trainNumber: train.number })}
                      className="text-xs text-[#FF9800] hover:underline font-bold"
                    >
                      Live Track
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {searched && results.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <AlertTriangle className="w-8 h-8 text-[#FF9800] mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No trains running direct route</p>
                <p className="text-[10px] mt-1">Please try standard Indian Railways codes e.g. NDLS or BSB</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

// ==========================================
// 4. HISTORY VIEW
// ==========================================
export const HistoryView: React.FC<ScreenProps> = ({ history, saved, onNavigate, onClearHistory }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-orange-400" />
          <span className="font-bold text-lg font-sans">History & Saved</span>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded border border-white/10 transition"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Saved Items */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            Starred Trains & Bookmarks ({saved.length})
          </p>
          <div className="space-y-2">
            {saved.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  if (item.type === 'train') {
                    onNavigate('seats', { trainNumber: item.payload?.number });
                  } else if (item.type === 'pnr') {
                    onNavigate('pnr', { pnr: item.payload?.pnr });
                  }
                }}
                className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:border-blue-200 transition cursor-pointer flex justify-between items-center"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-orange-50 text-[#FF9800] rounded-lg flex items-center justify-center shrink-0">
                    {item.type === 'pnr' ? <FileText className="w-4 h-4" /> : <TrainIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}

            {saved.length === 0 && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 text-center text-slate-400">
                <Bookmark className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs">No starred entries yet</p>
                <p className="text-[9px] mt-0.5">Click star icon while viewing PNR or seat statuses</p>
              </div>
            )}
          </div>
        </div>

        {/* History Items */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-500" />
            Recent Searches & Queries
          </p>
          <div className="space-y-2">
            {history.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:border-slate-200 transition flex justify-between items-center"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-slate-400">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {history.length === 0 && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 text-center text-slate-400">
                <History className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs">No query logs found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SETTINGS VIEW
// ==========================================
export const SettingsView: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <Settings className="w-5 h-5 text-orange-400" />
        <span className="font-bold text-lg font-sans">Settings & Help</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card Mock */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-[#0D47A1] rounded-full flex items-center justify-center font-extrabold text-sm">
            RS
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800">RailSetu Mobile Client</h3>
            <p className="text-[10px] text-slate-400">Version 1.0.0 (Stable Release)</p>
            <span className="inline-block mt-1 bg-green-50 text-green-700 border border-green-100 font-semibold px-2 py-0.5 text-[8px] rounded-full font-mono uppercase">
              Offline Database Sync
            </span>
          </div>
        </div>

        {/* Option Sections */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
          <div className="p-3 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            General Configuration
          </div>
          <div className="flex justify-between items-center p-3.5 hover:bg-slate-50 transition cursor-pointer">
            <div className="flex items-center gap-3 text-slate-700">
              <span className="text-xs font-semibold">Language / भाषा</span>
            </div>
            <span className="text-xs text-[#0D47A1] font-bold">English (US)</span>
          </div>
          <div className="flex justify-between items-center p-3.5 hover:bg-slate-50 transition cursor-pointer">
            <div className="flex items-center gap-3 text-slate-700">
              <span className="text-xs font-semibold">Offline Train Cache</span>
            </div>
            <span className="text-xs text-emerald-600 font-bold">Active (14 MB)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
          <div className="p-3 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            App Information
          </div>
          <div 
            onClick={() => onNavigate('about')}
            className="flex justify-between items-center p-3.5 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <span className="text-xs font-semibold">About RailSetu</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
          <div 
            onClick={() => onNavigate('privacy')}
            className="flex justify-between items-center p-3.5 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <span className="text-xs font-semibold">Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-100 rounded-xl p-3 text-center border border-slate-200">
          <p className="text-[10px] text-slate-400 leading-normal">
            RailSetu matches offline timetable data provided by CRIS (Center for Railway Information Systems) cached dynamically for user safety.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. PNR STATUS SCREEN
// ==========================================
export const PnrView: React.FC<ScreenProps> = ({ params, onNavigate, onAddSaved, saved }) => {
  const [pnrInput, setPnrInput] = useState(params?.pnr || '');
  const [activePnr, setActivePnr] = useState<PNRStatus | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performPnrQuery = async (pnrVal: string) => {
    const cleanPnr = pnrVal.trim().replace(/\D/g, '');
    if (cleanPnr.length !== 10) {
      setError('Invalid PNR Number: PNR must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await railwayRepository.getPnrStatus(cleanPnr);
      setActivePnr(data);
    } catch (err: any) {
      setError('Railway information is currently unavailable. Please try again later.');
      setActivePnr(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.pnr) {
      setPnrInput(params.pnr);
      performPnrQuery(params.pnr);
    }
  }, [params]);

  const handleSearch = () => {
    performPnrQuery(pnrInput);
  };

  const handleStar = () => {
    if (!activePnr) return;
    const isSaved = saved.some(s => s.payload?.pnr === activePnr.pnr);
    if (!isSaved) {
      onAddSaved({
        id: `save-${Date.now()}`,
        type: 'pnr',
        title: `PNR: ${activePnr.pnr}`,
        subtitle: `${activePnr.trainName}`,
        timestamp: new Date().toISOString(),
        payload: { pnr: activePnr.pnr }
      });
    }
  };

  const isSaved = activePnr ? saved.some(s => s.payload?.pnr === activePnr.pnr) : false;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
            Back
          </button>
          <span className="font-bold text-sm font-sans">PNR Status Checker</span>
        </div>
        {activePnr && (
          <button onClick={handleStar} className={`p-1 rounded-full ${isSaved ? 'text-yellow-400' : 'text-white'}`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-yellow-400' : ''}`} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex gap-2">
          <input 
            type="text" 
            maxLength={10}
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 10-digit Passenger PNR"
            className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-blue-500 border border-slate-200"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#0D47A1] disabled:bg-blue-400 text-white px-4 py-2 text-xs font-bold rounded-lg hover:bg-blue-800"
          >
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && <ScreenLoader message={`Contacting central CRIS servers for PNR ${pnrInput}...`} />}

        {/* Error Block */}
        {error && <ScreenError error={error} onRetry={handleSearch} />}

        {searched && !loading && !error && activePnr ? (
          <div className="space-y-3">
            {/* Header Train Detail Card */}
            <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-blue-50 text-[#0D47A1] border border-blue-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                    Train {activePnr.trainNumber}
                  </span>
                  <h3 className="font-extrabold text-xs text-slate-800 mt-1">{activePnr.trainName}</h3>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded">
                  {activePnr.chartStatus}
                </span>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500">
                <div>
                  <p>Boarding Point</p>
                  <p className="font-bold text-slate-700">{activePnr.boarding}</p>
                </div>
                <div>
                  <p>Date of Journey</p>
                  <p className="font-bold text-slate-700">{activePnr.dateOfJourney}</p>
                </div>
                <div>
                  <p>Travel Class</p>
                  <p className="font-bold text-slate-700">{activePnr.class}</p>
                </div>
                <div>
                  <p>PNR ID</p>
                  <p className="font-mono font-bold text-[#FF9800]">{activePnr.pnr}</p>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Passengers Booking Logs</p>
              <div className="space-y-2">
                {activePnr.passengers.map((passenger, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-2.5 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-[10px]">
                        {passenger.number}
                      </div>
                      <span className="font-semibold text-slate-700">Passenger {passenger.number}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Booking: {passenger.bookingStatus}</p>
                      <p className="font-bold text-emerald-600 mt-0.5">Current: {passenger.currentStatus}</p>
                      {passenger.coach && (
                        <span className="inline-block mt-0.5 bg-slate-200 px-1.5 py-0.5 text-[8px] rounded font-bold">
                          {passenger.coach} / {passenger.berth}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach Layout Link */}
            <button 
              onClick={() => onNavigate('coach', { trainNumber: activePnr.trainNumber })}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
            >
              <Grid className="w-4 h-4 text-slate-500" />
              View Coach Layout Composition
            </button>
          </div>
        ) : searched ? (
          <div className="text-center py-8 text-slate-400 bg-white rounded-xl border">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Invalid PNR format</p>
            <p className="text-[10px]">Please ensure you type the exact 10 digit registry code.</p>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed p-6">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">PNR Reservation Terminal</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
              Enter your ticket's 10-digit number above to check reservation confirmation probability and real-time berth updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 7. LIVE TRACKING STATUS VIEW
// ==========================================
export const LiveStatusView: React.FC<ScreenProps> = ({ params, onNavigate }) => {
  const [trainNum, setTrainNum] = useState(params?.trainNumber || '');
  const [liveData, setLiveData] = useState<LiveTrainStatus | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performTrackingQuery = async (trainNo: string) => {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    if (cleanTrain.length !== 5) {
      setError('Invalid Train Number: Train number must be exactly 5 digits.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await railwayRepository.getLiveTrainStatus(cleanTrain);
      setLiveData(data);
    } catch (err: any) {
      setError('Railway information is currently unavailable. Please try again later.');
      setLiveData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.trainNumber) {
      setTrainNum(params.trainNumber);
      performTrackingQuery(params.trainNumber);
    }
  }, [params]);

  const handleTrack = () => {
    performTrackingQuery(trainNum);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">Live Train Tracking (GPS)</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Track Form */}
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex gap-2">
          <input 
            type="text" 
            value={trainNum}
            onChange={(e) => setTrainNum(e.target.value)}
            placeholder="Train Number (e.g. 22436)"
            className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500 border border-slate-200"
          />
          <button 
            onClick={handleTrack}
            disabled={loading}
            className="bg-[#0D47A1] disabled:bg-blue-400 text-white px-4 py-2 text-xs font-bold rounded-lg hover:bg-blue-800"
          >
            {loading ? 'Locating...' : 'Locate'}
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && <ScreenLoader message={`Pinging GPS transponder on Train ${trainNum}...`} />}

        {/* Error Block */}
        {error && <ScreenError error={error} onRetry={handleTrack} />}

        {searched && !loading && !error && liveData ? (
          <div className="space-y-3">
            {/* Delay Info Board */}
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${liveData.delayMinutes > 0 ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
              {liveData.delayMinutes > 0 ? <AlertTriangle className="w-5 h-5 text-[#FF9800] shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              <div>
                <h4 className="font-extrabold text-xs">
                  {liveData.delayMinutes > 0 ? `Delayed by ${liveData.delayMinutes} mins` : 'On Time'}
                </h4>
                <p className="text-[10px] text-slate-600 mt-0.5">{liveData.headingText}</p>
                <p className="text-[8px] font-mono mt-1 text-slate-400">Last updated: {liveData.lastUpdated}</p>
              </div>
            </div>

            {/* Visual Route Timeline */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Journey Path Timeline</p>
              <div className="space-y-4 relative pl-5">
                {/* Timeline Line */}
                <div className="absolute left-1.5 top-2.5 bottom-2.5 w-[2px] bg-slate-200"></div>

                {liveData.route.map((station, idx) => {
                  const isPassed = station.status === 'Passed';
                  const isCurrent = station.status === 'Current' || station.status === 'Arrived';
                  
                  return (
                    <div key={idx} className="relative flex justify-between items-start text-xs">
                      {/* Circle Indicator on line */}
                      <div className={`absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${isPassed ? 'bg-blue-600' : isCurrent ? 'bg-[#FF9800] animate-pulse' : 'bg-slate-300'}`}>
                        {isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>

                      <div>
                        <h4 className={`font-bold text-xs ${isCurrent ? 'text-[#FF9800]' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                          {station.stationName} ({station.stationCode})
                        </h4>
                        <div className="flex gap-2 text-[9px] text-slate-400 mt-0.5">
                          <span>Sch Dep: {station.scheduledDeparture}</span>
                          <span>•</span>
                          <span>Plat: {station.platform}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isCurrent ? 'bg-orange-50 text-orange-700 border border-orange-100' : isPassed ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {station.status}
                        </span>
                        {station.delayMinutes > 0 && (
                          <p className="text-[8px] text-[#FF9800] font-bold mt-1">+{station.delayMinutes}m delay</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : searched ? (
          <div className="text-center py-8 text-slate-400">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs">No tracker details found</p>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed p-6">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">GPS Tracker Terminal</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
              Track any operational Indian Railways train via direct mock GPS coordinates. Try train number 22436 for detailed logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 8. COCH POSITION VIEW
// ==========================================
export const CoachPositionView: React.FC<ScreenProps> = ({ params, onNavigate }) => {
  const [trainNum, setTrainNum] = useState(params?.trainNumber || '22436');
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachPosition = async (num: string) => {
    const cleanTrain = num.trim().replace(/\D/g, '');
    if (!cleanTrain) {
      setError('Invalid Train Number.');
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedCoach(null);
    try {
      const data = await railwayRepository.getCoachPosition(cleanTrain);
      setCoaches(data?.coaches || []);
    } catch (err: any) {
      setError('Railway information is currently unavailable. Please try again later.');
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachPosition(trainNum);
  }, [trainNum]);

  const handleRetry = () => {
    fetchCoachPosition(trainNum);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">Coach Position Finder</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Form Selector */}
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Train Number</label>
          <div className="flex gap-2">
            <select 
              value={trainNum} 
              onChange={(e) => {
                setTrainNum(e.target.value);
              }}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="22436">22436 - NDLS BSB VANDE BHARAT EXP</option>
              <option value="12424">12424 - NDLS DBRT RAJDHANI</option>
              <option value="DEFAULT">Other Standard Express Train</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && <ScreenLoader message={`Evaluating route coach position layout for Train ${trainNum}...`} />}

        {/* Error Block */}
        {error && <ScreenError error={error} onRetry={handleRetry} />}

        {/* Visual Train Rake Layout */}
        {!loading && !error && coaches && coaches.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
            <div>
              <h3 className="font-bold text-xs text-slate-700">Train Composition Map</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">Scroll horizontally to view coach layouts. Click any coach to inspect berth distribution.</p>
            </div>

            {/* Scrolling coaches layout */}
            <div className="flex gap-1.5 overflow-x-auto py-3 px-1 border-y border-slate-100 scrollbar-none">
              {coaches.map((coach, idx) => {
                const isEngine = coach === 'ENG';
                const isSelected = selectedCoach === `${coach}-${idx}`;

                return (
                  <button
                    key={idx}
                    onClick={() => !isEngine && setSelectedCoach(`${coach}-${idx}`)}
                    className={`w-14 h-12 rounded-lg border-2 flex flex-col items-center justify-center shrink-0 transition-all ${
                      isEngine 
                        ? 'bg-slate-700 border-slate-800 text-white font-black text-[9px] rounded-r-2xl' 
                        : isSelected
                        ? 'bg-[#FF9800] border-[#FF9800] text-white font-extrabold shadow-md transform -translate-y-0.5'
                        : 'bg-blue-50 border-blue-100 text-blue-800 hover:border-blue-400 hover:bg-blue-100'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold">{coach}</span>
                    {!isEngine && <span className="text-[7px] opacity-70">Car {idx}</span>}
                  </button>
                );
              })}
            </div>

            {/* Engine Direction Pointer */}
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tight px-1">
              <span>◀ Left (Rear Guard)</span>
              <span className="text-[#FF9800]">◀ ENGINE DIRECTION</span>
              <span>Right (Front) ▶</span>
            </div>
          </div>
        )}

        {/* Seat / Berth Map Detail Card */}
        {!loading && !error && coaches && coaches.length > 0 && (
          selectedCoach ? (
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-orange-50 border border-orange-100 text-[#FF9800] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  Coach: {selectedCoach.split('-')[0]}
                </span>
                <p className="text-[10px] text-slate-400 font-mono">Seat Matrix Overview</p>
              </div>

              {/* Berth layouts */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded border text-xs">
                  <p className="font-extrabold text-slate-700">Lower</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Berth 1, 4, 9...</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border text-xs">
                  <p className="font-extrabold text-slate-700">Middle</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Berth 2, 5, 10...</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border text-xs">
                  <p className="font-extrabold text-slate-700">Upper</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Berth 3, 6, 11...</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border text-xs">
                  <p className="font-extrabold text-slate-700">Side</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Berth 7, 8...</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-[10px] text-slate-600 leading-normal">
                <strong>Coach specifications:</strong> Modern coaches host standard ergonomic berth matrices with premium emergency exit indicators.
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed p-6 text-center text-slate-400">
              <Grid className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs">Select any coach car block in the map above to view seat configuration metrics</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// ==========================================
// 9. PLATFORM LOCATOR SCREEN
// ==========================================
export const PlatformLocatorView: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlatformDetails[]>(MOCK_PLATFORMS);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (!val) {
      setResults(MOCK_PLATFORMS);
      return;
    }
    const filtered = MOCK_PLATFORMS.filter(
      p => p.stationName.toLowerCase().includes(val.toLowerCase()) || 
           p.trainNumber.includes(val) || 
           p.trainName.toLowerCase().includes(val.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">Platform Locator</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Search station input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by Station name or Train No."
            className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Info text */}
        <div className="text-[10px] text-slate-400 leading-normal bg-white p-3 rounded-xl border border-slate-100">
          📍 platform finder records expected platform allocations based on historical data. Verify physical platform screens once inside the station.
        </div>

        {/* Results */}
        <div className="space-y-2">
          {results.map((plat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{plat.trainName}</h4>
                  <p className="text-[9px] text-slate-400 font-mono">Train Number {plat.trainNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400">Station Code</p>
                  <p className="text-[10px] font-extrabold text-slate-700">{plat.stationCode} ({plat.stationName})</p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-[9px] text-slate-400">Expected Platform</p>
                  <span className="inline-block mt-0.5 bg-[#FF9800] text-white font-extrabold px-3 py-1 text-xs rounded-lg">
                    Platform {plat.expectedPlatform}
                  </span>
                </div>
                <div className="text-right text-[10px]">
                  <p className="text-slate-500 font-medium">Scheduled Arrival: <strong className="text-slate-800">{plat.arrivalTime}</strong></p>
                  <p className="text-slate-500 font-medium">Scheduled Depart: <strong className="text-slate-800">{plat.departureTime}</strong></p>
                </div>
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-white border rounded-xl">
              <p className="text-xs font-semibold">No platform data loaded</p>
              <p className="text-[9px]">Try searching "New Delhi" or "22436"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. DISRUPTION UPDATES (CANCELLED, RESCHEDULED, DIVERTED)
// ==========================================
export const DisruptionUpdatesView: React.FC<ScreenProps & { initialType: 'Cancelled' | 'Rescheduled' | 'Diverted' }> = ({ onNavigate, initialType }) => {
  const [activeTab, setActiveTab] = useState<'Cancelled' | 'Rescheduled' | 'Diverted'>(initialType);

  const filtered = MOCK_DISRUPTIONS.filter(d => d.type === activeTab);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">Railway Disruptions Board</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-white border-b border-slate-100 text-xs text-center font-bold">
        {(['Cancelled', 'Rescheduled', 'Diverted'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 transition-colors ${activeTab === tab ? 'text-[#0D47A1] border-b-2 border-[#0D47A1]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {filtered.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-red-50 text-red-700 border border-red-100 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                  {item.trainNumber}
                </span>
                <h4 className="font-extrabold text-xs text-slate-800 mt-1">{item.trainName}</h4>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                item.type === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                item.type === 'Rescheduled' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-zinc-100 text-zinc-700 border border-zinc-200'
              }`}>
                {item.type}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-2.5 text-[10px] text-slate-600 leading-normal">
              <strong>Update Details:</strong> {item.details}
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-400">
              <span>Operational Date: {item.date}</span>
              <span>Division: IR Northern Zone</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No {activeTab} Records</p>
            <p className="text-[10px] mt-1">Schedules are fully regular across prime paths today.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 11. ABOUT VIEW
// ==========================================
export const AboutView: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">About RailSetu</span>
      </div>

      <div className="p-6 flex flex-col items-center justify-between flex-1 text-slate-600">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-[#0D47A1] shadow-inner">
            <TrainIcon className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">RailSetu</h2>
            <p className="text-xs text-slate-400 mt-0.5">Version 1.0.0 (Stable Release)</p>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
            RailSetu is a dedicated, zero-ad information companion built exclusively for Indian Railways commuters. It gathers train timetables, expected platform locations, and PNR registry probability checks without requiring cellular accounts or signups.
          </p>
        </div>

        <div className="w-full space-y-3 mt-6">
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Open Source Core</span>
            <span className="text-slate-400 font-mono">v1.0.0</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Zero-Ad Guarantee</span>
            <span className="text-emerald-600 font-bold">Verified</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Offline Timetables</span>
            <span className="text-[#0D47A1] font-bold">Enabled</span>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 mt-8 text-center font-mono">
          © 2026 RailSetu. Built for Indian Railways commuters.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 12. PRIVACY POLICY VIEW
// ==========================================
export const PrivacyPolicyView: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">Privacy Policy</span>
      </div>

      <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
        <div className="flex items-center gap-2 text-[#0D47A1]">
          <Shield className="w-5 h-5" />
          <h3 className="font-extrabold text-sm uppercase">Privacy Shield Assured</h3>
        </div>

        <p>
          At RailSetu, we believe your personal location records and transit schedules should remain completely private to you. 
        </p>

        <div className="space-y-3">
          <div className="bg-white border border-slate-100 p-3 rounded-lg">
            <h4 className="font-bold text-slate-800 text-[11px] mb-1">1. Zero Cloud Data Collection</h4>
            <p className="text-[10px] text-slate-500">
              RailSetu does not send your searched PNR numbers or tracked train stations to external cloud registers. Every trace matches inside local sandbox environments.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-3 rounded-lg">
            <h4 className="font-bold text-slate-800 text-[11px] mb-1">2. Local History Cache</h4>
            <p className="text-[10px] text-slate-500">
              History searches are saved exclusively on your local device cache and can be completely wiped out instantly using the "Clear History" button in the history manager.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-3 rounded-lg">
            <h4 className="font-bold text-slate-800 text-[11px] mb-1">3. Third-party integrations</h4>
            <p className="text-[10px] text-slate-500">
              We contain no advertisement kits or analytic trackers from Google or Meta. Rest easy knowing your session data belongs strictly to your smartphone.
            </p>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 mt-6 text-center">
          Effective date: July 2026 • RailSetu Security Group
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 13. SEAT AVAILABILITY SCREEN
// ==========================================
export const SeatAvailabilityView: React.FC<ScreenProps> = ({ params, onNavigate, onAddSaved, saved }) => {
  const [trainNum, setTrainNum] = useState(params?.trainNumber || '22436');
  const [selectedClass, setSelectedClass] = useState('CC');
  const [availabilityData, setAvailabilityData] = useState<ClassSeatAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeats = async () => {
    const cleanTrain = trainNum.trim().replace(/\D/g, '');
    if (cleanTrain.length !== 5) {
      setError('Invalid Train Number: Train number must be exactly 5 digits.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch availability for the specified train between standard route nodes (NDLS and BSB) for July 25th 2026 journey
      const data = await railwayRepository.checkSeatAvailability(cleanTrain, 'NDLS', 'BSB', '2026-07-25', selectedClass);
      setAvailabilityData(data);
    } catch (err: any) {
      setError('Railway information is currently unavailable. Please try again later.');
      setAvailabilityData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [trainNum, selectedClass]);

  const handleStar = () => {
    const isSaved = saved.some(s => s.payload?.number === trainNum);
    if (!isSaved) {
      onAddSaved({
        id: `save-${Date.now()}`,
        type: 'train',
        title: `${trainNum} - Seat Checking`,
        subtitle: `Class: ${selectedClass}`,
        timestamp: new Date().toISOString(),
        payload: { number: trainNum }
      });
    }
  };

  const isSaved = saved.some(s => s.payload?.number === trainNum);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
            Back
          </button>
          <span className="font-bold text-sm font-sans">Seat Availability</span>
        </div>
        <button onClick={handleStar} className={`p-1 rounded-full ${isSaved ? 'text-yellow-400' : 'text-white'}`}>
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-yellow-400' : ''}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Selection Details */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Selected Train Number</label>
            <input 
              type="text"
              maxLength={5}
              value={trainNum}
              onChange={(e) => setTrainNum(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 22436"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 mt-1 text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Travel Class</label>
            <div className="flex gap-1.5 mt-1">
              {['CC', 'EC', '1A', '2A', '3A', 'SL'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${selectedClass === cls ? 'bg-[#0D47A1] text-white border-[#0D47A1]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && <ScreenLoader message={`Querying IRCTC GNWL quotas for Train ${trainNum}...`} />}

        {/* Error Block */}
        {error && <ScreenError error={error} onRetry={fetchSeats} />}

        {/* Seat Listing Calendar Grid */}
        {!loading && !error && availabilityData && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Weekly Availability Logs</p>
            
            {availabilityData.availability.map((status, idx) => {
              const isAvail = status.status.toUpperCase().includes('AVAILABLE');
              const isWL = status.status.toUpperCase().includes('WL') || status.status.toUpperCase().includes('REGRET') || status.status.toUpperCase().includes('WL');
              
              return (
                <div key={idx} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-slate-700">{status.date}</h4>
                    <p className="text-[9px] text-slate-400">Class {selectedClass} • General Quota (GN)</p>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isAvail ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : isWL ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {status.status}
                    </span>
                    <div className="flex gap-1.5 text-[8px] font-mono text-slate-400 mt-1">
                      <span>Fare: ₹{status.fare}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-600">Conf: {status.probability || 'High'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fare Enquiry Link shortcut */}
        <button 
          onClick={() => onNavigate('fare', { trainNumber: trainNum, selectedClass })}
          className="w-full bg-[#FF9800]/10 hover:bg-orange-100 text-[#FF9800] border border-orange-200 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 mt-4"
        >
          <HelpCircle className="w-4 h-4 text-[#FF9800]" />
          View Detailed Pricing Fare Breakdown
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 14. FARE ENQUIRY VIEW
// ==========================================
export const FareEnquiryView: React.FC<ScreenProps> = ({ params, onNavigate }) => {
  const [trainNum, setTrainNum] = useState(params?.trainNumber || '22436');
  const [selectedClass, setSelectedClass] = useState(params?.selectedClass || 'CC');
  const [fareData, setFareData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFare = async () => {
    const cleanTrain = trainNum.trim().replace(/\D/g, '');
    if (cleanTrain.length !== 5) {
      setError('Invalid Train Number: Train number must be exactly 5 digits.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await railwayRepository.getFareEnquiry(cleanTrain, 'NDLS', 'BSB', selectedClass);
      setFareData(data);
    } catch (err: any) {
      setError('Railway information is currently unavailable. Please try again later.');
      setFareData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFare();
  }, [trainNum, selectedClass]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">Fare Calculator Board</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Selection card */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pricing Configuration</span>
            <span className="text-[10px] font-bold text-[#FF9800]">IR Standardized</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Train Number</p>
              <input 
                type="text"
                maxLength={5}
                value={trainNum} 
                onChange={(e) => setTrainNum(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 22436"
                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-2 text-xs font-mono font-bold mt-1"
              />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Coach Class</p>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-2 text-xs font-bold mt-1 font-sans"
              >
                <option value="CC">CC (Chair Car)</option>
                <option value="EC">EC (Executive)</option>
                <option value="1A">1A (First AC)</option>
                <option value="2A">2A (Second AC)</option>
                <option value="3A">3A (Third AC)</option>
                <option value="SL">SL (Sleeper Class)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && <ScreenLoader message={`Evaluating route tariff matrices for Train ${trainNum}...`} />}

        {/* Error Block */}
        {error && <ScreenError error={error} onRetry={fetchFare} />}

        {/* Receipt table */}
        {!loading && !error && fareData && (
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-xs font-bold text-slate-700">Detailed Pricing Invoice Breakup</p>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Base Fare Charge</span>
                <span>₹{fareData.baseFare}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Superfast Surcharge</span>
                <span>₹{fareData.superfastCharge}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Reservation Allocation Fee</span>
                <span>₹{fareData.reservationFee}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>CRIS Catering Service</span>
                <span>₹{fareData.cateringCharge}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST Tax (5% AC Service)</span>
                <span>₹{fareData.gst}</span>
              </div>
              
              <div className="h-[1px] bg-slate-100 my-2"></div>
              
              <div className="flex justify-between font-extrabold text-slate-800 text-sm">
                <span>Total Ticket Price</span>
                <span className="text-[#0D47A1]">₹{fareData.total}</span>
              </div>
            </div>
          </div>
        )}

        {/* Warning notification */}
        <div className="p-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[9px] leading-normal font-medium">
          ⚠️ Catering charges can vary on optional basis. Ensure to toggle the food opt-out button on the physical boarding counter to waive catering fees.
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 15. TRAIN SCHEDULE VIEW
// ==========================================
export const ScheduleView: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [trainNoInput, setTrainNoInput] = useState('22436');
  const [activeSchedule, setActiveSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchSchedule = async (trainNum: string) => {
    const cleanTrain = trainNum.trim().replace(/\D/g, '');
    if (cleanTrain.length !== 5) {
      setError('Invalid Train Number: Train number must be exactly 5 digits.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await railwayRepository.getTrainSchedule(cleanTrain);
      setActiveSchedule(data);
    } catch (err: any) {
      setError('Railway information is currently unavailable. Please try again later.');
      setActiveSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule('22436');
  }, []);

  const handleGetTable = () => {
    fetchSchedule(trainNoInput);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="font-bold text-xs bg-white/10 px-2 py-1 rounded">
          Back
        </button>
        <span className="font-bold text-sm font-sans">Operational Schedule</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Placeholder / Search Box */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center space-y-3">
          <Calendar className="w-10 h-10 text-[#0D47A1] mx-auto" />
          <h3 className="font-bold text-xs text-slate-800">Check Stops & Operating Days</h3>
          <p className="text-[10px] text-slate-400">Search stop-by-stop station arrival matrices and halt timings live from central registry.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              maxLength={5}
              placeholder="Enter Train Number (e.g. 22436)"
              value={trainNoInput}
              onChange={(e) => setTrainNoInput(e.target.value.replace(/\D/g, ''))}
              className="flex-1 bg-slate-50 border border-slate-200 text-xs py-2 px-3 rounded-lg font-bold"
            />
            <button 
              onClick={handleGetTable}
              disabled={loading}
              className="bg-[#0D47A1] disabled:bg-blue-400 text-white px-4 py-2 text-xs font-bold rounded-lg"
            >
              {loading ? 'Retrieving...' : 'Get Table'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && <ScreenLoader message={`Querying official operational schedule for Train ${trainNoInput}...`} />}

        {/* Error Block */}
        {error && <ScreenError error={error} onRetry={handleGetTable} />}

        {/* List layout stops */}
        {!loading && !error && activeSchedule && (
          <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm divide-y divide-slate-100">
            <div className="p-2 text-[10px] font-extrabold text-[#0D47A1] uppercase">
              {activeSchedule.trainNumber} {activeSchedule.trainName} Stops List
            </div>
            
            {activeSchedule.route.map((stop: any, idx: number) => (
              <div key={idx} className="py-2.5 flex justify-between text-xs px-1">
                <div>
                  <p className="font-bold text-slate-800">{stop.stationName} ({stop.stationCode})</p>
                  <p className="text-[8px] text-slate-400">
                    Halt: {stop.haltMinutes > 0 ? `${stop.haltMinutes} mins` : (stop.arrivalTime === 'Source' ? 'Source' : 'Terminus')} 
                    {stop.platform && ` | Platform ${stop.platform}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0D47A1]">
                    {stop.departureTime || stop.arrivalTime}
                  </p>
                  <p className="text-[8px] text-slate-400">
                    {stop.distance > 0 ? `${stop.distance} km` : '0 km'} • Day {stop.day}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
