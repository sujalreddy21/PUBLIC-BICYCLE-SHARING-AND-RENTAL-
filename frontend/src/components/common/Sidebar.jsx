import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Bike,
  Building2,
  CreditCard,
  CalendarCheck,
  KeyRound,
  History,
  Wrench,
  BarChart3,
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
  Home
} from 'lucide-react';

export const Sidebar = ({ currentScreen, onSelectScreen, onGoToHome, isOpen, onClose }) => {
  const { user, login } = useAuth();
  const role = user?.role || 'member';

  const navItems = [
    // Dashboards based on role
    {
      id: 'admin_dashboard',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'operations_manager'],
      screenIndex: 2
    },
    {
      id: 'member_dashboard',
      label: 'Member Dashboard',
      icon: User,
      roles: ['member'],
      screenIndex: 8
    },
    {
      id: 'attendant_dashboard',
      label: 'Attendant Terminal',
      icon: LayoutDashboard,
      roles: ['station_attendant'],
      screenIndex: 11
    },

    // Operations & Fleet
    {
      id: 'bicycles',
      label: 'Bicycle Fleet',
      icon: Bike,
      roles: ['admin', 'operations_manager', 'station_attendant'],
      screenIndex: 3
    },
    {
      id: 'stations',
      label: 'Station Network',
      icon: Building2,
      roles: ['admin', 'operations_manager', 'station_attendant'],
      screenIndex: 4
    },
    {
      id: 'reservation',
      label: 'Bike Reservation',
      icon: CalendarCheck,
      roles: ['member', 'admin', 'station_attendant'],
      screenIndex: 6
    },
    {
      id: 'checkout_return',
      label: 'Checkout & Return',
      icon: KeyRound,
      roles: ['admin', 'operations_manager', 'station_attendant', 'member'],
      screenIndex: 7
    },
    {
      id: 'memberships',
      label: 'Membership Plans',
      icon: CreditCard,
      roles: ['admin', 'operations_manager', 'member'],
      screenIndex: 5
    },
    {
      id: 'rentals_history',
      label: 'Rental History',
      icon: History,
      roles: ['admin', 'operations_manager', 'station_attendant', 'member'],
      screenIndex: 9
    },
    {
      id: 'maintenance',
      label: 'Maintenance Logs',
      icon: Wrench,
      roles: ['admin', 'operations_manager', 'station_attendant'],
      screenIndex: 10
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['admin', 'operations_manager'],
      screenIndex: 12
    }
  ];

  // Filter items visible to current user's role
  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  // Quick role switcher demo helper
  const handleQuickSwitch = async (targetEmail, targetPassword) => {
    try {
      await login(targetEmail, targetPassword);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-navy-950 text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Logo */}
        <div className="p-5 border-b border-slate-800/80">
          <div
            onClick={onGoToHome}
            className="flex items-center gap-3 cursor-pointer group"
            title="Click to go to Public Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Bike className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5">
                <span>Mybicycles</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">PRO</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                <Home className="w-2.5 h-2.5" />
                <span>Visit Landing Page →</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 mb-1">
            System Modules
          </div>

          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screenIndex;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectScreen(item.screenIndex);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                    S{item.screenIndex}
                  </span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Academic Project Credits & Demo Role Switcher */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Demo Role Switch:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => handleQuickSwitch('admin@pbs.com', 'Admin@123')}
              className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                role === 'admin'
                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              👑 Admin
            </button>
            <button
              onClick={() => handleQuickSwitch('ops@pbs.com', 'Ops@123')}
              className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                role === 'operations_manager'
                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ⚙️ Ops Mgr
            </button>
            <button
              onClick={() => handleQuickSwitch('attendant1@pbs.com', 'Attendant@123')}
              className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                role === 'station_attendant'
                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              🏪 Attendant
            </button>
            <button
              onClick={() => handleQuickSwitch('sujal@pbs.com', 'Member@123')}
              className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                role === 'member'
                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              🚴 Member
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              DevOps & Full Stack • 2026–2027
            </p>
            <p className="text-[10px] text-blue-400 font-bold">
              SUJAL REDDY (2303A51713)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
