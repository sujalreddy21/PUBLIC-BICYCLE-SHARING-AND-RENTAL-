import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginRegister } from './pages/LoginRegister';
import { AdminDashboard } from './pages/AdminDashboard';
import { BicycleManagement } from './pages/BicycleManagement';
import { StationManagement } from './pages/StationManagement';
import { MembershipManagement } from './pages/MembershipManagement';
import { BicycleReservation } from './pages/BicycleReservation';
import { RentalCheckoutReturn } from './pages/RentalCheckoutReturn';
import { MemberDashboard } from './pages/MemberDashboard';
import { RentalHistory } from './pages/RentalHistory';
import { MaintenanceManagement } from './pages/MaintenanceManagement';
import { StationAttendantDashboard } from './pages/StationAttendantDashboard';
import { ReportsAnalytics } from './pages/ReportsAnalytics';

export default function App() {
  const { user, loading, token, logout } = useAuth();
  // View states: 'home' | 'login' | 'dashboard'
  const [currentView, setCurrentView] = useState('home');
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState('member');
  const [currentScreen, setCurrentScreen] = useState(2);
  const [targetBikeForCheckout, setTargetBikeForCheckout] = useState(null);

  // Set default initial screen based on user role upon login
  useEffect(() => {
    if (user && token) {
      setCurrentView('dashboard');
      if (user.role === 'admin' || user.role === 'operations_manager') {
        setCurrentScreen(2);
      } else if (user.role === 'station_attendant') {
        setCurrentScreen(11);
      } else if (user.role === 'member') {
        setCurrentScreen(8);
      }
    }
  }, [user?.role, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner label="Initializing Public Bicycle Sharing System..." size="lg" />
      </div>
    );
  }

  // 1. Not logged in and on Home Page:
  if (!token && currentView === 'home') {
    return (
      <HomePage
        onSelectRoleLogin={(role) => {
          setSelectedRoleForLogin(role);
          setCurrentView('login');
        }}
      />
    );
  }

  // 2. Not logged in and on Login/Register Page for chosen role:
  if (!token && currentView === 'login') {
    return (
      <LoginRegister
        initialRole={selectedRoleForLogin}
        onBackToHome={() => setCurrentView('home')}
        onLoginSuccess={() => setCurrentView('dashboard')}
      />
    );
  }

  // 3. User is logged in, but clicked "View Public Landing Page":
  if (token && currentView === 'home') {
    return (
      <div>
        {/* Floating Back to Dashboard Banner */}
        <div className="sticky top-0 z-50 bg-slate-950 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
          <span>Logged in as: <strong className="text-emerald-400">{user?.name}</strong> ({user?.role})</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-3.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
            >
              ← Return to Your Dashboard
            </button>
            <button
              onClick={logout}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-rose-900 text-slate-300 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        <HomePage
          onSelectRoleLogin={(role) => {
            setSelectedRoleForLogin(role);
            setCurrentView('dashboard');
          }}
        />
      </div>
    );
  }

  // 4. Logged in and viewing Dashboard (12 screens):
  const navigateToScreen = (screenNumber, extraData = null) => {
    if (extraData?.bikeId) {
      setTargetBikeForCheckout(extraData.bikeId);
    }
    setCurrentScreen(screenNumber);
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 2:
        return <AdminDashboard onNavigate={navigateToScreen} />;
      case 3:
        return <BicycleManagement />;
      case 4:
        return <StationManagement />;
      case 5:
        return <MembershipManagement />;
      case 6:
        return (
          <BicycleReservation
            onNavigateToCheckout={(bikeId) => navigateToScreen(7, { bikeId })}
          />
        );
      case 7:
        return <RentalCheckoutReturn defaultBikeId={targetBikeForCheckout} />;
      case 8:
        return <MemberDashboard onNavigate={navigateToScreen} />;
      case 9:
        return <RentalHistory />;
      case 10:
        return <MaintenanceManagement />;
      case 11:
        return <StationAttendantDashboard onNavigate={navigateToScreen} />;
      case 12:
        return <ReportsAnalytics />;
      default:
        return <AdminDashboard onNavigate={navigateToScreen} />;
    }
  };

  return (
    <DashboardLayout
      currentScreen={currentScreen}
      onSelectScreen={setCurrentScreen}
      onGoToHome={() => setCurrentView('home')}
    >
      {renderActiveScreen()}
    </DashboardLayout>
  );
}
