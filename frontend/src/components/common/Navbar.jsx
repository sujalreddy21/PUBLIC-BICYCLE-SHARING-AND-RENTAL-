import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Menu,
  Bell,
  LogOut,
  Wallet,
  PlusCircle,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { Modal } from './Modal';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, refreshUser } = useAuth();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('200');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleTopup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.topupWallet(Number(topupAmount));
      await refreshUser();
      setMsg(`Added ₹${topupAmount} to your wallet!`);
      setTimeout(() => {
        setMsg('');
        setShowWalletModal(false);
      }, 1200);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    admin: 'Administrator',
    operations_manager: 'Operations Manager',
    station_attendant: 'Station Attendant',
    member: 'Registered Member'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left Side: Mobile Toggle & Project Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Student Tag Header for Academic Project */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <div className="text-xs">
              <span className="font-bold text-slate-800">SUJAL REDDY</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-slate-600 font-medium">HT: 2303A51713</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-blue-700 font-semibold">DevOps & Full Stack</span>
            </div>
          </div>
        </div>

        {/* Right Side: Wallet, Role Badge & User Profile */}
        <div className="flex items-center gap-3">
          {/* Member Wallet Balance */}
          {user?.role === 'member' && (
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold transition-all shadow-sm"
              title="Click to recharge wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹{(user.walletBalance || 0).toFixed(2)}</span>
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          )}

          {/* Role Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-700 border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{roleLabels[user?.role] || user?.role}</span>
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[120px]">{user?.email}</div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Log out of application"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Wallet Recharge Modal */}
      <Modal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        title="Recharge Smart Mobility Wallet"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleTopup} className="space-y-4">
          <p className="text-xs text-slate-600">
            Add virtual credits to your bicycle rental wallet. Charges for ride durations and unlocks will be automatically deducted.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Current Balance:</span>
            <span className="text-base font-bold text-emerald-700">₹{(user?.walletBalance || 0).toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Top-up Amount (₹)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['100', '200', '500', '1000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    topupAmount === amt
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="10"
              max="10000"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {msg && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {msg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Processing...' : 'Confirm Recharge'}
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
