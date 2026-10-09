import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Key, User, ShieldCheck, ArrowRight, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { UserSession, signInUser, signUpUser, signInAsGuest } from '../../services/auth';
import { isSupabaseConfigured } from '../../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionChange: (session: UserSession) => void;
  currentSession: UserSession | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSessionChange,
  currentSession,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isCloud = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { session, error } = await signUpUser(email, password, displayName);
        if (error) {
          setErrorMsg(error);
        } else {
          setSuccessMsg('Account created successfully!');
          onSessionChange(session);
          setTimeout(() => onClose(), 800);
        }
      } else {
        const { session, error } = await signInUser(email, password);
        if (error) {
          setErrorMsg(error);
        } else {
          setSuccessMsg('Signed in successfully!');
          onSessionChange(session);
          setTimeout(() => onClose(), 800);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const session = signInAsGuest();
    onSessionChange(session);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-panel p-6 md:p-8 rounded-3xl max-w-md w-full space-y-6 border-cyan-500/40 gradient-border relative shadow-neon"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl glass-panel text-theme-muted hover:text-theme-fg transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl gradient-accent mx-auto flex items-center justify-center shadow-neon">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-theme-fg">
              {isSignUp ? 'Create DECODEAI Account' : 'Sign In to DECODEAI'}
            </h2>
            <p className="text-xs text-theme-secondary">
              {isCloud 
                ? 'Authenticated Cloud Encryption & User Privacy Active' 
                : 'Local Privacy Mode: Authenticate your private workspace session'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-fg uppercase tracking-wider">Display Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <User className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-fg uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
                />
                <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-fg uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
                />
                <Key className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-coral-400 font-medium p-2 rounded-lg bg-coral-500/10 border border-coral-500/20">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-cyan-300 font-medium p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-accent text-white py-3 rounded-xl font-bold text-sm shadow-neon flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest Demo Login Option */}
          <div className="pt-2 border-t border-theme space-y-3">
            <button
              onClick={handleGuestLogin}
              className="w-full glass-panel hover:bg-theme-card-hover text-cyan-300 border-cyan-500/30 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Continue as Guest Demo User</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-theme-secondary hover:text-cyan-300 font-semibold underline transition"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 text-[10px] text-theme-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Row Level Security & Encrypted Local Session</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

