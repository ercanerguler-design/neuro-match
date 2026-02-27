import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentFailedPage() {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const reason = params.get('reason') || '';

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 24, padding: 32, textAlign: 'center',
    }}>
      <div style={{ fontSize: 64 }}>❌</div>

      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>
        {lang === 'en' ? 'Payment Failed' : 'Ödeme Başarısız'}
      </h1>

      <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 420 }}>
        {reason
          ? decodeURIComponent(reason)
          : (lang === 'en'
            ? 'Your payment could not be processed. No charge was made.'
            : 'Ödemeniz işleme alınamadı. Herhangi bir ücret alınmadı.')}
      </p>

      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/pricing" className="btn btn-primary">
          {lang === 'en' ? '↩ Try Again' : '↩ Tekrar Dene'}
        </Link>
        <Link to="/dashboard" className="btn btn-secondary">
          {lang === 'en' ? '🏠 Dashboard' : '🏠 Ana Sayfa'}
        </Link>
      </div>
    </div>
  );
}
