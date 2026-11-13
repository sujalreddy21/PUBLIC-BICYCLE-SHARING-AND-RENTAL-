import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bike,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const LoginRegister = ({ initialRole = 'member', onBackToHome, onLoginSuccess }) => {
  const { login, register } = useAuth();
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Default credentials mapping
  const roleConfigs = {
    admin: {
      title: 'Administrator Portal',
      subtitle: 'System Command, Fleet Controls & Revenue Audit',
      badge: '👑 Master Access',
      defaultEmail: 'admin@pbs.com',
      defaultPass: 'Admin@123',
      color: 'purple',
      icon: ShieldCheck,
      bannerBg: 'from-purple-900 to-indigo-950',
      accentColor: 'text-purple-400'
    },
    operations_manager: {
      title: 'Operations Manager Portal',
      subtitle: 'Dock Balancing, Logistics & Fleet Health',
      badge: '⚙️ Operations Control',
      defaultEmail: 'ops@pbs.com',
      defaultPass: 'Ops@123',
      color: 'blue',
      icon: Building2,
      bannerBg: 'from-blue-900 to-slate-950',
      accentColor: 'text-blue-400'
    },
    station_attendant: {
      title: 'Station Attendant Terminal',
      subtitle: 'Station Gate Console, Checkouts & Returns',
      badge: '🏪 Dock Terminal',
      defaultEmail: 'attendant1@pbs.com',
      defaultPass: 'Attendant@123',
      color: 'amber',
      icon: KeyRound,
      bannerBg: 'from-amber-900 to-slate-950',
      accentColor: 'text-amber-400'
    },
    member: {
      title: 'Member / Rider Portal',
      subtitle: 'Bike Reservations, Passes & Active Rides',
      badge: '🚴 Commuter Pass',
      defaultEmail: 'sujal@pbs.com',
      defaultPass: 'Member@123',
      color: 'emerald',
      icon: User,
      bannerBg: 'from-emerald-950 to-slate-950',
      accentColor: 'text-emerald-400'
    }
  };

  const currentConfig = roleConfigs[selectedRole] || roleConfigs.member;

  // Whenever role changes, autofill demo credentials for easy login
  useEffect(() => {
    const config = roleConfigs[selectedRole] || roleConfigs.member;
    setEmail(config.defaultEmail);
    setPassword(config.defaultPass);
    setError('');
  }, [selectedRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, phone, role: selectedRole });
      } else {
        await login(email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(currentConfig.defaultEmail);
    setPassword(currentConfig.defaultPass);
    setError('');
  };

  const Icon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100 font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row: Back to Home + Student Credit */}
      <div className="relative z-10 max-w-lg mx-auto w-full mb-6 flex items-center justify-between">
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Home</span>
          </button>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400 text-xs font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
          <span>SUJAL REDDY (2303A51713)</span>
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* 4 Role Selector Tabs */}
          <div className="mb-6">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              Select Role Login Page:
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
              {Object.keys(roleConfigs).map((r) => {
                const cfg = roleConfigs[r];
                const isActive = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      setIsRegister(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all text-center truncate ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r === 'admin'
                      ? '👑 Admin'
                      : r === 'operations_manager'
                      ? '⚙️ Ops'
                      : r === 'station_attendant'
                      ? '🏪 Attendant'
                      : '🚴 Member'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portal Header */}
          <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-slate-800">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentConfig.bannerBg} flex items-center justify-center text-white shadow-lg border border-white/10`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  {currentConfig.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Member Registration Toggle */}
          {selectedRole === 'member' && (
            <div className="flex rounded-xl bg-slate-950/60 p-1 mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !isRegister ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isRegister ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                New Rider Registration
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sujal Reddy"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@pbs.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating Portal...</span>
              ) : (
                <>
                  <span>
                    {isRegister ? 'Complete Rider Registration' : `Log in to ${currentConfig.title}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* One-Click Autofill Demo Credentials */}
          {!isRegister && (
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Quick Test Credentials:</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autofill Demo Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
