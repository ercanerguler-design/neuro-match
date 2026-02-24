import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      setAuth(res.data.user, res.data.token);
      toast.success(lang === 'tr' ? '🎉 Hoş geldin! Nörolojik yolculuğun başlıyor!' : '🎉 Welcome! Your neurological journey begins!');
      navigate('/analysis');
    } catch (err) {
      toast.error(err.response?.data?.error || (lang === 'tr' ? 'Kayıt başarısız' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div className="bg-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', top: 0, right: 0 }} />

      {/* Language Toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 100 }}>
        {['tr', 'en'].map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${lang === l ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, color: lang === l ? '#00d4ff' : '#64748b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s' }}>
            {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      <div className="glass" style={{ width: '100%', maxWidth: 480, padding: 48, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
            {lang === 'tr' ? 'Hesap Oluştur' : 'Create Account'}
          </h1>
          <p style={{ color: '#94a3b8' }}>{lang === 'tr' ? 'Ücretsiz başla, beynini keşfet' : 'Start free, discover your brain'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">{t.auth.name}</label>
            <input className="form-input" placeholder={lang === 'tr' ? 'Adın Soyadın' : 'Your Full Name'}
              {...register('name', {
                required: lang === 'tr' ? 'İsim gerekli' : 'Name required',
                minLength: { value: 2, message: lang === 'tr' ? 'En az 2 karakter' : 'At least 2 characters' }
              })} />
            {errors.name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">{t.auth.email}</label>
            <input className="form-input" type="email" placeholder={t.auth.emailPlaceholder}
              {...register('email', {
                required: lang === 'tr' ? 'Email gerekli' : 'Email required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: lang === 'tr' ? 'Geçerli email girin' : 'Enter a valid email' }
              })} />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{lang === 'tr' ? 'Doğum Tarihi' : 'Birth Date'}</label>
              <input className="form-input" type="date" {...register('birthDate')} />
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'tr' ? 'Cinsiyet' : 'Gender'}</label>
              <select className="form-input" style={{ cursor: 'pointer' }} {...register('gender')}>
                <option value="">{lang === 'tr' ? 'Seçin' : 'Select'}</option>
                <option value="male">{lang === 'tr' ? 'Erkek' : 'Male'}</option>
                <option value="female">{lang === 'tr' ? 'Kadın' : 'Female'}</option>
                <option value="other">{lang === 'tr' ? 'Diğer' : 'Other'}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.auth.password}</label>
            <input className="form-input" type="password" placeholder={lang === 'tr' ? 'En az 8 karakter' : 'At least 8 characters'}
              {...register('password', {
                required: lang === 'tr' ? 'Şifre gerekli' : 'Password required',
                minLength: { value: 8, message: lang === 'tr' ? 'En az 8 karakter' : 'At least 8 characters' }
              })} />
            {errors.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">{lang === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}</label>
            <input className="form-input" type="password" placeholder={lang === 'tr' ? 'Şifrenizi tekrar girin' : 'Re-enter your password'}
              {...register('confirmPassword', {
                required: lang === 'tr' ? 'Şifre tekrar gerekli' : 'Please confirm password',
                validate: (val) => val === watch('password') || (lang === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match'),
              })} />
            {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <div className="loading-spinner" /> : t.auth.registerBtn}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 14 }}>
          {t.auth.hasAccount}{' '}
          <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>{t.auth.loginLink}</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 12, color: '#64748b', fontSize: 12 }}>
          {lang === 'tr' ? 'Kaydolarak' : 'By signing up, you agree to our'}{' '}
          <a href="#" style={{ color: '#00d4ff' }}>{lang === 'tr' ? 'Kullanım Koşulları' : 'Terms of Service'}</a>
          {lang === 'tr' ? "'nı ve " : ' and '}{' '}
          <a href="#" style={{ color: '#00d4ff' }}>{lang === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}</a>
          {lang === 'tr' ? "'nı kabul ediyorsunuz." : '.'}
        </p>
      </div>
    </div>
  );
}
