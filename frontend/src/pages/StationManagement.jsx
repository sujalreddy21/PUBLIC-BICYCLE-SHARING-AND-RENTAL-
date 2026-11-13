import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Edit2,
  Trash2,
  Bike,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';

export const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [stationToDelete, setStationToDelete] = useState(null);
  const [viewingStation, setViewingStation] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Metro City',
    capacity: 12,
    contactPhone: '+91 98765 43210',
    status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await api.getStations();
      if (res.success) setStations(res.data);
    } catch (err) {
      console.error('Failed to fetch stations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const openAddModal = () => {
    setEditingStation(null);
    setFormData({
      name: '',
      code: 'STN-00' + (stations.length + 1),
      address: '',
      city: 'Metro City',
      capacity: 12,
      contactPhone: '+91 98765 43210',
      status: 'Active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      address: station.address,
      city: station.city,
      capacity: station.capacity,
      contactPhone: station.contactPhone || '',
      status: station.status
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openViewModal = async (station) => {
    try {
      const res = await api.getStation(station._id);
      if (res.success) {
        setViewingStation(res.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingStation) {
        await api.updateStation(editingStation._id, formData);
      } else {
        await api.createStation(formData);
      }
      setIsModalOpen(false);
      await fetchStations();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!stationToDelete) return;
    try {
      await api.deleteStation(stationToDelete._id);
      setIsDeleteModalOpen(false);
      setStationToDelete(null);
      await fetchStations();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Docking Station Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor station network capacity, parking slot availability, and dock distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStations}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh stations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Docking Station</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search station by name, code, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {filteredStations.length} Total Stations
        </span>
      </div>

      {/* Stations Cards Grid */}
      {loading ? (
        <LoadingSpinner label="Querying docking infrastructure..." />
      ) : filteredStations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No stations found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust search filter or add a new station.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => {
            const occupancyPct = station.capacity > 0
              ? Math.min(100, Math.round(((station.occupiedSlotsCount || 0) / station.capacity) * 100))
              : 0;

            const isHighOccupancy = occupancyPct > 85;
            const isLowOccupancy = occupancyPct < 25;

            return (
              <div
                key={station._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {station.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                        {station.name}
                      </h3>
                    </div>
                    <Badge status={station.status} />
                  </div>

                  {/* Location & Contact */}
                  <div className="space-y-1.5 mb-4 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{station.address}, {station.city}</span>
                    </div>
                    {station.contactPhone && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{station.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Occupancy Progress */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-600">Dock Occupancy</span>
                      <span className="text-slate-900 font-bold">
                        {station.occupiedSlotsCount || 0} / {station.capacity} slots ({occupancyPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHighOccupancy
                            ? 'bg-amber-500'
                            : isLowOccupancy
                            ? 'bg-blue-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60 text-center text-xs">
                      <div>
                        <div className="text-emerald-700 font-bold text-sm">
                          {station.availableBikesCount || 0}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Bikes Ready</div>
                      </div>
                      <div>
                        <div className="text-blue-700 font-bold text-sm">
                          {Math.max(0, station.capacity - (station.occupiedSlotsCount || 0))}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Free Docks</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openViewModal(station)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Inventory</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(station)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit station"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setStationToDelete(station);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete station"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Station Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStation ? `Edit Station: ${editingStation.name}` : 'Create Docking Station'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Station Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Central Hub"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Station Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="STN-001"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Street Address / Landmark
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. MG Road Metro Concourse"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Capacity (Slots)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Helpline Phone
            </label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              {submitting ? 'Saving...' : editingStation ? 'Update Station' : 'Create Station'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Station Inventory Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Station Inventory: ${viewingStation?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
            <div>
              <div className="text-slate-500">Total Capacity</div>
              <div className="text-base font-extrabold text-slate-800">{viewingStation?.capacity} Docks</div>
            </div>
            <div>
              <div className="text-slate-500">Parked Bicycles</div>
              <div className="text-base font-extrabold text-blue-700">{viewingStation?.occupiedSlotsCount} Bikes</div>
            </div>
            <div>
              <div className="text-slate-500">Available to Rent</div>
              <div className="text-base font-extrabold text-emerald-700">{viewingStation?.availableBikesCount} Bikes</div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
            {viewingStation?.bikes && viewingStation.bikes.length > 0 ? (
              viewingStation.bikes.map((b) => (
                <div key={b._id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-mono font-bold text-slate-900 mr-2">{b.bikeCode}</span>
                      <span className="text-slate-500">{b.model} ({b.type})</span>
                    </div>
                  </div>
                  <Badge status={b.status} />
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No bicycles currently docked at this station.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Station Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Station Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete station{' '}
            <strong className="text-slate-900">{stationToDelete?.name}</strong>?
            Stations with assigned bicycles cannot be deleted until bikes are reallocated.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              Yes, Delete Station
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
