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
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCollateralReview from './pages/admin/AdminCollateralReview';
import AdminClients from './pages/admin/AdminClients';
import AdminInvestors from './pages/admin/AdminInvestors';
import AdminAgents from './pages/admin/AdminAgents';
import AdminStaff from './pages/admin/AdminStaff';
import AdminCompliance from './pages/admin/AdminCompliance';
import AdminKYC from './pages/admin/AdminKYC';
import AdminAML from './pages/admin/AdminAML';
import AdminUnderwriting from './pages/admin/AdminUnderwriting';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSupport from './pages/admin/AdminSupport';
import AdminLoanDetails from './pages/admin/AdminLoanDetails';
import AdminMonitoring from './pages/admin/AdminMonitoring';
import AdminWorkersPad from './pages/admin/AdminWorkersPad';
import AdminUploads from './pages/admin/AdminUploads';
import AdminPLE from './pages/admin/AdminPLE';
import AdminAuthorization from './pages/admin/AdminAuthorization';
import AdminClaims from './pages/admin/AdminClaims';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerReferrals from './pages/partner/PartnerReferrals';
import PartnerEarnings from './pages/partner/PartnerEarnings';
import InvestorDashboard from './pages/investor/InvestorDashboard';
import LoginSelection from './pages/Login';
import TermsAndConditions from './pages/TermsAndConditions';
import ActivityLog from './pages/ActivityLog';

// --- PROTECTED ROUTE LOGIC ---
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          // Map DB role 'borrower' -> 'client' for routes
          const dbRole = data?.role;
          setUserRole(dbRole === 'borrower' ? 'client' : dbRole);
          setRoleLoading(false);
        });
    } else {
      setRoleLoading(false);
    }
  }, [user]);

  if (loading || roleLoading) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Loading Role...</div>;
  if (!user) return <Navigate to="/" replace />;

  const isAuthorized = userRole === role || 
                       (role === 'admin' && (userRole === 'admin' || userRole === 'super_admin'));

  if (!isAuthorized) {
    if (userRole === 'client') return <Navigate to="/client" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
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
          
          {/* Client Routes */}
          <Route path="/client" element={<ProtectedRoute role="client"><Layout><ClientDashboard /></Layout></ProtectedRoute>} />
          <Route path="/client/submit" element={<ProtectedRoute role="client"><Layout><CollateralSubmission /></Layout></ProtectedRoute>} />
          <Route path="/client/apply" element={<ProtectedRoute role="client"><Layout><ApplyForLoan /></Layout></ProtectedRoute>} />
          <Route path="/client/profile" element={<ProtectedRoute role="client"><Layout><ClientProfile /></Layout></ProtectedRoute>} />
          <Route path="/client/support" element={<ProtectedRoute role="client"><Layout><SupportPortal /></Layout></ProtectedRoute>} />
          <Route path="/client/activity" element={<ProtectedRoute role="client"><Layout><ActivityLog /></Layout></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute role="admin"><Layout><AdminClients /></Layout></ProtectedRoute>} />
          <Route path="/admin/investors" element={<ProtectedRoute role="admin"><Layout><AdminInvestors /></Layout></ProtectedRoute>} />
          <Route path="/admin/underwriting" element={<ProtectedRoute role="admin"><Layout><AdminUnderwriting /></Layout></ProtectedRoute>} />
          
          {/* Super Admin / Extra Routes */}
          <Route path="/admin/staff" element={<ProtectedRoute role="admin"><Layout><AdminStaff /></Layout></ProtectedRoute>} />
          <Route path="/admin/claims" element={<ProtectedRoute role="admin"><Layout><AdminClaims /></Layout></ProtectedRoute>} />
          <Route path="/admin/monitoring" element={<ProtectedRoute role="admin"><Layout><AdminMonitoring /></Layout></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
