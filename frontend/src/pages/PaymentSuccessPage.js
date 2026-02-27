import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const { updateUser } = useAuthStore();
  const plan = params.get('plan') || '';

  // Kullanıcı verisini yenile (plan güncellenmiş olacak)
  useEffect(() => {
    authAPI.getMe()
      .then((res) => updateUser(res.data.data))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planLabel = {
    basic: 'Basic', premium: 'Premium', enterprise: lang === 'en' ? 'Enterprise' : 'Kurumsal',
  }[plan] || plan;

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 24, padding: 32, textAlign: 'center',
    }}>
      <div style={{ fontSize: 72 }}>🎉</div>

      <h1 style={{ fontSize: 36, fontWeight: 900 }}>
        <span style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {lang === 'en' ? 'Payment Successful!' : 'Ödeme Başarılı!'}
        </span>
      </h1>

      {planLabel && (
        <p style={{ color: '#94a3b8', fontSize: 18 }}>
          {lang === 'en'
            ? `Welcome to X-Neu ${planLabel}. Your subscription is now active.`
            : `X-Neu ${planLabel} planına hoş geldiniz. Aboneliğiniz aktif.`}
        </p>
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/dashboard" className="btn btn-primary">
          {lang === 'en' ? '🏠 Go to Dashboard' : '🏠 Dashboard\'a Git'}
        </Link>
        <Link to="/profile" className="btn btn-secondary">
          {lang === 'en' ? '👤 View Profile' : '👤 Profilim'}
        </Link>
      </div>
    </div>
  );
}
