import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

export default function EnterpriseLoginPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const te = t.enterprise;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      const user = res.data.user;
      setAuth(user, res.data.token);

      // Check if enterprise/admin user
      if (user.subscription?.plan === 'enterprise' || user.role === 'enterprise' || user.role === 'admin') {
        toast.success(`${te.loginTitle} — ${user.name} ✅`);
        navigate('/enterprise');
      } else {
        toast.success(lang === 'tr' ? `Hoş geldin, ${user.name}!` : `Welcome, ${user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || (lang === 'tr' ? 'Giriş başarısız' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', top: -150, left: -100 }} />
      <div className="bg-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)', bottom: -100, right: -100 }} />

      {/* Language toggle */}
      <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 8 }}>
        {['tr', 'en'].map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: lang === l ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
            border: lang === l ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.1)',
            color: lang === l ? '#c084fc' : '#64748b',
            transition: 'all 0.2s',
          }}>{l.toUpperCase()}</button>
        ))}
      </div>

      {/* Back link */}
      <Link to="/" style={{ position: 'absolute', top: 24, left: 24, color: '#64748b', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
      </Link>

      <div className="glass" style={{ width: '100%', maxWidth: 460, padding: 48, position: 'relative', zIndex: 1, border: '1px solid rgba(124,58,237,0.3)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏢</div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, marginBottom: 8,
            background: 'linear-gradient(135deg, #c084fc, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>NEURO-MATCH</h1>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>{te.loginTitle}</p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{te.loginSubtitle}</p>
        </div>

        {/* Enterprise badge */}
        <div style={{
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
        }}>
          <span style={{ fontSize: 20 }}>🔐</span>
          <span style={{ color: '#c084fc', fontWeight: 600 }}>
            {lang === 'tr' ? 'Kurumsal Güvenli Giriş' : 'Enterprise Secure Login'}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">{t.auth.email}</label>
            <input
              className="form-input"
              type="email"
              placeholder={lang === 'tr' ? 'sirket@domain.com' : 'company@domain.com'}
              style={{ borderColor: 'rgba(124,58,237,0.3)' }}
              {...register('email', {
                required: lang === 'tr' ? 'Email gerekli' : 'Email required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: lang === 'tr' ? 'Geçerli email girin' : 'Enter valid email' }
              })}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">{t.auth.password}</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              style={{ borderColor: 'rgba(124,58,237,0.3)' }}
              {...register('password', { required: lang === 'tr' ? 'Şifre gerekli' : 'Password required' })}
            />
            {errors.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ color: '#c084fc', textDecoration: 'none', fontSize: 14 }}>
              {t.auth.forgotPassword}
            </Link>
            <Link to="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>
              {lang === 'tr' ? 'Normal Giriş' : 'Regular Login'}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #c084fc)',
              color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', marginBottom: 20,
            }}
          >
            {loading ? <div className="loading-spinner" /> : `🏢 ${te.loginBtn}`}
          </button>
        </form>

        {/* Divider */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>{te.noAccount}</p>
          <a
            href="mailto:sce@scegrup.com"
            style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: 10,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
              color: '#c084fc', textDecoration: 'none', fontWeight: 600, fontSize: 14,
            }}
          >
            📧 {te.contactSales}
          </a>
        </div>

        {/* Features preview */}
        <div style={{ marginTop: 28, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
            {lang === 'tr' ? 'Kurumsal Özellikler' : 'Enterprise Features'}
          </p>
          {[
            lang === 'tr' ? '👥 Ekip Uyum Analizi' : '👥 Team Compatibility Analysis',
            lang === 'tr' ? '🔥 Burnout Tespiti' : '🔥 Burnout Detection',
            lang === 'tr' ? '📊 HR Dashboard' : '📊 HR Dashboard',
            lang === 'tr' ? '🔒 KVKK/GDPR Uyumlu' : '🔒 GDPR Compliant',
          ].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
              <span style={{ color: '#10b981' }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
