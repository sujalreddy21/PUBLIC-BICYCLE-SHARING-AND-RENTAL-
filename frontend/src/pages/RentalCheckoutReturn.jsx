import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  KeyRound,
  RotateCcw,
  Bike,
  Building2,
  User,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const RentalCheckoutReturn = ({ defaultBikeId }) => {
  const { user, isAdmin, isOps, isAttendant } = useAuth();
  const [activeTab, setActiveTab] = useState('checkout'); // 'checkout' | 'return'
  const [loading, setLoading] = useState(true);

  // Entities
  const [availableBikes, setAvailableBikes] = useState([]);
  const [stations, setStations] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [members, setMembers] = useState([]);

  // Checkout Form
  const [selectedBikeId, setSelectedBikeId] = useState(defaultBikeId || '');
  const [selectedMemberId, setSelectedMemberId] = useState(user?._id || '');

  // Return Form
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [returnStationId, setReturnStationId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wallet');
  const [conditionNotes, setConditionNotes] = useState('Good condition, returned normally');

  // Receipt Modal
  const [receipt, setReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Status/Messages
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [bikesRes, stationsRes, rentalsRes] = await Promise.all([
        api.getBikes(),
        api.getStations(),
        api.getRentals({ status: 'Active' })
      ]);

      if (bikesRes.success) {
        // Can check out if Available or if currently reserved
        setAvailableBikes(bikesRes.data.filter((b) => ['Available', 'Reserved'].includes(b.status)));
        if (!selectedBikeId && bikesRes.data.length > 0) {
          const firstAvail = bikesRes.data.find(b => b.status === 'Available');
          if (firstAvail) setSelectedBikeId(firstAvail._id);
        }
      }

      if (stationsRes.success) {
        setStations(stationsRes.data);
        if (!returnStationId && stationsRes.data.length > 0) {
          setReturnStationId(stationsRes.data[0]._id);
        }
      }

      if (rentalsRes.success) {
        setActiveRentals(rentalsRes.data);
        if (rentalsRes.data.length > 0 && !selectedRentalId) {
          setSelectedRentalId(rentalsRes.data[0].rentalId);
        }
      }

      // If admin or attendant, load member list
      if (isAdmin || isOps || isAttendant) {
        const usersRes = await api.getUsers({ role: 'member' }).catch(() => ({ data: [] }));
        if (usersRes.data) setMembers(usersRes.data);
      }
    } catch (err) {
      console.error('Failed to load rental checkout data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Checkout
  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (!selectedBikeId) throw new Error('Please select an available bicycle');

      const payload = {
        bicycleId: selectedBikeId,
        memberId: (isAdmin || isOps || isAttendant) ? selectedMemberId : user?._id
      };

      const res = await api.checkoutRental(payload);
      if (res.success) {
        setSuccessMsg(res.message);
        setActiveTab('return');
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Return
  const handleReturn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        rentalId: selectedRentalId,
        returnStationId,
        paymentMethod,
        conditionNotes
      };

      const res = await api.returnRental(payload);
      if (res.success) {
        setReceipt(res.data);
        setIsReceiptModalOpen(true);
        setSuccessMsg(res.message);
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Return processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRentalObj = activeRentals.find((r) => r.rentalId === selectedRentalId);
  const targetStationObj = stations.find((s) => s._id === returnStationId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Bicycle Rental Checkout & Return Terminal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Issue bicycles instantly to members, process returns, calculate fares, and generate rental receipts.
        </p>
      </div>

      {/* Messages */}
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

      {/* Action Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('checkout')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'checkout'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Check Out Bicycle</span>
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'return'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return & Dock ({activeRentals.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Connecting to rental terminal..." />
      ) : activeTab === 'checkout' ? (
        /* CHECKOUT SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>Initiate Bicycle Checkout</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Confirm bicycle selection and verify member credentials before unlocking dock.
            </p>

            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Member Selection (for staff) */}
              {(isAdmin || isOps || isAttendant) && members.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Member Account
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.email}) - {m.membership?.status === 'Active' ? 'Pass Active' : 'Regular'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Rider Profile:</span>
                  <span className="font-bold text-slate-800">{user?.name} ({user?.email})</span>
                </div>
              )}

              {/* Bicycle Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Available Bicycle
                </label>
                <select
                  value={selectedBikeId}
                  onChange={(e) => setSelectedBikeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose a bicycle to unlock --</option>
                  {availableBikes.map((b) => (
                    <option key={b._id} value={b._id}>
                      [{b.bikeCode}] {b.model} ({b.type}) @ {b.currentStation?.name || 'Station'} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Rules Overview */}
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rental Fare Logic Applied</span>
                </div>
                <p className="text-[11px] text-blue-800/80">
                  • Base Unlock Fare: ₹20 flat.
                </p>
                <p className="text-[11px] text-blue-800/80">
                  • Active Pass Members: First 30–60 minutes 100% free with hourly discount!
                </p>
                <p className="text-[11px] text-blue-800/80">
                  • Standard rate: ₹10 per 30 minutes thereafter.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || availableBikes.length === 0}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Unlocking Dock...</span>
                ) : (
                  <>
                    <span>Confirm & Release Bicycle</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info Sidecard */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Bike className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">Smart RFID Unlocking</h4>
              <p className="text-xs text-slate-400 mt-1">
                Upon confirmation, the bicycle solenoid dock releases automatically and records your unique rental session ID.
              </p>

              <div className="mt-6 space-y-3 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Available Bikes:</span>
                  <span className="font-bold text-white">{availableBikes.length} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Dock Hubs:</span>
                  <span className="font-bold text-white">{stations.length} Stations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Rides:</span>
                  <span className="font-bold text-blue-400">{activeRentals.length} In Progress</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500">
              DevOps & Full Stack Architecture • Verified ACID consistency
            </div>
          </div>
        </div>
      ) : (
        /* RETURN SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              <span>Process Bicycle Return & Fare Settlement</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Dock the bicycle, verify dock slot capacity, calculate elapsed time and settle charges.
            </p>

            {activeRentals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <Bike className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">No active rental sessions found right now.</p>
                <p className="text-[11px] text-slate-400 mt-1">Check out a bicycle first from the Checkout tab.</p>
              </div>
            ) : (
              <form onSubmit={handleReturn} className="space-y-4">
                {/* Select Active Rental */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Active Rental Session
                  </label>
                  <select
                    value={selectedRentalId}
                    onChange={(e) => setSelectedRentalId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {activeRentals.map((r) => (
                      <option key={r._id} value={r.rentalId}>
                        {r.rentalId} - {r.bicycle?.bikeCode} ({r.bicycle?.model}) | Rider: {r.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Station Selection (Checks capacity!) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Return Docking Station
                  </label>
                  <select
                    value={returnStationId}
                    onChange={(e) => setReturnStationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {stations.map((s) => {
                      const freeSlots = Math.max(0, s.capacity - (s.occupiedSlotsCount || 0));
                      const isFull = freeSlots === 0;
                      return (
                        <option key={s._id} value={s._id} disabled={isFull}>
                          {s.name} ({freeSlots} open docks left / cap: {s.capacity}) {isFull ? '- [STATION FULL]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Payment Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Settlement Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Wallet">Mobility Wallet</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Credit Card">Credit / Debit Card</option>
                      <option value="Cash">Cash at Station Desk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bicycle Condition Notes
                    </label>
                    <input
                      type="text"
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Locking in Dock & Billing...' : 'Dock Bicycle & Generate Receipt'}
                </button>
              </form>
            )}
          </div>

          {/* Active Rental Details Card */}
          {selectedRentalObj && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-bold text-blue-700">
                  {selectedRentalObj.rentalId}
                </span>
                <Badge status="Active" text="Ongoing Ride" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rider:</span>
                  <span className="font-semibold text-slate-800">{selectedRentalObj.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bicycle:</span>
                  <span className="font-bold text-slate-900">{selectedRentalObj.bicycle?.bikeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-slate-700">{selectedRentalObj.bicycle?.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unlocked At:</span>
                  <span className="text-slate-700">{selectedRentalObj.pickupStation?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Checkout Time:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedRentalObj.checkoutTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Base Unlock:</span>
                  <span>₹{selectedRentalObj.baseFare || 20}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                  <span>Target Return Hub:</span>
                  <span className="text-emerald-700">{targetStationObj?.name || 'Selected Dock'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rental Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Bicycle Rental Receipt"
        maxWidth="max-w-md"
      >
        {receipt && (
          <div className="space-y-4">
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">Trip Completed</h4>
              <p className="text-[11px] font-mono text-blue-600 font-bold">{receipt.rentalId}</p>
            </div>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Member:</span>
                <span className="font-semibold text-slate-800">{receipt.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bicycle:</span>
                <span className="font-bold text-slate-900">{receipt.bicycle?.bikeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Station:</span>
                <span className="text-slate-700">{receipt.pickupStation?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Return Station:</span>
                <span className="text-slate-700">{receipt.returnStation?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trip Duration:</span>
                <span className="font-bold text-slate-800">{receipt.durationMinutes} Minutes</span>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Base Unlock Fee:</span>
                <span>₹{receipt.baseFare}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duration Fare:</span>
                <span>₹{receipt.durationFare}</span>
              </div>
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Membership Pass Discount:</span>
                  <span>-₹{receipt.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Settled:</span>
                <span className="text-emerald-700">₹{receipt.totalCharge}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
