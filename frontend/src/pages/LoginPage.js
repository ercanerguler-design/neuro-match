import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      setAuth(res.data.user, res.data.token);
      toast.success(`${lang === 'tr' ? 'Hoş geldin' : 'Welcome'}, ${res.data.user.name}! 🧠`);
      const role = res.data.user?.role;
      if (role === 'enterprise' || role === 'admin') navigate('/enterprise');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || (lang === 'tr' ? 'Giriş başarısız' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div className="bg-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)', top: 0, left: 0 }} />
      <div className="bg-orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', bottom: 0, right: 0 }} />

      {/* Language Toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 100 }}>
        {['tr', 'en'].map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${lang === l ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, color: lang === l ? '#00d4ff' : '#64748b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s' }}>
            {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      <div className="glass" style={{ width: '100%', maxWidth: 440, padding: 48, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>NEURO-MATCH</h1>
          <p style={{ color: '#94a3b8' }}>{t.auth.loginTitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">{t.auth.email}</label>
            <input className="form-input" type="email" placeholder={t.auth.emailPlaceholder}
              {...register('email', {
                required: lang === 'tr' ? 'Email gerekli' : 'Email required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: lang === 'tr' ? 'Geçerli email girin' : 'Enter a valid email' }
              })} />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">{t.auth.password}</label>
            <input className="form-input" type="password" placeholder={t.auth.passwordPlaceholder}
              {...register('password', { required: lang === 'tr' ? 'Şifre gerekli' : 'Password required' })} />
            {errors.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: 14 }}>{t.auth.forgotPassword}</Link>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <div className="loading-spinner" /> : t.auth.loginBtn}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 14 }}>
          {t.auth.noAccount}{' '}
          <Link to="/register" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>
            {lang === 'tr' ? 'Ücretsiz Kayıt Ol' : 'Sign Up Free'}
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 16, color: '#64748b', fontSize: 13 }}>
          <Link to="/enterprise/login" style={{ color: '#f59e0b', textDecoration: 'none' }}>
            🏢 {t.nav.enterpriseLogin}
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 16, color: '#64748b', fontSize: 12 }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>← {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}</Link>
        </p>
      </div>
    </div>
  );
}
