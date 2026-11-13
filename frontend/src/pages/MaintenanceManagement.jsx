import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  IndianRupee,
  RefreshCw,
  Edit2
} from 'lucide-react';

export const MaintenanceManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    bicycleId: '',
    issueType: 'Brake Issue',
    description: '',
    priority: 'Medium',
    assignedTo: 'Rapid Mechanics Unit 1'
  });

  const [editData, setEditData] = useState({
    status: 'Pending',
    cost: 0,
    repairNotes: '',
    priority: 'Medium',
    assignedTo: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const [ticketsRes, bikesRes] = await Promise.all([
        api.getMaintenanceList(),
        api.getBikes()
      ]);
      if (ticketsRes.success) setTickets(ticketsRes.data);
      if (bikesRes.success) setBikes(bikesRes.data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openAddModal = () => {
    setFormData({
      bicycleId: bikes[0]?._id || '',
      issueType: 'Brake Issue',
      description: 'Front brake wire tension loose and slipping',
      priority: 'Medium',
      assignedTo: 'Rapid Mechanics Unit 1'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setEditData({
      status: ticket.status,
      cost: ticket.cost || 0,
      repairNotes: ticket.repairNotes || '',
      priority: ticket.priority,
      assignedTo: ticket.assignedTo || 'Technical Support Team'
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createMaintenance(formData);
      setIsAddModalOpen(false);
      await fetchTickets();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setSubmitting(true);
    try {
      await api.updateMaintenance(editingTicket._id, editData);
      setIsEditModalOpen(false);
      await fetchTickets();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.maintenanceCode.toLowerCase().includes(search.toLowerCase()) ||
      t.issueType.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.bicycle?.bikeCode && t.bicycle.bikeCode.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fleet Maintenance & Repair Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track damaged bicycles, assign technicians, monitor repair statuses, and record servicing expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Report Damage / Log Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets, bikes, issue types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <LoadingSpinner label="Auditing maintenance fleet records..." />
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No maintenance tickets found</h3>
          <p className="text-xs text-slate-500 mt-1">Fleet is in good operational condition.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Ticket Code</th>
                  <th className="py-3 px-6">Bicycle</th>
                  <th className="py-3 px-6">Issue Type</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Assigned To</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Cost</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-700">
                      {t.maintenanceCode}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {t.bicycle?.bikeCode}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {t.issueType}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate" title={t.description}>
                      {t.description}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={t.priority} />
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {t.assignedTo}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={t.status} />
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">
                      ₹{t.cost || 0}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => openEditModal(t)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 rounded-lg transition-all"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Maintenance Request Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Report Damaged Bicycle / Create Ticket"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Bicycle
              </label>
              <select
                required
                value={formData.bicycleId}
                onChange={(e) => setFormData({ ...formData, bicycleId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <option value="">Select Bicycle</option>
                {bikes.map((b) => (
                  <option key={b._id} value={b._id}>
                    [{b.bikeCode}] {b.model} - ({b.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issue Category
              </label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Brake Issue">Brake Issue</option>
                <option value="Flat Tyre">Flat Tyre</option>
                <option value="Gear Malfunction">Gear Malfunction</option>
                <option value="Battery Drain">Battery Drain</option>
                <option value="Chain Broken">Chain Broken</option>
                <option value="Frame Damage">Frame Damage</option>
                <option value="Routine Inspection">Routine Inspection</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Technician / Unit
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Detailed Description
            </label>
            <textarea
              required
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain physical condition, damaged parts, or diagnostic findings..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              {submitting ? 'Registering...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Maintenance Ticket Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Update Ticket: ${editingTicket?.maintenanceCode}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Progression
            </label>
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed (Re-release to Available)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repair Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                value={editData.cost}
                onChange={(e) => setEditData({ ...editData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Servicing / Repair Notes
            </label>
            <textarea
              rows="2"
              value={editData.repairNotes}
              onChange={(e) => setEditData({ ...editData, repairNotes: e.target.value })}
              placeholder="Replaced brake pads, tuned derailleur, tested OK."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
