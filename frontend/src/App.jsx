import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// 12 Screens
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
  const { user, loading, token } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(2);
  const [targetBikeForCheckout, setTargetBikeForCheckout] = useState(null);

  // Set default initial screen based on user role upon login
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'operations_manager') {
        setCurrentScreen(2);
      } else if (user.role === 'station_attendant') {
        setCurrentScreen(11);
      } else if (user.role === 'member') {
        setCurrentScreen(8);
      }
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner label="Initializing Public Bicycle Sharing System..." size="lg" />
      </div>
    );
  }

  // SCREEN 1: LOGIN AND REGISTRATION
  if (!token || !user) {
    return <LoginRegister onLoginSuccess={() => {}} />;
  }

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
    <DashboardLayout currentScreen={currentScreen} onSelectScreen={setCurrentScreen}>
      {renderActiveScreen()}
    </DashboardLayout>
  );
}
