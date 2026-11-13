import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Bike,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Battery,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  RotateCcw
} from 'lucide-react';

export const BicycleManagement = () => {
  const [bikes, setBikes] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [bikeToDelete, setBikeToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    bikeCode: '',
    model: 'EcoRide Classic',
    type: 'Standard',
    currentStation: '',
    status: 'Available',
    batteryLevel: 100,
    conditionNotes: 'Good condition'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bikesRes, stationsRes] = await Promise.all([
        api.getBikes(),
        api.getStations()
      ]);
      if (bikesRes.success) setBikes(bikesRes.data);
      if (stationsRes.success) setStations(stationsRes.data);
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingBike(null);
    setFormData({
      bikeCode: 'BIK-' + Math.floor(100 + Math.random() * 900),
      model: 'EcoRide Classic',
      type: 'Standard',
      currentStation: stations[0]?._id || '',
      status: 'Available',
      batteryLevel: 100,
      conditionNotes: 'Brand new condition'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (bike) => {
    setEditingBike(bike);
    setFormData({
      bikeCode: bike.bikeCode,
      model: bike.model,
      type: bike.type,
      currentStation: bike.currentStation?._id || bike.currentStation,
      status: bike.status,
      batteryLevel: bike.batteryLevel || 100,
      conditionNotes: bike.conditionNotes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingBike) {
        await api.updateBike(editingBike._id, formData);
      } else {
        await api.createBike(formData);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!bikeToDelete) return;
    try {
      await api.deleteBike(bikeToDelete._id);
      setIsDeleteModalOpen(false);
      setBikeToDelete(null);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtered bikes
  const filteredBikes = bikes.filter((b) => {
    const matchesSearch =
      b.bikeCode.toLowerCase().includes(search.toLowerCase()) ||
      b.model.toLowerCase().includes(search.toLowerCase()) ||
      (b.conditionNotes && b.conditionNotes.toLowerCase().includes(search.toLowerCase()));

    const matchesStation =
      selectedStation === 'all' ||
      (b.currentStation?._id || b.currentStation) === selectedStation;

    const matchesStatus =
      selectedStatus === 'all' || b.status === selectedStatus;

    return matchesSearch && matchesStation && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bicycle Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure bicycles, assign stations, manage battery levels and operational statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh fleet list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bicycle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, model, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Station Filter */}
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Stations ({stations.length})</option>
            {stations.map((stn) => (
              <option key={stn._id} value={stn._id}>
                {stn.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Rented">Rented</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Bicycles Grid / Table */}
      {loading ? (
        <LoadingSpinner label="Fetching fleet assets from database..." />
      ) : filteredBikes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <Bike className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No bicycles matched your filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing search or filters to see all fleet assets.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Bicycle Code</th>
                  <th className="py-3 px-6">Model & Type</th>
                  <th className="py-3 px-6">Current Station</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Battery</th>
                  <th className="py-3 px-6">Total Rides</th>
                  <th className="py-3 px-6">Distance</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBikes.map((bike) => (
                  <tr key={bike._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-700">
                      {bike.bikeCode}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-800">{bike.model}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        {bike.type === 'Electric' && <Zap className="w-3 h-3 text-cyan-500" />}
                        <span>{bike.type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{bike.currentStation?.name || 'Unassigned'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {bike.currentStation?.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={bike.status} />
                    </td>
                    <td className="py-3.5 px-6">
                      {bike.type === 'Electric' ? (
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Battery className="w-4 h-4 text-emerald-600" />
                          <span>{bike.batteryLevel}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A (Pedal)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-700">
                      {bike.totalRides || 0}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {(bike.totalDistanceKm || 0).toFixed(1)} km
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(bike)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit bicycle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setBikeToDelete(bike);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete bicycle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Bicycle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBike ? `Edit Bicycle: ${editingBike.bikeCode}` : 'Add New Bicycle to Fleet'}
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
                Bicycle Code
              </label>
              <input
                type="text"
                required
                value={formData.bikeCode}
                onChange={(e) => setFormData({ ...formData, bikeCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Name
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bicycle Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Standard">Standard</option>
                <option value="Electric">Electric</option>
                <option value="Geared">Geared</option>
                <option value="Cruiser">Cruiser</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Station
              </label>
              <select
                required
                value={formData.currentStation}
                onChange={(e) => setFormData({ ...formData, currentStation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <option value="">Select Docking Station</option>
                {stations.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.occupiedSlotsCount || 0}/{s.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Rented">Rented</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {formData.type === 'Electric' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Battery Level (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.batteryLevel}
                  onChange={(e) => setFormData({ ...formData, batteryLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition & Maintenance Notes
            </label>
            <textarea
              rows="2"
              value={formData.conditionNotes}
              onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
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
              {submitting ? 'Saving...' : editingBike ? 'Update Bicycle' : 'Create Bicycle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Fleet Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete bicycle{' '}
            <strong className="text-slate-900 font-mono">{bikeToDelete?.bikeCode}</strong>? This action cannot be undone. Bicycles currently rented or reserved cannot be deleted.
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
              Yes, Delete Bicycle
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
