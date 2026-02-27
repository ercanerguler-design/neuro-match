import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

/**
 * iyzico Checkout Form sayfası.
 * PricingPage'den gelen iyzicoFormContent HTML'ini embed eder.
 * iyzico ödeme tamamlandığında backend /iyzico/callback'e POST eder,
 * o da bu frontend'i /payment/success veya /payment/failed'e yönlendirir.
 */
export default function PaymentPage() {
  const { state } = useLocation();
  const { lang } = useLanguage();
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const formContent = state?.iyzicoFormContent;
  const planName    = state?.planName || '';

  useEffect(() => {
    if (!formContent || !containerRef.current) {
      setError(true);
      return;
    }

    // iyzico checkoutFormContent içinde hem HTML hem de <script> tag'leri gelebilir.
    // innerHTML doğrudan script'leri çalıştırmaz, bu yüzden elle ekliyoruz.
    containerRef.current.innerHTML = formContent;

    // Script tag'lerini aktif hale getir
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = true;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      document.body.appendChild(newScript);
    });

    setLoaded(true);
  }, [formContent]);

  if (error || !formContent) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ color: '#94a3b8', fontSize: 16, textAlign: 'center' }}>
          {lang === 'en' ? 'Payment form could not be loaded.' : 'Ödeme formu yüklenemedi.'}
        </p>
        <Link to="/pricing" className="btn btn-secondary">
          {lang === 'en' ? '← Back to Plans' : '← Planlara Geri Dön'}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 520, marginBottom: 32, textAlign: 'center' }}>
        <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>🧠 X-Neu</Link>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>
          {lang === 'en'
            ? `Completing your ${planName} subscription`
            : `${planName} aboneliğinizi tamamlıyorsunuz`}
        </p>
      </div>

      {/* iyzico form container */}
      <div
        style={{
          width: '100%', maxWidth: 520,
          background: '#0d0d24',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
          minHeight: 520,
        }}
      >
        {!loaded && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 520 }}>
            <div className="loading-spinner" style={{ width: 40, height: 40 }} />
          </div>
        )}
        <div ref={containerRef} id="iyzipay-checkout-form" className="responsive" />
      </div>

      <p style={{ marginTop: 24, color: '#475569', fontSize: 12, textAlign: 'center' }}>
        {lang === 'en'
          ? '🔒 Secure payment powered by iyzico'
          : '🔒 iyzico altyapısıyla güvenli ödeme'}
      </p>
    </div>
  );
}
