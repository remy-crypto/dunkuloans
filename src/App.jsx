import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/SupabaseClient';
import Layout from './components/Layout';

// --- NEW LANDING PAGE ---
import LandingPage from './pages/LandingPage'; // <--- NEW IMPORT

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
import AdminLoanDetails from './pages/admin/AdminLoanDetails';
import AdminAgents from './pages/admin/AdminAgents';
import AdminStaff from './pages/admin/AdminStaff';
import AdminCompliance from './pages/admin/AdminCompliance';
import AdminAML from './pages/admin/AdminAML';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMonitoring from './pages/admin/AdminMonitoring';
import AdminWorkersPad from './pages/admin/AdminWorkersPad';
import AdminUploads from './pages/admin/AdminUploads';
import AdminPLE from './pages/admin/AdminPLE';
import AdminAuthorization from './pages/admin/AdminAuthorization';
import AdminClaims from './pages/admin/AdminClaims';

// Partners & Investors
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerReferrals from './pages/partner/PartnerReferrals';
import PartnerEarnings from './pages/partner/PartnerEarnings';
import InvestorDashboard from './pages/investor/InvestorDashboard';

import LoginSelection from './pages/Login';
import TermsAndConditions from './pages/TermsAndConditions';
import ActivityLog from './pages/ActivityLog';


// --- ROLE DISPATCHER ---
const DashboardDispatcher = () => {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          let dbRole = data?.role || 'borrower';
          if (dbRole === 'borrower') dbRole = 'client';
          setRole(dbRole);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Portal...</div>;

  if (role === 'partner') return <Navigate to="/partner" replace />;
  if (role === 'client') return <Navigate to="/client" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'super_admin') return <Navigate to="/admin" replace />;
  
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
          let dbRole = data?.role || 'borrower';
          if (dbRole === 'borrower') dbRole = 'client';
          setUserRole(dbRole);
          setRoleLoading(false);
        });
    } else {
      setRoleLoading(false);
    }
  }, [user]);

  if (loading || roleLoading) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Checking...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const isAuthorized = userRole === role || 
                       (role === 'admin' && (userRole === 'admin' || userRole === 'super_admin'));

  if (!isAuthorized) {
    if (userRole === 'partner') return <Navigate to="/partner" replace />;
    if (userRole === 'client') return <Navigate to="/client" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'super_admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* This is the new change: Root goes to Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<LoginSelection />} />
          <Route path="/register" element={<ClientRegistration />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* Logic to send user to correct dashboard */}
          <Route path="/dashboard" element={<DashboardDispatcher />} />
          
          {/* --- PROTECTED ROUTES (Unchanged) --- */}
          <Route path="/client" element={<ProtectedRoute role="client"><Layout><ClientDashboard /></Layout></ProtectedRoute>} />
          <Route path="/client/submit" element={<ProtectedRoute role="client"><Layout><CollateralSubmission /></Layout></ProtectedRoute>} />
          <Route path="/client/apply" element={<ProtectedRoute role="client"><Layout><ApplyForLoan /></Layout></ProtectedRoute>} />
          <Route path="/client/profile" element={<ProtectedRoute role="client"><Layout><ClientProfile /></Layout></ProtectedRoute>} />
          <Route path="/client/support" element={<ProtectedRoute role="client"><Layout><SupportPortal /></Layout></ProtectedRoute>} />
          <Route path="/client/activity" element={<ProtectedRoute role="client"><Layout><ActivityLog /></Layout></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute role="admin"><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute role="admin"><Layout><AdminClients /></Layout></ProtectedRoute>} />
          <Route path="/admin/investors" element={<ProtectedRoute role="admin"><Layout><AdminInvestors /></Layout></ProtectedRoute>} />
          <Route path="/admin/underwriting" element={<ProtectedRoute role="admin"><Layout><AdminUnderwriting /></Layout></ProtectedRoute>} />
          <Route path="/admin/kyc" element={<ProtectedRoute role="admin"><Layout><AdminKYC /></Layout></ProtectedRoute>} />
          <Route path="/admin/review" element={<ProtectedRoute role="admin"><Layout><AdminCollateral /></Layout></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute role="admin"><Layout><AdminSupport /></Layout></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute role="admin"><Layout><AdminStaff /></Layout></ProtectedRoute>} />
          <Route path="/admin/claims" element={<ProtectedRoute role="admin"><Layout><AdminClaims /></Layout></ProtectedRoute>} />
          <Route path="/admin/monitoring" element={<ProtectedRoute role="admin"><Layout><AdminMonitoring /></Layout></ProtectedRoute>} />
          <Route path="/admin/workers-pad" element={<ProtectedRoute role="admin"><Layout><AdminWorkersPad /></Layout></ProtectedRoute>} />
          <Route path="/admin/uploads" element={<ProtectedRoute role="admin"><Layout><AdminUploads /></Layout></ProtectedRoute>} />
          <Route path="/admin/ple" element={<ProtectedRoute role="admin"><Layout><AdminPLE /></Layout></ProtectedRoute>} />
          <Route path="/admin/authorization" element={<ProtectedRoute role="admin"><Layout><AdminAuthorization /></Layout></ProtectedRoute>} />
          <Route path="/admin/loans-details" element={<ProtectedRoute role="admin"><Layout><AdminLoanDetails /></Layout></ProtectedRoute>} />
          <Route path="/admin/agents" element={<ProtectedRoute role="admin"><Layout><AdminAgents /></Layout></ProtectedRoute>} />
          <Route path="/admin/compliance" element={<ProtectedRoute role="admin"><Layout><AdminCompliance /></Layout></ProtectedRoute>} />
          <Route path="/admin/aml" element={<ProtectedRoute role="admin"><Layout><AdminAML /></Layout></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute role="admin"><Layout><AdminPayments /></Layout></ProtectedRoute>} />
          
          <Route path="/partner" element={<ProtectedRoute role="partner"><Layout><PartnerDashboard /></Layout></ProtectedRoute>} />
          <Route path="/partner/referrals" element={<ProtectedRoute role="partner"><Layout><PartnerReferrals /></Layout></ProtectedRoute>} />
          <Route path="/partner/earnings" element={<ProtectedRoute role="partner"><Layout><PartnerEarnings /></Layout></ProtectedRoute>} />
          <Route path="/investor" element={<ProtectedRoute role="investor"><Layout><InvestorDashboard /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}