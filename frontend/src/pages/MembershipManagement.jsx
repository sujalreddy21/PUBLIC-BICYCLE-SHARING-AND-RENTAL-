import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  CreditCard,
  Plus,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const MembershipManagement = () => {
  const { user, isAdmin, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: 499,
    durationDays: 30,
    freeMinutesPerRide: 60,
    hourlyRateAfterFree: 10,
    description: '',
    features: ['30 mins free ride', 'Standard bikes']
  });
  const [featureInput, setFeatureInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.getPlans();
      if (res.success) setPlans(res.data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      code: '',
      price: 299,
      durationDays: 14,
      freeMinutesPerRide: 45,
      hourlyRateAfterFree: 12,
      description: 'Special access pass for city commuters',
      features: ['Priority unlocks', '45 mins free per ride', 'All bicycle models']
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      price: plan.price,
      durationDays: plan.durationDays,
      freeMinutesPerRide: plan.freeMinutesPerRide,
      hourlyRateAfterFree: plan.hourlyRateAfterFree,
      description: plan.description || '',
      features: plan.features || []
    });
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPlan) {
        await api.updatePlan(editingPlan._id, formData);
      } else {
        await api.createPlan(formData);
      }
      setIsModalOpen(false);
      await fetchPlans();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership plan?')) return;
    try {
      await api.deletePlan(id);
      await fetchPlans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!selectedPlanToBuy) return;
    setSubmitting(true);
    try {
      await api.subscribePlan(selectedPlanToBuy._id, paymentMethod);
      await refreshUser();
      setMessage(`Successfully subscribed to ${selectedPlanToBuy.name}!`);
      setTimeout(() => {
        setMessage('');
        setIsSubscribeModalOpen(false);
      }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentPlan = (planId) => {
    return user?.membership?.plan?._id === planId && user?.membership?.status === 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Membership Passes & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose a pass for unlimited rides, waived unlock fees, and discounted hourly rates.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {/* Active User Membership Banner (if member) */}
      {user?.membership?.status === 'Active' && user?.membership?.plan && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">
                Current Active Subscription
              </div>
              <h3 className="text-lg font-bold">
                {user.membership.plan.name}
              </h3>
              <p className="text-xs text-emerald-100/90 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Valid until {new Date(user.membership.expiryDate).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>{user.membership.plan.freeMinutesPerRide} mins free per ride</span>
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            Active Member
          </div>
        </div>
      )}

      {/* Plans Pricing Grid */}
      {loading ? (
        <LoadingSpinner label="Loading membership tiers..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const isSubscribed = isCurrentPlan(plan._id);
            const isPopular = plan.code === 'MONTHLY';

            return (
              <div
                key={plan._id}
                className={`relative bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                  isSubscribed
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : isPopular
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/80 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    Most Popular
                  </span>
                )}
                {isSubscribed && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    Your Current Plan
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {plan.code}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                          title="Edit plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="mt-4 mb-5 flex items-baseline">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5 font-medium">
                      / {plan.durationDays} {plan.durationDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{plan.freeMinutesPerRide} mins free per trip</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>₹{plan.hourlyRateAfterFree}/hr after free time</span>
                    </div>

                    {plan.features?.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedPlanToBuy(plan);
                      setIsSubscribeModalOpen(true);
                    }}
                    disabled={isSubscribed}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isSubscribed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : `Subscribe for ₹${plan.price}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscribe Confirmation Modal */}
      <Modal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        title={`Activate ${selectedPlanToBuy?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubscribe} className="space-y-4">
          <p className="text-xs text-slate-600">
            You are subscribing to <strong className="text-slate-900">{selectedPlanToBuy?.name}</strong>.
            This gives you {selectedPlanToBuy?.freeMinutesPerRide} free minutes per ride for {selectedPlanToBuy?.durationDays} days.
          </p>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Plan Fare:</span>
              <span className="font-bold text-slate-800">₹{selectedPlanToBuy?.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span className="font-semibold text-slate-700">{selectedPlanToBuy?.durationDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Free Minutes / Trip:</span>
              <span className="font-semibold text-emerald-700">{selectedPlanToBuy?.freeMinutesPerRide} mins</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['UPI', 'Credit Card', 'Wallet'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    paymentMethod === method
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
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
              onClick={() => setIsSubscribeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              {submitting ? 'Processing Payment...' : `Confirm & Pay ₹${selectedPlanToBuy?.price}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Add/Edit Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Membership Plan'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Weekend Pass"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="WEEKEND"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Free Mins/Ride</label>
              <input
                type="number"
                min="0"
                required
                value={formData.freeMinutesPerRide}
                onChange={(e) => setFormData({ ...formData, freeMinutesPerRide: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Features Included</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add feature item..."
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.features.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
