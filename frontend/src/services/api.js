const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pbs_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      // Auto logout on token expiration
      localStorage.removeItem('pbs_token');
      localStorage.removeItem('pbs_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateProfile: (profileData) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    }).then(handleResponse),

  // Users
  getUsers: (params = '') =>
    fetch(`${API_BASE}/users${params ? '?' + new URLSearchParams(params) : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateUser: (id, data) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  deleteUser: (id) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  topupWallet: (amount) =>
    fetch(`${API_BASE}/users/wallet-topup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    }).then(handleResponse),

  // Bicycles
  getBikes: (params = '') =>
    fetch(`${API_BASE}/bikes${params ? '?' + new URLSearchParams(params) : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getBike: (id) =>
    fetch(`${API_BASE}/bikes/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createBike: (data) =>
    fetch(`${API_BASE}/bikes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateBike: (id, data) =>
    fetch(`${API_BASE}/bikes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  deleteBike: (id) =>
    fetch(`${API_BASE}/bikes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Stations
  getStations: (params = '') =>
    fetch(`${API_BASE}/stations${params ? '?' + new URLSearchParams(params) : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getStation: (id) =>
    fetch(`${API_BASE}/stations/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createStation: (data) =>
    fetch(`${API_BASE}/stations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateStation: (id, data) =>
    fetch(`${API_BASE}/stations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  deleteStation: (id) =>
    fetch(`${API_BASE}/stations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Membership Plans
  getPlans: () =>
    fetch(`${API_BASE}/memberships`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createPlan: (data) =>
    fetch(`${API_BASE}/memberships`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updatePlan: (id, data) =>
    fetch(`${API_BASE}/memberships/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  deletePlan: (id) =>
    fetch(`${API_BASE}/memberships/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  subscribePlan: (planId, paymentMethod) =>
    fetch(`${API_BASE}/memberships/subscribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ planId, paymentMethod })
    }).then(handleResponse),

  // Reservations
  getReservations: (params = '') =>
    fetch(`${API_BASE}/reservations${params ? '?' + new URLSearchParams(params) : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createReservation: (data) =>
    fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  cancelReservation: (id) =>
    fetch(`${API_BASE}/reservations/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Rentals
  getRentals: (params = '') =>
    fetch(`${API_BASE}/rentals${params ? '?' + new URLSearchParams(params) : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getRental: (id) =>
    fetch(`${API_BASE}/rentals/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  checkoutRental: (data) =>
    fetch(`${API_BASE}/rentals/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  returnRental: (data) =>
    fetch(`${API_BASE}/rentals/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Maintenance
  getMaintenanceList: (params = '') =>
    fetch(`${API_BASE}/maintenance${params ? '?' + new URLSearchParams(params) : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createMaintenance: (data) =>
    fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateMaintenance: (id, data) =>
    fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Reports
  getDashboardStats: () =>
    fetch(`${API_BASE}/reports/dashboard-stats`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getAvailabilityReport: () =>
    fetch(`${API_BASE}/reports/availability`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getRentalsReport: (params = '') =>
    fetch(`${API_BASE}/reports/rentals${params ? '?' + new URLSearchParams(params) : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getStationUtilizationReport: () =>
    fetch(`${API_BASE}/reports/stations`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getRevenueReport: () =>
    fetch(`${API_BASE}/reports/revenue`, {
      headers: getAuthHeaders()
    }).then(handleResponse)
};
