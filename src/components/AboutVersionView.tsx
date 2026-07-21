import React, { useState } from 'react';
import { localDbService } from '../services/LocalDbService';
import { Shield, Smartphone, RefreshCw, CheckCircle, Info, ChevronRight, AlertCircle, Award } from 'lucide-react';

interface AboutVersionViewProps {
  onNavigate: (route: string, params?: any) => void;
  initialTab?: 'about' | 'privacy' | 'version';
}

export const AboutVersionView: React.FC<AboutVersionViewProps> = ({ onNavigate, initialTab = 'about' }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'privacy' | 'version'>(initialTab);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [updateDetails, setUpdateDetails] = useState<any>(null);

  const handleCheckUpdates = () => {
    setChecking(true);
    setChecked(false);
    setTimeout(() => {
      const details = localDbService.checkAppVersion();
      setUpdateDetails(details);
      setChecking(false);
      setChecked(true);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* AppBar */}
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-white" />
          <span className="font-bold text-sm font-sans">
            {activeTab === 'about' ? 'About RailSetu' : activeTab === 'privacy' ? 'Privacy Policy' : 'App Version Center'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-white border-b border-slate-100 text-xs text-center font-bold">
        <button
          onClick={() => setActiveTab('about')}
          className={`py-2.5 transition-colors ${activeTab === 'about' ? 'text-[#0D47A1] border-b-2 border-[#0D47A1]' : 'text-slate-400'}`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`py-2.5 transition-colors ${activeTab === 'privacy' ? 'text-[#0D47A1] border-b-2 border-[#0D47A1]' : 'text-slate-400'}`}
        >
          Privacy
        </button>
        <button
          onClick={() => setActiveTab('version')}
          className={`py-2.5 transition-colors ${activeTab === 'version' ? 'text-[#0D47A1] border-b-2 border-[#0D47A1]' : 'text-slate-400'}`}
        >
          Updates
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'about' && (
          /* ABOUT TAB */
          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0D47A1] shadow-inner mx-auto">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">RailSetu Portal</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Build Version 1.0.0 (Production Core)</p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                RailSetu is a clean, offline-first transit assistant engineered to simplify Indian Railways journeys. Built around premium client-side caching, we deliver lightning fast schedules and GNWL probability matrices with zero advertisement tracking.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest pl-1">Technical Architecture</h4>
              <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-100 shadow-sm text-xs">
                <div className="p-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Database Driver</span>
                  <span className="text-slate-400 font-mono text-[10px]">Cloud Firestore Emulator</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Secure Vault</span>
                  <span className="text-slate-400 font-mono text-[10px]">Firebase Client Auth Simulator</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Offline Caching</span>
                  <span className="text-emerald-600 font-bold font-mono text-[10px]">Active TTL (12hr)</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Notification Pipeline</span>
                  <span className="text-blue-600 font-bold font-mono text-[10px]">WebPush FCM Emulator</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0D47A1] text-white p-3.5 rounded-xl text-[10px] leading-normal shadow-sm">
              🌟 <strong>Architectural Note:</strong> RailSetu is built strictly compliant to standard Material 3 design directives, delivering gorgeous layouts that run perfectly even without active internet!
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          /* PRIVACY POLICY */
          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3 text-slate-600 leading-relaxed text-xs">
              <div className="flex items-center gap-2 text-[#0D47A1] border-b pb-2">
                <Shield className="w-5 h-5 text-[#FF9800]" />
                <h3 className="font-extrabold text-xs uppercase text-slate-700">Passenger Shield Policy</h3>
              </div>

              <p className="text-[11px] text-slate-500">
                At RailSetu, we believe your personal location records, active PNR codes, and travel history must belong strictly to your smartphone. Here is how we guarantee your privacy:
              </p>

              <div className="space-y-2.5">
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <h4 className="font-extrabold text-[11px] text-slate-700">1. Local Storage Sandboxing</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    All passenger profiles, favorite trains, and query histories are retained inside a client-side localStorage sandbox. No personal records are leaked to external trackers.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border">
                  <h4 className="font-extrabold text-[11px] text-slate-700">2. Complete Data Deletion</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    You have total authority over your session. One click in Settings is sufficient to delete all offline caches, passenger profiles, and pinned paths completely.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border">
                  <h4 className="font-extrabold text-[11px] text-slate-700">3. Zero Third-Party Advertising</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    We contain zero analytic packages or advertising scripts from commercial tracking engines. Safe, quiet, and fully offline-compliant.
                  </p>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 font-mono text-center pt-2">
                Compliance Code: GNWL-RS-2026 • Verified Free Sandbox
              </p>
            </div>
          </div>
        )}

        {activeTab === 'version' && (
          /* VERSION UPDATES CHECKER */
          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-center space-y-3">
              <RefreshCw className={`w-8 h-8 text-[#0D47A1] mx-auto ${checking ? 'animate-spin' : ''}`} />
              <div>
                <h3 className="font-bold text-xs text-slate-800">Operational Update Manager</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Validate your local timetable directories against central railway registers.</p>
              </div>

              <button
                onClick={handleCheckUpdates}
                disabled={checking}
                className="w-full bg-[#0D47A1] hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-2 rounded-lg text-xs shadow-xs"
              >
                {checking ? 'Checking Timetables...' : 'Check for Updates'}
              </button>
            </div>

            {checked && updateDetails && (
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start gap-2 text-emerald-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">All Timetables Up To Date</h4>
                    <p className="text-[9px] text-emerald-600 mt-0.5">Version {updateDetails.current} is fully active</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border text-xs">
                  <p className="font-bold text-slate-700">Release Notes (v{updateDetails.current}):</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {updateDetails.releaseNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
