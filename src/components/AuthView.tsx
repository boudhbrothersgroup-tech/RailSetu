import React, { useState } from 'react';
import { localDbService } from '../services/LocalDbService';
import { Key, Mail, User, ShieldAlert, ArrowLeft, Send, CheckCircle2, RefreshCw } from 'lucide-react';

interface AuthViewProps {
  onNavigate: (route: string, params?: any) => void;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, onSuccess, onCancel }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    setTimeout(() => {
      try {
        if (mode === 'signin') {
          localDbService.signIn(email, password);
          onSuccess();
        } else if (mode === 'signup') {
          localDbService.signUp(name, email, password);
          setSuccess('Account created successfully! Auto-logging you into RailSetu...');
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          const msg = localDbService.resetPassword(email);
          setSuccess(msg);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* AppBar */}
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button onClick={onCancel} className="p-1 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <span className="font-bold text-sm font-sans">
            {mode === 'signin' ? 'Sign In to RailSetu' : mode === 'signup' ? 'Create Free Account' : 'Reset Password'}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
        {/* Logo Shield Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-100 text-[#0D47A1] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Key className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            {mode === 'signin' ? 'Welcome Back!' : mode === 'signup' ? 'Start Journey Securely' : 'Account Recovery'}
          </h2>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
            {mode === 'signin' 
              ? 'Synchronize your favourite trains, custom profile alerts, and support desk tickets.' 
              : mode === 'signup' 
              ? 'Sign up in seconds to access Cloud Firestore sync, offline history caching, and messaging.'
              : 'Enter your email to receive a password recovery link.'
            }
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-lg flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[9px] text-[#0D47A1] font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D47A1] hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : mode === 'signin' ? (
              'Sign In Securely'
            ) : mode === 'signup' ? (
              'Register & Setup Sync'
            ) : (
              'Send Recovery Link'
            )}
          </button>
        </form>

        {/* Mode Toggle Footer */}
        <div className="text-center space-y-2">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-500">
              New to RailSetu?{' '}
              <button onClick={() => setMode('signup')} className="text-[#0D47A1] font-extrabold hover:underline">
                Create Free Account
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-[#0D47A1] font-extrabold hover:underline">
                Sign In Instead
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Remember your password?{' '}
              <button onClick={() => setMode('signin')} className="text-[#0D47A1] font-extrabold hover:underline">
                Sign In
              </button>
            </p>
          )}

          <div className="h-[1px] bg-slate-200 w-1/2 mx-auto my-3"></div>

          <button
            onClick={onSuccess}
            className="text-[10px] text-slate-400 font-bold hover:text-[#0D47A1] transition"
          >
            Continue as Guest (Offline Cache Mode)
          </button>
        </div>
      </div>
    </div>
  );
};
