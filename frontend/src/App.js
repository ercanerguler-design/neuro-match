import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { LanguageProvider } from './context/LanguageContext';

// Pages - Lazy loaded
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AnalysisPage = React.lazy(() => import('./pages/AnalysisPage'));
const ResultsPage = React.lazy(() => import('./pages/ResultsPage'));
const MatchPage = React.lazy(() => import('./pages/MatchPage'));
const CoachPage = React.lazy(() => import('./pages/CoachPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const EnterprisePage = React.lazy(() => import('./pages/EnterprisePage'));
const EnterpriseLoginPage = React.lazy(() => import('./pages/EnterpriseLoginPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const KVKKPage = React.lazy(() => import('./pages/KVKKPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const ContentPage = React.lazy(() => import('./pages/ContentPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const LoadingScreen = () => (
  <div style={{
    position: 'fixed', inset: 0, background: '#0a0a1a',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
  }}>
    <div style={{ fontSize: 48 }}>🧠</div>
    <div className="loading-spinner" style={{ width: 40, height: 40 }}></div>
    <p style={{ color: '#00d4ff', fontWeight: 600 }}>X-Neu</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/enterprise" element={<EnterprisePage />} />

            {/* Auth */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/enterprise/login" element={<EnterpriseLoginPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/match" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><CoachPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/content" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

            {/* Legal & Contact */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/kvkk" element={<KVKKPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0f0f2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
