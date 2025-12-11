import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/SupabaseClient';
import Layout from './components/Layout';

// --- PAGE IMPORTS ---
import ClientDashboard from './pages/client/ClientDashboard';
import CollateralSubmission from './pages/client/CollateralSubmission';
import ApplyForLoan from './pages/client/ApplyForLoan';
import ClientRegistration from './pages/Register';
import ClientProfile from './pages/client/ClientProfile';
import SupportPortal from './pages/SupportPortal';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClients from './pages/admin/AdminClients'; 
import AdminInvestors from './pages/admin/AdminInvestors';
import AdminUnderwriting from './pages/admin/AdminUnderwriting';
import AdminKYC from './pages/admin/AdminKYC';
import AdminCollateral from './pages/admin/AdminCollateral'; 
import AdminSupport from './pages/admin/AdminSupport';

// Super Admin / Future Pages
import AdminAgents from './pages/admin/AdminAgents';
import AdminStaff from './pages/admin/AdminStaff';
import AdminMonitoring from './pages/admin/AdminMonitoring';
import AdminClaims from './pages/admin/AdminClaims';
import AdminUploads from './pages/admin/AdminUploads';
import AdminPLE from './pages/admin/AdminPLE';
import AdminAuthorization from './pages/admin/AdminAuthorization';
import AdminWorkersPad from './pages/admin/AdminWorkersPad';

// Other
import LoginSelection from './pages/Login';
import TermsAndConditions from './pages/TermsAndConditions';
import ActivityLog from './pages/ActivityLog';

// --- ROLE DISPATCHER (FIXED FOR SUPER ADMIN) ---
const DashboardDispatcher = () => {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          const dbRole = data?.role || 'borrower';
          // Normalize names
          if (dbRole === 'borrower') setRole('client');
          else if (dbRole === 'super_admin') setRole('super_admin');
          else setRole('admin'); // 'agent' or 'admin' goes here
          
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Portal...</div>;

  // --- THE FIX: Handle Super Admin explicitly ---
  if (role === 'client') return <Navigate to="/client" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'super_admin') return <Navigate to="/admin" replace />; // Super Admin shares /admin route structure
  
  return <Navigate to="/client" replace />;
};

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          const dbRole = data?.role || 'borrower';
          setUserRole(dbRole === 'borrower' ? 'client' : dbRole);
          setRoleLoading(false);
        });
    } else {
      setRoleLoading(false);
    }
  }, [user]);

  if (loading || roleLoading) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Checking Permissions...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Permission Logic
  const isAuthorized = userRole === role || 
                       (role === 'admin' && (userRole === 'admin' || userRole === 'super_admin'));

  if (!isAuthorized) {
    if (userRole === 'client') return <Navigate to="/client" replace />;
    if (userRole === 'admin' || userRole === 'super_admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginSelection />} />
          <Route path="/login" element={<LoginSelection />} />
          <Route path="/register" element={<ClientRegistration />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* Dispatcher catches login redirect */}
          <Route path="/dashboard" element={<DashboardDispatcher />} />
          
          {/* --- CLIENT ROUTES --- */}
          <Route path="/client" element={<ProtectedRoute role="client"><Layout><ClientDashboard /></Layout></ProtectedRoute>} />
          <Route path="/client/submit" element={<ProtectedRoute role="client"><Layout><CollateralSubmission /></Layout></ProtectedRoute>} />
          <Route path="/client/apply" element={<ProtectedRoute role="client"><Layout><ApplyForLoan /></Layout></ProtectedRoute>} />
          <Route path="/client/profile" element={<ProtectedRoute role="client"><Layout><ClientProfile /></Layout></ProtectedRoute>} />
          <Route path="/client/support" element={<ProtectedRoute role="client"><Layout><SupportPortal /></Layout></ProtectedRoute>} />
          <Route path="/client/activity" element={<ProtectedRoute role="client"><Layout><ActivityLog /></Layout></ProtectedRoute>} />
          
          {/* --- ADMIN & SUPER ADMIN ROUTES --- */}
          {/* Main Dashboard (renders AdminDashboard or SuperAdminDashboard based on logic inside it) */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
          
          {/* Specific Pages */}
          <Route path="/admin/clients" element={<ProtectedRoute role="admin"><Layout><AdminClients /></Layout></ProtectedRoute>} />
          <Route path="/admin/investors" element={<ProtectedRoute role="admin"><Layout><AdminInvestors /></Layout></ProtectedRoute>} />
          <Route path="/admin/underwriting" element={<ProtectedRoute role="admin"><Layout><AdminUnderwriting /></Layout></ProtectedRoute>} />
          <Route path="/admin/kyc" element={<ProtectedRoute role="admin"><Layout><AdminKYC /></Layout></ProtectedRoute>} />
          <Route path="/admin/review" element={<ProtectedRoute role="admin"><Layout><AdminCollateral /></Layout></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute role="admin"><Layout><AdminSupport /></Layout></ProtectedRoute>} />

          {/* Super Admin Specific Pages (Mapped to placeholders for now) */}
          <Route path="/admin/staff" element={<ProtectedRoute role="admin"><Layout><AdminStaff /></Layout></ProtectedRoute>} />
          <Route path="/admin/claims" element={<ProtectedRoute role="admin"><Layout><AdminClaims /></Layout></ProtectedRoute>} />
          <Route path="/admin/monitoring" element={<ProtectedRoute role="admin"><Layout><AdminMonitoring /></Layout></ProtectedRoute>} />
          <Route path="/admin/workers-pad" element={<ProtectedRoute role="admin"><Layout><AdminWorkersPad /></Layout></ProtectedRoute>} />
          <Route path="/admin/uploads" element={<ProtectedRoute role="admin"><Layout><AdminUploads /></Layout></ProtectedRoute>} />
          <Route path="/admin/ple" element={<ProtectedRoute role="admin"><Layout><AdminPLE /></Layout></ProtectedRoute>} />
          <Route path="/admin/authorization" element={<ProtectedRoute role="admin"><Layout><AdminAuthorization /></Layout></ProtectedRoute>} />
          <Route path="/admin/loans-details" element={<ProtectedRoute role="admin"><Layout><AdminLoanDetails /></Layout></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}