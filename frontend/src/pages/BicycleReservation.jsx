import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  CalendarCheck,
  Search,
  MapPin,
  Clock,
  Bike,
  Zap,
  Battery,
  AlertCircle,
  CheckCircle2,
  XCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';

export const BicycleReservation = ({ onNavigateToCheckout }) => {
  const { user } = useAuth();
  const [stations, setStations] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);

  // Active reservation if exists for this member
  const [activeReservation, setActiveReservation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stnRes, bikeRes, rsvRes] = await Promise.all([
        api.getStations(),
        api.getBikes({ status: 'Available' }),
        api.getReservations()
      ]);

      if (stnRes.success) setStations(stnRes.data);
      if (bikeRes.success) setBikes(bikeRes.data);
      if (rsvRes.success) {
        setReservations(rsvRes.data);
        const myActive = rsvRes.data.find(
          (r) => r.status === 'Active' && (r.user?._id === user?._id || r.user === user?._id)
        );
        setActiveReservation(myActive || null);
      }
    } catch (err) {
      console.error('Failed to load reservation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReserve = async (bicycle) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await api.createReservation({
        bicycleId: bicycle._id,
        notes: `Reserved by ${user?.name} via web portal`
      });

      if (res.success) {
        setSuccessMsg(`Bicycle ${bicycle.bikeCode} reserved successfully! Hold valid for 30 minutes.`);
        await fetchData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not complete reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this bicycle reservation?')) return;
    setSubmitting(true);
    try {
      await api.cancelReservation(reservationId);
      setSuccessMsg('Reservation cancelled. The bicycle is now available to others.');
      await fetchData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBikes = bikes.filter((b) => {
    if (selectedStation === 'all') return true;
    const stnId = b.currentStation?._id || b.currentStation;
    return stnId === selectedStation;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reserve a Bicycle
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lock in your preferred bicycle at any docking hub. Reservations are held for 30 minutes free of charge.
        </p>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Reservation Banner */}
      {activeReservation && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-amber-100 font-bold">
                You Have an Active Reservation
              </div>
              <h3 className="text-lg font-extrabold">
                Code: {activeReservation.reservationCode}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5 flex flex-wrap items-center gap-3">
                <span className="font-semibold text-white">
                  Bike: {activeReservation.bicycle?.bikeCode} ({activeReservation.bicycle?.model})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeReservation.station?.name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Expires: {new Date(activeReservation.expiresAt).toLocaleTimeString()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onNavigateToCheckout && onNavigateToCheckout(activeReservation.bicycle?._id)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-orange-900 rounded-xl text-xs font-bold shadow-md hover:bg-orange-50 transition-all"
            >
              <KeyRound className="w-4 h-4 text-orange-700" />
              <span>Unlock & Ride Now</span>
            </button>
            <button
              onClick={() => handleCancelReservation(activeReservation._id)}
              disabled={submitting}
              className="flex items-center justify-center p-2 bg-black/20 hover:bg-black/30 rounded-xl text-white transition-colors"
              title="Cancel reservation"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Station Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700">Filter by Station:</span>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Docking Stations ({stations.length})</option>
            {stations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.availableBikesCount || 0} bikes ready)
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {filteredBikes.length} Available Bicycles Ready for Hold
        </span>
      </div>

      {/* Available Bicycles Grid */}
      {loading ? (
        <LoadingSpinner label="Locating bicycles across docking stations..." />
      ) : filteredBikes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <Bike className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No bicycles available at this station</h3>
          <p className="text-xs text-slate-500 mt-1">Please select another docking hub or check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBikes.map((bike) => (
            <div
              key={bike._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {bike.bikeCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{bike.model}</h3>
                  </div>
                  <Badge status={bike.status} />
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{bike.currentStation?.name || 'Docking Station'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      {bike.type === 'Electric' && <Zap className="w-3.5 h-3.5 text-cyan-500" />}
                      {bike.type}
                    </span>
                  </div>

                  {bike.type === 'Electric' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Battery Level:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-emerald-600" />
                        {bike.batteryLevel}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Previous Trips:</span>
                    <span className="font-semibold text-slate-800">{bike.totalRides || 0} rides</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleReserve(bike)}
                  disabled={submitting || !!activeReservation}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                    activeReservation
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>
                    {activeReservation ? 'Active Reservation Exists' : 'Reserve for 30 Mins'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Previous Reservations History */}
      {reservations.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Reservation Log</h3>
            <p className="text-xs text-slate-500">Past booking requests and lock holds</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Reservation Code</th>
                  <th className="py-3 px-6">Bicycle</th>
                  <th className="py-3 px-6">Station</th>
                  <th className="py-3 px-6">Reserved At</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.slice(0, 5).map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-6 font-mono font-bold text-blue-700">{r.reservationCode}</td>
                    <td className="py-3 px-6 font-semibold text-slate-800">
                      {r.bicycle?.bikeCode} ({r.bicycle?.model})
                    </td>
                    <td className="py-3 px-6 text-slate-600">{r.station?.name}</td>
                    <td className="py-3 px-6 text-slate-500">
                      {new Date(r.reservedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-6">
                      <Badge status={r.status} />
                    </td>
                    <td className="py-3 px-6 text-right">
                      {r.status === 'Active' && (
                        <button
                          onClick={() => handleCancelReservation(r._id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
