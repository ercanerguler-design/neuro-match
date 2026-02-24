import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { enterpriseAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const FEATURE_ICONS = ['👥', '🔥', '🎯', '📊', '🤖', '🔒'];

export default function EnterprisePage() {
  const { user } = useAuthStore();
  const { t, lang, setLang } = useLanguage();
  const isEnterprise = user?.subscription?.plan === 'enterprise' || user?.role === 'enterprise' || user?.role === 'admin';

  // ── Enterprise Dashboard (for enterprise/admin users) ─────────────────────
  const EnterpriseDashboard = () => {
    const { data: dashData, isLoading: dashLoading } = useQuery('enterpriseDashboard', () => enterpriseAPI.getDashboard(), { staleTime: 60000 });
    const { data: hrData } = useQuery('hrInsights', () => enterpriseAPI.getHRInsights(), { staleTime: 60000 });

    const dash = dashData?.data?.data || {};
    const hr = hrData?.data?.data || {};

    const brainBalance = hr.teamBalance || { analytical: 3, creative: 2, empathetic: 4, strategic: 1 };
    const total = Object.values(brainBalance).reduce((a, b) => a + b, 0) || 1;

    const brainColors = { analytical: '#00d4ff', creative: '#7c3aed', empathetic: '#10b981', strategic: '#f59e0b' };
    const brainLabels = {
      analytical: { tr: 'Analitik', en: 'Analytical' },
      creative: { tr: 'Yaratıcı', en: 'Creative' },
      empathetic: { tr: 'Empatik', en: 'Empathetic' },
      strategic: { tr: 'Stratejik', en: 'Strategic' },
    };

    return (
      <MainLayout>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
                {lang === 'tr' ? '🏢 Kurumsal Dashboard' : '🏢 Enterprise Dashboard'}
              </h1>
              <p style={{ color: '#94a3b8' }}>
                {lang === 'tr' ? 'Ekibinizin nörolojik analiz paneli' : "Your team's neurological analytics panel"}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['tr', 'en'].map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${lang === l ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, color: lang === l ? '#00d4ff' : '#64748b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s' }}>
                  {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          {dashLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>{t.common.loading}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { icon: '👥', label: t.enterprise.teamMembers, value: total, color: '#00d4ff' },
                { icon: '🤝', label: t.enterprise.teamCompatibility, value: `%${dash.teamCompatibility ?? 87}`, color: '#10b981' },
                { icon: '🔥', label: t.enterprise.burnoutRisk, value: `%${dash.burnoutRisk ?? 23}`, color: '#ef4444' },
                { icon: '⚡', label: t.enterprise.productivity, value: dash.productivityScore ?? 91, color: '#7c3aed' },
              ].map((stat) => (
                <div key={stat.label} className="card" style={{ textAlign: 'center', transition: 'transform .2s', cursor: 'default' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Brain Type Distribution */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{t.enterprise.brainDistribution}</h3>
              {Object.entries(brainBalance).map(([type, count]) => {
                const pct = Math.round((count / total) * 100);
                const label = brainLabels[type]?.[lang] || type;
                return (
                  <div key={type} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                      <span style={{ color: brainColors[type], fontWeight: 600 }}>{label}</span>
                      <span style={{ color: '#94a3b8' }}>
                        {count} {lang === 'tr' ? 'kişi' : 'people'} ({pct}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${brainColors[type]}, ${brainColors[type]}88)`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HR Alerts & Insights */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>
                {lang === 'tr' ? '⚠️ HR Önerileri & Uyarılar' : '⚠️ HR Insights & Alerts'}
              </h3>
              {/* Hiring Recommendations */}
              {(hr.hiringRecommendations || [lang === 'tr' ? 'Empatik beyin tipleri için müşteri hizmetleri rolü önerilir' : 'Empathetic brain types recommended for customer service roles']).slice(0, 2).map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', borderRadius: 8, marginBottom: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span>✅</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{rec}</span>
                </div>
              ))}
              {/* Retention Risk */}
              {(hr.retentionRisk || [lang === 'tr' ? '3 çalışanda yüksek burnout riski tespit edildi' : 'High burnout risk detected in 3 team members']).slice(0, 2).map((risk, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', borderRadius: 8, marginBottom: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span>🔥</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{risk}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span>💡</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>
                  {lang === 'tr' ? 'Analitik-Yaratıcı çalışanları iş birliği projelerinde eşleştirin' : 'Pair Analytical-Creative employees on collaboration projects'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>
              {lang === 'tr' ? '🚀 Hızlı İşlemler' : '🚀 Quick Actions'}
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: lang === 'tr' ? '📊 Ekip Analizi' : '📊 Team Analysis', href: '#' },
                { label: lang === 'tr' ? '👤 Üye Ekle' : '👤 Add Member', href: '#' },
                { label: lang === 'tr' ? '📈 Rapor İndir' : '📈 Download Report', href: '#' },
                { label: lang === 'tr' ? '🎯 İşe Alım Modu' : '🎯 Hiring Mode', href: '#' },
              ].map((action) => (
                <a key={action.label} href={action.href} className="btn" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'all .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  };

  // ── Enterprise users see the dashboard ───────────────────────────────────
  if (isEnterprise) return <EnterpriseDashboard />;

  // ── Marketing page for non-enterprise users ───────────────────────────────
  const features = t.enterprise.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }));

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: '80px 40px', position: 'relative' }}>
      <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', top: 0, right: 0 }} />

      {/* Language Toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 100 }}>
        {['tr', 'en'].map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${lang === l ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, color: lang === l ? '#f59e0b' : '#64748b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s' }}>
            {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: 14, marginBottom: 24, display: 'inline-block' }}>
            ← {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
          </Link>
          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>
            🏢 {lang === 'tr' ? 'Kurumsal Çözüm' : 'Enterprise Solution'}
          </div>
          <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
            {lang === 'tr' ? "Ekibinizin " : "Unleash Your Team's "}
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {lang === 'tr' ? 'Nörolojik Gücünü' : 'Neurological Power'}
            </span>
            {lang === 'tr' ? ' Keşfedin' : ''}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 20, maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.7 }}>
            {lang === 'tr'
              ? 'Ekibinizin beyin tipi uyumunu analiz edin. Burnout riskini önleyin. Üretkenliği %40 artırın.'
              : 'Analyze your team\'s brain type compatibility. Prevent burnout risk. Increase productivity by 40%.'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/enterprise/login" className="btn btn-primary btn-lg" style={{ fontSize: 18, padding: '18px 48px', background: 'linear-gradient(135deg, #f59e0b, #00d4ff)' }}>
              🏢 {lang === 'tr' ? 'Kurumsal Giriş' : 'Enterprise Login'}
            </Link>
            <Link to="/pricing" className="btn btn-lg" style={{ fontSize: 16, padding: '18px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: 12, textDecoration: 'none' }}>
              {lang === 'tr' ? 'Planları Gör →' : 'View Plans →'}
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 80 }}>
          {[
            { value: '%40', label: lang === 'tr' ? 'Üretkenlik Artışı' : 'Productivity Increase' },
            { value: '%68', label: lang === 'tr' ? 'Burnout Azalması' : 'Burnout Reduction' },
            { value: '%91', label: lang === 'tr' ? 'Müşteri Memnuniyeti' : 'Client Satisfaction' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center', borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#f59e0b', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
          {lang === 'tr' ? '🎯 Neler Sunuyoruz?' : '🎯 What We Offer'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, marginBottom: 80 }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ borderColor: 'rgba(245,158,11,0.2)', transition: 'transform .2s, border-color .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,212,255,0.08))', border: '1px solid rgba(245,158,11,0.25)', padding: 56 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
            {lang === 'tr' ? 'Ekibinizi Dönüştürün' : 'Transform Your Team'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            {lang === 'tr'
              ? 'Demo talep edin veya kurumsal hesabınızla giriş yapın.'
              : 'Request a demo or sign in with your enterprise account.'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/enterprise/login" style={{ background: 'linear-gradient(135deg, #f59e0b, #00d4ff)', color: '#fff', padding: '14px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
              {lang === 'tr' ? '🏢 Kurumsal Giriş' : '🏢 Enterprise Login'}
            </Link>
            <a href="mailto:sce@scegrup.com" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '14px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
              {lang === 'tr' ? '📧 Demo Talep Et' : '📧 Request Demo'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
