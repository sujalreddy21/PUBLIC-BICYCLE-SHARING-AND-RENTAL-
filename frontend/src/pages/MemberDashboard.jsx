import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  User,
  Bike,
  CreditCard,
  Clock,
  MapPin,
  CalendarCheck,
  Wallet,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  PlusCircle,
  KeyRound,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const MemberDashboard = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [activeRental, setActiveRental] = useState(null);
  const [activeReservation, setActiveReservation] = useState(null);
  const [pastRentals, setPastRentals] = useState([]);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const [rentalsRes, rsvRes, stnRes] = await Promise.all([
        api.getRentals(),
        api.getReservations(),
        api.getStations()
      ]);

      if (rentalsRes.success) {
        const active = rentalsRes.data.find((r) => r.rentalStatus === 'Active');
        const completed = rentalsRes.data.filter((r) => r.rentalStatus === 'Completed');
        setActiveRental(active || null);
        setPastRentals(completed);
      }

      if (rsvRes.success) {
        const activeRsv = rsvRes.data.find((r) => r.status === 'Active');
        setActiveReservation(activeRsv || null);
      }

      if (stnRes.success) {
        setNearbyStations(stnRes.data);
      }
    } catch (err) {
      console.error('Failed to load member dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner label="Personalizing your mobility dashboard..." size="lg" />;
  }

  const membership = user?.membership;
  const isMemberActive = membership && membership.status === 'Active';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-blue-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Member Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Rider'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Track your trips, unlock bicycles, and manage your green commute.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate(6)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 rounded-xl text-xs font-bold shadow-md hover:bg-blue-50 transition-all"
          >
            <CalendarCheck className="w-4 h-4 text-blue-600" />
            <span>Reserve a Bike</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate(7)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Dock</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rides"
          value={user?.totalRides ?? pastRentals.length}
          icon={TrendingUp}
          color="blue"
          subtext="Completed eco-trips"
        />
        <StatCard
          title="Wallet Balance"
          value={`₹${(user?.walletBalance || 0).toFixed(2)}`}
          icon={Wallet}
          color="emerald"
          subtext="Auto-debit for rides"
        />
        <StatCard
          title="Active Pass"
          value={isMemberActive ? membership?.plan?.name || 'Pass' : 'None'}
          icon={CreditCard}
          color="indigo"
          subtext={isMemberActive ? 'Discounts applied' : 'Pay-as-you-go'}
        />
        <StatCard
          title="Open Reservations"
          value={activeReservation ? 1 : 0}
          icon={CalendarCheck}
          color="amber"
          subtext={activeReservation ? 'Ready to unlock' : 'No active hold'}
        />
      </div>

      {/* ACTIVE RENTAL OR ACTIVE RESERVATION ALERT */}
      {activeRental && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Bike className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">
                You Are Currently On A Ride!
              </div>
              <h3 className="text-lg font-extrabold">
                {activeRental.bicycle?.bikeCode} - {activeRental.bicycle?.model}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Pickup: {activeRental.pickupStation?.name}</span>
                <span>•</span>
                <span>Started: {new Date(activeRental.checkoutTime).toLocaleTimeString()}</span>
                <span>•</span>
                <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                  {activeRental.rentalId}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate(7)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>End Ride & Dock</span>
          </button>
        </div>
      )}

      {/* Grid: Membership Details & Nearby Docks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Subscription Plan</span>
              </h3>
              <Badge status={isMemberActive ? 'Active' : 'Inactive'} text={isMemberActive ? 'Active Pass' : 'Standard'} />
            </div>

            {isMemberActive ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <div className="text-sm font-extrabold text-emerald-900">
                    {membership?.plan?.name}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {membership?.plan?.freeMinutesPerRide} minutes 100% free on every checkout
                  </div>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Hourly Rate After Free:</span>
                  <span className="font-semibold text-slate-800">₹{membership?.plan?.hourlyRateAfterFree}/hr</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Expiry Date:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(membership?.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-center space-y-2">
                <p className="text-slate-600">You are currently on Pay-as-you-go pricing.</p>
                <p className="text-[11px] text-slate-400">Subscribe to a pass to unlock free minutes and zero unlock fees.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate && onNavigate(5)}
            className="w-full mt-4 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            {isMemberActive ? 'Change or Renew Plan' : 'View Pass Options'}
          </button>
        </div>

        {/* Nearby Docking Stations */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Nearby Docking Stations</span>
              </h3>
              <p className="text-xs text-slate-500">Live bike availability across network</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate(4)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              All Stations →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearbyStations.slice(0, 4).map((stn) => (
              <div
                key={stn._id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">{stn.name}</div>
                  <div className="text-[11px] text-slate-400">{stn.address}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-700 text-sm">
                    {stn.availableBikesCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Available</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trips Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Your Recent Rides</h3>
          <button
            onClick={() => onNavigate && onNavigate(9)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Full Ride History →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Rental ID</th>
                <th className="py-3 px-6">Bicycle</th>
                <th className="py-3 px-6">Pickup Station</th>
                <th className="py-3 px-6">Return Station</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6 text-right">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastRentals.length > 0 ? (
                pastRentals.slice(0, 5).map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-700">{r.rentalId}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{r.bicycle?.bikeCode}</td>
                    <td className="py-3.5 px-6 text-slate-600">{r.pickupStation?.name}</td>
                    <td className="py-3.5 px-6 text-slate-600">{r.returnStation?.name || 'In Ride'}</td>
                    <td className="py-3.5 px-6 text-slate-600">{r.durationMinutes} mins</td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-900">₹{r.totalCharge}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No completed trips yet. Reserve or unlock a bike to start riding!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
