import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  MapPin,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const RentalHistory = () => {
  const [rentals, setRentals] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const [rentalsRes, stationsRes] = await Promise.all([
        api.getRentals(),
        api.getStations()
      ]);
      if (rentalsRes.success) setRentals(rentalsRes.data);
      if (stationsRes.success) setStations(stationsRes.data);
    } catch (err) {
      console.error('Failed to load rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // Filter rentals
  const filteredRentals = rentals.filter((r) => {
    const matchesSearch =
      r.rentalId.toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.name && r.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.bicycle?.bikeCode && r.bicycle.bikeCode.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || r.rentalStatus === statusFilter;

    const matchesStation =
      stationFilter === 'all' ||
      (r.pickupStation?._id === stationFilter || r.returnStation?._id === stationFilter);

    return matchesSearch && matchesStatus && matchesStation;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Rental ID,Member,Bicycle,Pickup Station,Return Station,Checkout Time,Return Time,Duration (Mins),Charges (INR),Status'];
    const rows = filteredRentals.map((r) => [
      r.rentalId,
      `"${r.user?.name || 'Member'}"`,
      r.bicycle?.bikeCode || '',
      `"${r.pickupStation?.name || ''}"`,
      `"${r.returnStation?.name || ''}"`,
      new Date(r.checkoutTime).toLocaleString(),
      r.returnTime ? new Date(r.returnTime).toLocaleString() : 'In Progress',
      r.durationMinutes || 0,
      r.totalCharge || 0,
      r.rentalStatus
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rental_History_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Rental Sessions & Transaction History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of all bicycle unlock sessions, return durations, and billing receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRentals}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by rental ID, member, bike code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active (In Ride)</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Station Filter */}
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stations</option>
            {stations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Auditing rental transaction ledger..." />
      ) : filteredRentals.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No rental records found</h3>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search or filter options.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Rental ID</th>
                  <th className="py-3 px-6">Member</th>
                  <th className="py-3 px-6">Bicycle</th>
                  <th className="py-3 px-6">Pickup Station</th>
                  <th className="py-3 px-6">Return Station</th>
                  <th className="py-3 px-6">Checkout</th>
                  <th className="py-3 px-6">Duration</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Charge</th>
                  <th className="py-3 px-6 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRentals.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-700">
                      {r.rentalId}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {r.user?.name || 'Rider'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-slate-800">{r.bicycle?.bikeCode}</span>
                      <span className="text-[10px] text-slate-400 block">{r.bicycle?.model}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {r.pickupStation?.name || 'Station'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {r.returnStation?.name || (
                        <span className="text-blue-600 font-medium italic">Active on ride</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(r.checkoutTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-700">
                      {r.durationMinutes ? `${r.durationMinutes} mins` : '-'}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={r.rentalStatus} />
                    </td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-slate-900">
                      ₹{r.totalCharge || 0}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedReceipt(r);
                          setIsReceiptModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Receipt"
                      >
                        <FileText className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Rental Transaction Statement"
        maxWidth="max-w-md"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="text-center pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">PUBLIC BICYCLE SYSTEM</h4>
              <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">{selectedReceipt.rentalId}</p>
              <div className="mt-1">
                <Badge status={selectedReceipt.rentalStatus} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Rider Name:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Bicycle Asset:</span>
                <span className="font-mono font-bold text-slate-800">{selectedReceipt.bicycle?.bikeCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Pickup Station:</span>
                <span className="text-slate-700">{selectedReceipt.pickupStation?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Return Station:</span>
                <span className="text-slate-700">{selectedReceipt.returnStation?.name || 'In Progress'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Checkout Time:</span>
                <span className="text-slate-700">{new Date(selectedReceipt.checkoutTime).toLocaleString()}</span>
              </div>
              {selectedReceipt.returnTime && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Return Time:</span>
                  <span className="text-slate-700">{new Date(selectedReceipt.returnTime).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Duration:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.durationMinutes} Minutes</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Unlock Base Fare:</span>
                <span>₹{selectedReceipt.baseFare || 20}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duration Fare:</span>
                <span>₹{selectedReceipt.durationFare || 0}</span>
              </div>
              {selectedReceipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Pass Member Discount:</span>
                  <span>-₹{selectedReceipt.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Settled:</span>
                <span className="text-emerald-700">₹{selectedReceipt.totalCharge || 0}</span>
              </div>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Close Statement
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
