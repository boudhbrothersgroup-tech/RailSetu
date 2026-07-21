import React, { useState, useEffect } from 'react';
import { localDbService, UserProfile } from '../services/LocalDbService';
import { User, Mail, Smartphone, Award, Save, Key, ShieldCheck, LogOut, RefreshCw } from 'lucide-react';

interface UserProfileViewProps {
  onNavigate: (route: string, params?: any) => void;
  onSignOut: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onNavigate, onSignOut }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [mobile, setMobile] = useState('');
  const [idProofType, setIdProofType] = useState('aadhaar');
  const [idProofNum, setIdProofNum] = useState('');
  const [preferredClass, setPreferredClass] = useState('CC');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const u = localDbService.getCurrentUser();
    if (u) {
      setProfile(u);
      setName(u.name);
      setAge(u.age || '');
      setGender(u.gender || 'male');
      setMobile(u.mobile || '');
      setIdProofType(u.idProofType || 'aadhaar');
      setIdProofNum(u.idProofNum || '');
      setPreferredClass(u.preferredClass || 'CC');
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    setTimeout(() => {
      try {
        localDbService.updateProfile({
          name,
          email: profile?.email || '',
          age,
          gender,
          mobile,
          idProofType,
          idProofNum,
          preferredClass,
        });
        setMessage('Your official passenger profile has been synchronized successfully!');
        const updated = localDbService.getCurrentUser();
        setProfile(updated);
      } catch (err: any) {
        setMessage('Failed to save profile details. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const handleLogoutClick = () => {
    localDbService.signOut();
    onSignOut();
  };

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <User className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="font-bold text-sm text-slate-700">Passenger Profile</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mb-4">
          Create or sign into an account to synchronize your passenger preferences and custom routes.
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-4 py-2 bg-[#0D47A1] text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* AppBar */}
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-white" />
          <span className="font-bold text-sm font-sans">Passenger Profile</span>
        </div>
        <button
          onClick={handleLogoutClick}
          className="text-white hover:bg-white/10 p-1.5 rounded-lg flex items-center gap-1 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Sync Status Banner */}
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-800">Secure Database Synced</h4>
            <p className="text-[9px] text-emerald-600 mt-0.5 font-mono">ID: {profile.email.toLowerCase()}</p>
          </div>
        </div>

        {/* Profile Editing Form */}
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-slate-700 border-b pb-2">Primary Passenger Information</h3>

          {message && (
            <div className="p-2.5 bg-blue-50 border border-blue-100 text-[#0D47A1] text-[10px] rounded-lg text-center font-semibold">
              {message}
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Passenger Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-7 pr-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1 opacity-70">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Email ID (Locked)</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full bg-slate-100 border border-slate-200 pl-7 pr-2 py-1.5 rounded-lg text-xs font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Age, Gender & Preferred Class */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="Years"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Travel Class</label>
              <select
                value={preferredClass}
                onChange={(e) => setPreferredClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
              >
                <option value="CC">Chair Car</option>
                <option value="EC">Exec Chair</option>
                <option value="1A">AC First</option>
                <option value="2A">AC 2 Tier</option>
                <option value="3A">AC 3 Tier</option>
                <option value="SL">Sleeper</option>
              </select>
            </div>
          </div>

          <h3 className="font-bold text-xs text-slate-700 border-b pb-2 pt-1">Verification and Mobile Alerts</h3>

          {/* Mobile & ID Card Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Mobile Number</label>
              <div className="relative">
                <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-7 pr-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">ID Proof Type</label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
                <option value="voter">Voter Identity Card</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Official Document Number</label>
            <div className="relative">
              <Award className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="XXXX - XXXX - XXXX - XXXX"
                value={idProofNum}
                onChange={(e) => setIdProofNum(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-8 pr-4 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D47A1] hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Preferences</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
