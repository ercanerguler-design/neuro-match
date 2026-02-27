import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { LanguageProvider } from './context/LanguageContext';
import { authAPI } from './services/api';

// ── Error Boundary ────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('X-Neu ErrorBoundary caught:', error, info);
  }

  // Reset error when navigating to a different route (key changed)
  componentDidUpdate(prevProps) {
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0a1a',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 56 }}>⚠️</div>
          <h2 style={{ color: '#ef4444', fontWeight: 700 }}>Bir şeyler yanlış gitti</h2>
          <p style={{ color: '#64748b', maxWidth: 400 }}>
            {this.state.error?.message || 'Beklenmedik bir hata oluştu.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard'; }}
            style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            🏠 Dashboard'a Dön
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrapper so ErrorBoundary gets the current location key and resets on route change
function ErrorBoundaryWithLocation({ children }) {
  const location = useLocation();
  return <ErrorBoundary locationKey={location.pathname}>{children}</ErrorBoundary>;
}

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
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = React.lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailedPage = React.lazy(() => import('./pages/PaymentFailedPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,        // 30 saniye cache — geri gelince yeniden yüklemez
      cacheTime: 5 * 60 * 1000,    // 5 dk cache'de tut
    },
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

// Auto-refresh user profile on every app boot (ensures neuroProfile is always up to date)
function AppBootstrap() {
  const { token, updateUser } = useAuthStore();
  useEffect(() => {
    if (!token) return;
    authAPI.getMe()
      .then((res) => {
        const u = res?.data?.data;
        if (u) {
          if (u.neuroProfile?.brainType) {
            u.neuroProfile.brainType = u.neuroProfile.brainType.toLowerCase();
          }
          updateUser(u);
        }
      })
      .catch(() => {}); // silent — just a best-effort refresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
      <BrowserRouter>
        <AppBootstrap />
        <ErrorBoundaryWithLocation>
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

            {/* Payment */}
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />

            {/* Legal & Contact */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/kvkk" element={<KVKKPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundaryWithLocation>

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
