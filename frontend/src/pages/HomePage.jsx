import React, { useState } from 'react';
import {
  Bike,
  ShieldCheck,
  Building2,
  User,
  KeyRound,
  ArrowRight,
  Zap,
  Battery,
  MapPin,
  QrCode,
  Users,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export const HomePage = ({ onSelectRoleLogin }) => {
  const [activeDropdown, setActiveDropdown] = useState(false);

  const rolePortals = [
    {
      id: 'admin',
      title: 'Administrator',
      subtitle: 'System Command Center',
      desc: 'Full fleet control, station analytics, user management, and revenue audit.',
      color: 'purple',
      badge: '👑 Master Access',
      email: 'admin@pbs.com',
      icon: ShieldCheck,
      gradient: 'from-purple-600 to-indigo-700'
    },
    {
      id: 'operations_manager',
      title: 'Operations Manager',
      subtitle: 'Fleet & Dock Logistics',
      desc: 'Dock capacity balancing, maintenance scheduling, and utilization reporting.',
      color: 'blue',
      badge: '⚙️ Operations',
      email: 'ops@pbs.com',
      icon: Building2,
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'station_attendant',
      title: 'Station Attendant',
      subtitle: 'Dock Gate Terminal',
      desc: 'Local station console, walk-in bicycle checkouts, returns, and fault logging.',
      color: 'amber',
      badge: '🏪 Station Desk',
      email: 'attendant1@pbs.com',
      icon: KeyRound,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 'member',
      title: 'Member / Rider',
      subtitle: 'Commuter Mobile Portal',
      desc: '30-minute bike reservations, instant QR unlock, pass plans, and ride ledger.',
      color: 'emerald',
      badge: '🚴 Commuter Pass',
      email: 'sujal@pbs.com',
      icon: User,
      gradient: 'from-emerald-600 to-teal-700'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Bike className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-emerald-800">
              Mybicycles
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a href="#hero" className="hover:text-emerald-700 transition-colors font-semibold text-slate-900">
              Home
            </a>
            <a href="#portals" className="hover:text-emerald-700 transition-colors">
              User Portals
            </a>
            <a href="#smart-hubs" className="hover:text-emerald-700 transition-colors">
              Smart Hubs
            </a>
            <a href="#city-life" className="hover:text-emerald-700 transition-colors">
              City Life
            </a>
            <a href="#specs" className="hover:text-emerald-700 transition-colors">
              Specifications
            </a>
          </nav>

          {/* Right Action: Role Login Dropdown & Student Tag */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>SUJAL REDDY • 2303A51713</span>
            </div>

            {/* Login Portals Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(!activeDropdown)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Select Login Portal</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDropdown ? 'rotate-90' : ''}`} />
              </button>

              {activeDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5">
                    Redirect to Role Login
                  </div>
                  {rolePortals.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setActiveDropdown(false);
                        onSelectRoleLogin(role.id);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                          <role.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{role.title}</div>
                          <div className="text-[10px] text-slate-400">{role.badge}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION (MATCHING PHOTO 3) */}
      {/* ========================================================================= */}
      <section id="hero" className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28">
        {/* Luminous Yellow-Green Radial Background Glow as seen in Photo 3 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 65% 50%, rgba(254, 240, 138, 0.45) 0%, rgba(217, 249, 157, 0.35) 30%, rgba(187, 247, 208, 0.2) 50%, rgba(255, 255, 255, 0) 75%)'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Badge: INTRODUCING • 2026 */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-sm">
                <span className="text-amber-500 text-xs">◆</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
                  INTRODUCING • 2026
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black text-slate-950 leading-[1.05] tracking-tight">
                Ride <span className="italic font-serif font-normal text-emerald-700 underline decoration-emerald-500/40 decoration-wavy decoration-2">easy.</span>
                <br />
                Go
                <br />
                electric.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md font-normal">
                India's smartest e-bike. All-day range on a single charge, zero license required, designed for the way you move through the city.
              </p>

              {/* Quick Action Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#portals"
                  className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-slate-950/20 transition-all flex items-center gap-2"
                >
                  <span>Select Login Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onSelectRoleLogin('member')}
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  Rider Sign In
                </button>
              </div>

              {/* Bottom Metrics Bar (Photo 3 exact match) */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    135+ <span className="text-xs font-bold text-slate-500">km*</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    REAL RANGE
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    25 <span className="text-xs font-bold text-slate-500">km/h</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    TOP SPEED
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    0
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    LICENSE NEEDED
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual (7 cols) - Dashed circle + Yellow E-bike + Floating spec cards */}
            <div className="lg:col-span-7 relative flex items-center justify-center min-h-[420px] lg:min-h-[540px]">
              {/* Dashed Orbital Circle from Photo 3 */}
              <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full border border-dashed border-amber-300/80 pointer-events-none" />
              <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full border border-dashed border-emerald-300/40 pointer-events-none" />

              {/* Floating Spec Badge 1: BATTERY (Top Right) */}
              <div className="absolute top-6 right-4 sm:right-10 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 z-20 animate-in fade-in slide-in-from-top-4">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">
                  BATTERY
                </span>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  48V • 10Ah
                </span>
              </div>

              {/* Floating Spec Badge 2: WEIGHT (Bottom Left) */}
              <div className="absolute bottom-8 left-4 sm:left-14 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 z-20 animate-in fade-in slide-in-from-bottom-4">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">
                  WEIGHT
                </span>
                <span className="text-xs font-black text-slate-900 mt-0.5 block">
                  22 kg
                </span>
              </div>

              {/* Yellow Smart E-Bike Image */}
              <div className="relative z-10 w-full max-w-[560px] transition-transform duration-500 hover:scale-105">
                <img
                  src="/images/hero-ebike.jpg"
                  alt="Yellow Smart Electric Bicycle"
                  className="w-full h-auto object-contain drop-shadow-2xl rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOUR ROLE LOGIN PORTALS (PRIMARY USER REDIRECTION) */}
      {/* ========================================================================= */}
      <section id="portals" className="py-16 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-3 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role-Based Authentication Access</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Select Your Access Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Choose your role to redirect to your dedicated authentication page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rolePortals.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Role Header Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${role.gradient} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {role.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {role.title}
                    </h3>
                    <div className="text-xs font-bold text-slate-400 mb-2">
                      {role.subtitle}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {role.desc}
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 mb-4 font-mono">
                      <span className="text-slate-400">Login ID: </span>
                      <strong className="text-slate-800">{role.email}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectRoleLogin(role.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-emerald-600/25"
                  >
                    <span>Enter {role.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: SMART HUBS (MATCHING PHOTO 1) */}
      {/* ========================================================================= */}
      <section id="smart-hubs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                <span>◆ SMART HUBS</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Park. Charge. Go.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Scan the QR at any Mybicycles station, unlock your ride from the app, and drop off anywhere on the network — no keys, no hassle.
              </p>

              <div className="space-y-3.5 pt-2 text-xs sm:text-sm font-semibold text-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>QR unlock in under 10 seconds</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>GPS-tracked docking stations</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>24/7 hubs across the city</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onSelectRoleLogin('member')}
                  className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span>Explore stations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Photo (Photo 1) */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                <img
                  src="/images/smart-hub.jpg"
                  alt="Smart Hubs - Park Charge Go"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: CITY LIFE (MATCHING PHOTO 2) */}
      {/* ========================================================================= */}
      <section id="city-life" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Photo (Photo 2) */}
            <div className="lg:col-span-6 order-2 lg:order-1 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                <img
                  src="/images/city-life.jpg"
                  alt="Built for how India moves"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                <span>◆ CITY LIFE</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Built for how India moves.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                From campus commutes to weekend rides with friends — Mybicycles keeps your city connected, clean, and fun.
              </p>

              <div className="space-y-3.5 pt-2 text-xs sm:text-sm font-semibold text-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>Fleet-ready for campuses & corporates</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>Zero license, zero emissions</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>Ride solo or with your crew</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onSelectRoleLogin('member')}
                  className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span>Book a ride now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Bike className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white">Mybicycles</span>
                <span className="text-xs text-slate-400 block">Public Bicycle Sharing & Rental System</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
              <button onClick={() => onSelectRoleLogin('admin')} className="text-slate-400 hover:text-white transition-colors">
                Admin Portal
              </button>
              <span className="text-slate-700">•</span>
              <button onClick={() => onSelectRoleLogin('operations_manager')} className="text-slate-400 hover:text-white transition-colors">
                Operations Portal
              </button>
              <span className="text-slate-700">•</span>
              <button onClick={() => onSelectRoleLogin('station_attendant')} className="text-slate-400 hover:text-white transition-colors">
                Attendant Terminal
              </button>
              <span className="text-slate-700">•</span>
              <button onClick={() => onSelectRoleLogin('member')} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Rider Portal
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Academic Project: <strong className="text-white">SUJAL REDDY</strong> (HT: <span className="font-mono text-emerald-400">2303A51713</span>)
            </div>
            <div>
              Subject: DevOps & Full Stack • Academic Year 2026–2027
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
