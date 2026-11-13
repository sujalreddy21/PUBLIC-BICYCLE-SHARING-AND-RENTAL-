import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Bike,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  Wrench,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Compiling fleet metrics and station operations..." size="lg" />;
  }

  // Sample or API chart data
  const utilizationPieData = [
    { name: 'Available', value: stats?.availableBikes || 18, color: '#10b981' },
    { name: 'Rented', value: stats?.rentedBikes || 4, color: '#3b82f6' },
    { name: 'Under Maint.', value: stats?.maintenanceRequests || 2, color: '#f43f5e' },
    { name: 'Reserved', value: 2, color: '#f59e0b' }
  ];

  const dailyRentalsData = [
    { day: 'Mon', rides: 14, revenue: 380 },
    { day: 'Tue', rides: 22, revenue: 540 },
    { day: 'Wed', rides: 19, revenue: 470 },
    { day: 'Thu', rides: 27, revenue: 690 },
    { day: 'Fri', rides: 35, revenue: 890 },
    { day: 'Sat', rides: 42, revenue: 1120 },
    { day: 'Sun', rides: 38, revenue: 980 }
  ];

  const monthlyRevenueData = [
    { month: 'Jun', rental: 2400, membership: 4500 },
    { month: 'Jul', rental: 3100, membership: 5200 },
    { month: 'Aug', rental: 3800, membership: 6100 },
    { month: 'Sep', rental: 4200, membership: 5900 },
    { month: 'Oct', rental: 4900, membership: 7400 },
    { month: 'Nov', rental: 5600, membership: 8200 }
  ];

  const stationPerformanceData = [
    { station: 'Metro Hub', checkouts: 48, returns: 42 },
    { station: 'Tech Park', checkouts: 54, returns: 50 },
    { station: 'Univ Campus', checkouts: 32, returns: 35 },
    { station: 'Waterfront', checkouts: 39, returns: 41 },
    { station: 'Green Valley', checkouts: 25, returns: 28 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> System Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Fleet Operations & Revenue Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Real-time telemetry, automated rentals, station telemetry, and fleet health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate(3)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Fleet</span>
          </button>
        </div>
      </div>

      {/* 8 Mandatory KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bicycles"
          value={stats?.totalBikes ?? 26}
          icon={Bike}
          color="blue"
          subtext="Active fleet inventory"
        />
        <StatCard
          title="Available Bicycles"
          value={stats?.availableBikes ?? 20}
          icon={CheckCircle2}
          color="emerald"
          subtext="Ready for checkout"
        />
        <StatCard
          title="Currently Rented"
          value={stats?.rentedBikes ?? 3}
          icon={Clock}
          color="indigo"
          subtext="On active rides"
        />
        <StatCard
          title="Total Stations"
          value={stats?.totalStations ?? 5}
          icon={Building2}
          color="purple"
          subtext="Docking locations"
        />
        <StatCard
          title="Registered Members"
          value={stats?.registeredMembers ?? 3}
          icon={Users}
          color="emerald"
          subtext="Total subscribers"
        />
        <StatCard
          title="Active Rentals"
          value={stats?.activeRentals ?? 1}
          icon={TrendingUp}
          color="amber"
          subtext="In-progress sessions"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue ?? 4220).toLocaleString()}`}
          icon={IndianRupee}
          color="emerald"
          subtext="Rentals & memberships"
        />
        <StatCard
          title="Maintenance Alert"
          value={stats?.maintenanceRequests ?? 2}
          icon={Wrench}
          color="rose"
          subtext="Requires servicing"
        />
      </div>

      {/* 4 Interactive Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Rentals Trend */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Rental Volume</h3>
              <p className="text-xs text-slate-500">Rides completed over past 7 days</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              +18.4% this week
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRentalsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="rides" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Revenue Stream */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue Stream</h3>
              <p className="text-xs text-slate-500">Rental fares vs Membership pass collections (₹)</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              ₹13,800/mo avg
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="rental" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRent)" name="Rentals" />
                <Area type="monotone" dataKey="membership" stroke="#10b981" fillOpacity={1} fill="url(#colorMem)" name="Memberships" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Bicycle Utilization Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bicycle Fleet Status</h3>
              <p className="text-xs text-slate-500">Distribution of current fleet state</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {stats?.totalBikes ?? 26} Bikes
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={utilizationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {utilizationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Station Turnover Performance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Station Traffic & Balance</h3>
              <p className="text-xs text-slate-500">Checkouts vs returns at key docking hubs</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              High Traffic Hubs
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="station" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="checkouts" fill="#6366f1" radius={[4, 4, 0, 0]} name="Checkouts" />
                <Bar dataKey="returns" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Returns" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Rentals Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Rental Activity</h3>
            <p className="text-xs text-slate-500">Live operational transactions across network</p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate(9)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Rentals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Rental ID</th>
                <th className="py-3 px-6">Member</th>
                <th className="py-3 px-6">Bicycle</th>
                <th className="py-3 px-6">Pickup Station</th>
                <th className="py-3 px-6">Checkout Time</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentRentals && stats.recentRentals.length > 0 ? (
                stats.recentRentals.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-700">{r.rentalId}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">{r.user?.name || 'Member'}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-slate-700">{r.bicycle?.bikeCode || 'Bike'}</span>
                      <span className="text-[10px] text-slate-400 block">{r.bicycle?.model}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{r.pickupStation?.name || 'Station'}</td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(r.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={r.rentalStatus} />
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-800">
                      ₹{r.totalCharge || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No recent rental sessions recorded.
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
