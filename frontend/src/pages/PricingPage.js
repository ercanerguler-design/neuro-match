import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PricingPage() {
  const { t, lang } = useLanguage();

  const p = (t.pricing && t.pricing.plans) || {};
  const mo = (t.pricing && t.pricing.mo) || '/ay';
  const PLANS = [
    {
      name: (p.free && p.free.name) || 'Ücretsiz',
      price: '₺0',
      period: mo,
      color: '#64748b',
      features: (p.free && p.free.features) || ['Temel anket analizi', 'Beyin tipi belirleme', 'Temel rapor', 'AI koç (5 soru/gün)', 'Günlük check-in'],
      cta: (p.free && p.free.cta) || 'Ücretsiz Başla',
      link: '/register',
      popular: false,
    },
    {
      name: (p.basic && p.basic.name) || 'Basic',
      price: '₺99',
      period: mo,
      color: '#00d4ff',
      features: (p.basic && p.basic.features) || ['Tüm ücretsiz özellikler', 'Ses analizi', 'Detaylı kariyer raporu', 'AI koç sınırsız', '5 eşleştirme/ay', 'Haftalık içgörüler'],
      cta: (p.basic && p.basic.cta) || "Basic'e Geç",
      planId: 'basic',
      popular: false,
    },
    {
      name: (p.premium && p.premium.name) || 'Premium',
      price: '₺299',
      period: mo,
      color: '#7c3aed',
      features: (p.premium && p.premium.features) || ['Tüm Basic özellikler', 'Yüz analizi', 'Kapsamlı nöro rapor', 'Sınırsız eşleştirme', 'İlişki haritası', 'Rapor paylaşımı', 'Öncelikli destek'],
      cta: (p.premium && p.premium.cta) || "Premium'a Geç",
      planId: 'premium',
      popular: true,
    },
    {
      name: (p.enterprise && p.enterprise.name) || 'Kurumsal',
      price: '₺1,999',
      period: mo,
      color: '#f59e0b',
      features: (p.enterprise && p.enterprise.features) || ['Tüm Premium özellikler', 'Ekip analizi', 'HR içgörüleri', 'Burnout tespiti', 'API erişimi', 'Özel entegrasyon', 'Dedicated manager'],
      cta: (p.enterprise && p.enterprise.cta) || 'Kurumsal Başvur',
      link: '/enterprise',
      popular: false,
    },
  ];

  const handleUpgrade = async (planId) => {
    const token = localStorage.getItem('neuro-auth');
    if (!token) {
      window.location.href = '/register';
      return;
    }
    try {
      const { paymentAPI } = await import('../services/api');
      const res = await paymentAPI.createCheckout(planId);
      window.location.href = res.data.checkoutUrl;
    } catch {
      window.location.href = '/register';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: '80px 40px' }}>
      <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', top: 0, right: 0 }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: 14, marginBottom: 24, display: 'inline-block' }}>← {(t.pricing && t.pricing.homeLink) || 'Ana Sayfa'}</Link>
          <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 16 }}>
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{(t.pricing && t.pricing.pageTitle) || 'Fiyatlandırma'}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18 }}>{(t.pricing && t.pricing.pageSubtitle) || 'İhtiyacına göre plan seç. İstediğin zaman iptal et.'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{ position: 'relative' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', borderRadius: 999, padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', zIndex: 1 }}>
                  🔥 {(t.pricing && t.pricing.popular) || 'En Popüler'}
                </div>
              )}
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', border: plan.popular ? `2px solid ${plan.color}` : undefined, boxShadow: plan.popular ? `0 0 30px ${plan.color}30` : undefined }}>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: plan.color, marginBottom: 8 }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 40, fontWeight: 900 }}>{plan.price}</span>
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>{plan.period}</span>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                  {plan.features.map((feature) => (
                    <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#94a3b8' }}>
                      <span style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.link ? (
                  <Link to={plan.link} className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full`} style={{ textAlign: 'center' }}>
                    {plan.cta}
                  </Link>
                ) : (
                  <button onClick={() => handleUpgrade(plan.planId)} className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                    {plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, color: '#64748b', fontSize: 14 }}>
          ✅ {lang === 'en' ? '14-day free trial' : '14 gün ücretsiz deneme'} &nbsp;|&nbsp; 🔒 {lang === 'en' ? 'Secure payment' : 'Güvenli ödeme'} &nbsp;|&nbsp; ❌ {lang === 'en' ? 'Cancel anytime' : 'İstediğin zaman iptal'}
        </div>
      </div>
    </div>
  );
}
