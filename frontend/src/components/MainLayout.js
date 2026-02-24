import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function MainLayout({ children }) {
  const { user, logout } = useAuthStore();
  const { t, lang, setLang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sayfa değişince mobilde menüyü kapat
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const isEnterprise = user?.subscription?.plan === 'enterprise' || user?.role === 'enterprise' || user?.role === 'admin';

  const NAV_ITEMS = [
    { path: '/dashboard', icon: '🏠', label: t.nav.dashboard },
    { path: '/analysis', icon: '🧠', label: t.nav.analysis },
    { path: '/match', icon: '💑', label: t.nav.match },
    { path: '/coach', icon: '🤖', label: t.nav.coach },
    { path: '/reports', icon: '📊', label: t.nav.reports },
    { path: '/profile', icon: '👤', label: t.nav.profile },
    ...(isEnterprise ? [{ path: '/enterprise', icon: '🏢', label: t.nav.enterprise }] : []),
    ...(user?.role === 'admin' ? [{ path: '/admin', icon: '🛡️', label: 'Admin Panel' }] : []),
  ];

  const handleLogout = () => {
    logout();
    toast.success(lang === 'tr' ? 'Çıkış yapıldı 👋' : 'Signed out 👋');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a1a' }}>

      {/* Mobil overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 40, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Mobil hamburger butonu */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          style={{
            position: 'fixed', top: 14, left: 14, zIndex: 60,
            background: '#0d0d24', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, width: 42, height: 42, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 5, boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block', width: 20, height: 2, borderRadius: 2,
              background: sidebarOpen ? '#00d4ff' : '#94a3b8',
              transition: 'all 0.2s',
              transform: sidebarOpen
                ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                  : 'scaleX(0)'
                : 'none',
            }} />
          ))}
        </button>
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260, background: '#0d0d24',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, zIndex: 50,
        left: isMobile ? (sidebarOpen ? 0 : -270) : 0,
        transition: isMobile ? 'left 0.25s ease' : 'none',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 16px rgba(0,212,255,0.3)' }}>🧠</div>
            <span style={{ fontSize: 17, fontWeight: 800, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEURO-MATCH</span>
          </Link>
          {isEnterprise && (
            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#c084fc', fontWeight: 700 }}>
              🏢 ENTERPRISE
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            const hovered = hoveredPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
                  textDecoration: 'none', fontWeight: active ? 700 : 500, fontSize: 14.5, transition: 'all 0.2s',
                  background: active ? 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.08))' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: active ? '#00d4ff' : hovered ? '#e2e8f0' : '#94a3b8',
                  border: active ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                  boxShadow: active ? '0 0 12px rgba(0,212,255,0.08)' : 'none',
                }}
              >
                <span style={{ fontSize: 18, minWidth: 22, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Language toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {['tr', 'en'].map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{
                flex: 1, padding: '7px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: lang === l ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: lang === l ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: lang === l ? '#00d4ff' : '#64748b',
                transition: 'all 0.2s',
              }}>
                {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
              </button>
            ))}
          </div>

          {/* Plan badge */}
          <div style={{
            background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 8, padding: '8px 12px', marginBottom: 12,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>{t.common.plan}:</span>
            <span style={{ color: '#00d4ff', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {user?.subscription?.plan || 'free'}
            </span>
          </div>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 0' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, boxShadow: '0 0 14px rgba(0,212,255,0.3)',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)', color: '#f87171',
              padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
              fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
          >
            🚪 {t.nav.logout}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 260,
        minHeight: '100vh',
        background: '#0a0a1a',
        overflowX: 'hidden',
      }}>
        <div style={{ padding: isMobile ? '64px 16px 24px' : 32, maxWidth: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
