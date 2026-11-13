import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Building2,
  Bike,
  KeyRound,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Zap,
  Battery
} from 'lucide-react';

export const StationAttendantDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [allStations, setAllStations] = useState([]);
  const [stationBikes, setStationBikes] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedBikeToReport, setSelectedBikeToReport] = useState(null);
  const [reportIssue, setReportIssue] = useState('Flat Tyre');
  const [reportNotes, setReportNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAttendantData = async () => {
    try {
      setLoading(true);
      const stationsRes = await api.getStations();
      if (stationsRes.success) {
        setAllStations(stationsRes.data);
        // Find assigned station or default to first
        const assignedId = user?.assignedStation?._id || user?.assignedStation;
        const myStation = stationsRes.data.find((s) => s._id === assignedId) || stationsRes.data[0];
        setStation(myStation);

        if (myStation) {
          const bikesRes = await api.getBikes({ station: myStation._id });
          if (bikesRes.success) setStationBikes(bikesRes.data);
        }
      }

      const rentalsRes = await api.getRentals({ status: 'Active' });
      if (rentalsRes.success) setActiveRentals(rentalsRes.data);
    } catch (err) {
      console.error('Failed to load attendant station terminal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendantData();
  }, [user]);

  const handleStationChange = async (stationId) => {
    const found = allStations.find((s) => s._id === stationId);
    if (found) {
      setStation(found);
      const bikesRes = await api.getBikes({ station: found._id });
      if (bikesRes.success) setStationBikes(bikesRes.data);
    }
  };

  const handleReportDamage = async (e) => {
    e.preventDefault();
    if (!selectedBikeToReport) return;
    setSubmitting(true);
    try {
      await api.createMaintenance({
        bicycleId: selectedBikeToReport._id,
        issueType: reportIssue,
        description: reportNotes || 'Reported by station attendant on inspection.',
        priority: 'Medium'
      });
      setMessage(`Maintenance ticket registered for ${selectedBikeToReport.bikeCode}`);
      setTimeout(() => {
        setMessage('');
        setIsReportModalOpen(false);
      }, 1500);
      await fetchAttendantData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Initializing station gate terminal..." size="lg" />;
  }

  const freeSlots = station ? Math.max(0, station.capacity - (station.occupiedSlotsCount || 0)) : 0;
  const availableBikes = stationBikes.filter((b) => b.status === 'Available');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-amber-200 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" /> Station Terminal Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {station?.name || 'Docking Hub Terminal'}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{station?.address}, {station?.city}</span>
            <span>•</span>
            <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-white font-bold">
              {station?.code}
            </span>
          </p>
        </div>

        {/* Change Terminal Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={station?._id || ''}
            onChange={(e) => handleStationChange(e.target.value)}
            className="px-3 py-2 bg-white/20 text-white rounded-xl text-xs font-bold border border-white/30 backdrop-blur-md focus:outline-none"
          >
            {allStations.map((s) => (
              <option key={s._id} value={s._id} className="text-slate-900">
                Switch: {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAttendantData}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            title="Refresh Terminal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Dock Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dock Capacity"
          value={`${station?.capacity || 0} Slots`}
          icon={Building2}
          color="blue"
          subtext="Physical locking posts"
        />
        <StatCard
          title="Parked Bicycles"
          value={`${stationBikes.length} Bikes`}
          icon={Bike}
          color="indigo"
          subtext="Occupied locking docks"
        />
        <StatCard
          title="Available for Rent"
          value={`${availableBikes.length} Ready`}
          icon={CheckCircle2}
          color="emerald"
          subtext="Inspected and unlocked"
        />
        <StatCard
          title="Free Return Docks"
          value={`${freeSlots} Open`}
          icon={RotateCcw}
          color={freeSlots === 0 ? 'rose' : 'amber'}
          subtext={freeSlots === 0 ? 'Station full!' : 'Ready for drop-offs'}
        />
      </div>

      {/* Quick Terminal Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate && onNavigate(7)}
          className="p-5 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base">Issue / Checkout Bicycle</div>
              <div className="text-xs text-blue-100">Release a bicycle to a walk-in member</div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/20 group-hover:translate-x-1 transition-transform">
            Checkout →
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate(7)}
          className="p-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base">Process Bicycle Return</div>
              <div className="text-xs text-emerald-100">Accept returns into available docks</div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/20 group-hover:translate-x-1 transition-transform">
            Return →
          </span>
        </button>
      </div>

      {/* Station Docked Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Dock Inventory at {station?.name}
            </h3>
            <p className="text-xs text-slate-500">Live hardware status of bicycles currently docked</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {stationBikes.length} Total Units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Bicycle Code</th>
                <th className="py-3 px-6">Model</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Battery</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Notes</th>
                <th className="py-3 px-6 text-right">Attendant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stationBikes.map((bike) => (
                <tr key={bike._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-700">{bike.bikeCode}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{bike.model}</td>
                  <td className="py-3.5 px-6">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      {bike.type === 'Electric' && <Zap className="w-3.5 h-3.5 text-cyan-500" />}
                      {bike.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    {bike.type === 'Electric' ? (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-emerald-600" />
                        {bike.batteryLevel}%
                      </span>
                    ) : (
                      <span className="text-slate-400">Mechanical</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge status={bike.status} />
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">
                    {bike.conditionNotes || 'Normal'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedBikeToReport(bike);
                        setIsReportModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-all"
                    >
                      Report Damage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Damage Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={`Report Defect: ${selectedBikeToReport?.bikeCode}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReportDamage} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Defect Category
            </label>
            <select
              value={reportIssue}
              onChange={(e) => setReportIssue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Flat Tyre">Flat Tyre</option>
              <option value="Brake Issue">Brake Issue</option>
              <option value="Chain Broken">Chain Broken</option>
              <option value="Gear Malfunction">Gear Malfunction</option>
              <option value="Battery Drain">Battery Drain</option>
              <option value="Frame Damage">Frame Damage</option>
              <option value="Other">Other Mechanical Fault</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attendant Inspection Notes
            </label>
            <textarea
              rows="3"
              required
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Describe what is damaged or not functioning..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Mark Under Maintenance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
