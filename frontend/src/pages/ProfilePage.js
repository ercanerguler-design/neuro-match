import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { t, lang } = useLanguage();
  const [checkinData, setCheckinData] = useState({ mood: 7, energy: 7, stress: 3, focus: 7 });
  const [sleepData, setSleepData] = useState({ duration: 7, quality: 7, bedTime: '23:00', wakeTime: '07:00' });

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const updateMutation = useMutation(userAPI.updateProfile, {
    onSuccess: (res) => {
      updateUser(res.data.data);
      toast.success((t.profile && t.profile.saveSuccess) || 'Profil güncellendi');
      queryClient.invalidateQueries('dashboard');
    },
    onError: () => toast.error((t.profile && t.profile.saveError) || 'Güncelleme başarısız'),
  });

  const checkinMutation = useMutation(userAPI.checkin, {
    onSuccess: () => toast.success((t.profile && t.profile.checkinSuccess) || '✅ Günlük check-in kaydedildi'),
    onError: () => toast.error((t.profile && t.profile.checkinError) || 'Check-in kaydedilemedi'),
  });

  const sleepMutation = useMutation(userAPI.logSleep, {
    onSuccess: () => toast.success((t.profile && t.profile.sleepSuccess) || '😴 Uyku verisi kaydedildi'),
    onError: () => toast.error((t.profile && t.profile.sleepError) || 'Uyku verisi kaydedilemedi'),
  });

  const btLabels = (t.profile && t.profile.brainTypeLabels) || { analytical: { icon: '🔢', label: 'Analitik', color: '#00d4ff' }, creative: { icon: '🎨', label: 'Yaratıcı', color: '#7c3aed' }, empathetic: { icon: '💙', label: 'Empatik', color: '#10b981' }, strategic: { icon: '♟️', label: 'Stratejik', color: '#f59e0b' } };
  const bt = btLabels[user?.neuroProfile?.brainType];

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>👤 {(t.profile && t.profile.title) || 'Profilim'}</h1>

        {/* Profile card */}
        <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ color: '#94a3b8', marginBottom: 8 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={`badge badge-${user?.subscription?.plan === 'free' ? 'warning' : 'primary'}`}>
                {user?.subscription?.plan?.toUpperCase() || 'FREE'}
              </span>
              {bt && <span className="badge badge-success">{bt.icon} {bt.label} Beyin Tipi</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Edit profile */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>✏️ {(t.profile && t.profile.editProfile) || 'Profili Düzenle'}</h3>
            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
              <div className="form-group">
                <label className="form-label">{(t.profile && t.profile.fullName) || 'Ad Soyad'}</label>
                <input className="form-input" {...register('name', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Phone' : 'Telefon'}</label>
                <input className="form-input" placeholder="+90 555 000 00 00" {...register('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'en' ? 'Country' : 'Ülke'}</label>
                <select className="form-input" {...register('country')}>
                  <option value="TR">{lang === 'en' ? 'Türkiye' : 'Türkiye'} 🇹🇷</option>
                  <option value="DE">{lang === 'en' ? 'Germany' : 'Almanya'} 🇩🇪</option>
                  <option value="US">{lang === 'en' ? 'USA' : 'ABD'} 🇺🇸</option>
                  <option value="GB">{lang === 'en' ? 'UK' : 'İngiltere'} 🇬🇧</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? <div className="loading-spinner" /> : ((t.profile && t.profile.save) || 'Kaydet')}
              </button>
            </form>
          </div>

          {/* Neuro profile */}
          {user?.neuroProfile?.brainType && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🧠 {(t.profile && t.profile.neuroProfileSection) || 'Nörolojik Profil'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: (t.profile && t.profile.brainType) || 'Beyin Tipi', value: bt ? `${bt.icon} ${bt.label}` : '—' },
                  { label: lang === 'en' ? 'Energy Rhythm' : 'Enerji Ritmi', value: lang === 'en' ? { morning: '🌅 Morning', evening: '🌙 Evening', flexible: '⚡ Flexible' }[user.neuroProfile.energyRhythm] : { morning: '🌅 Sabahyı', evening: '🌙 Akşamcı', flexible: '⚡ Esnek' }[user.neuroProfile.energyRhythm] || '—' },
                  { label: lang === 'en' ? 'Decision Style' : 'Karar Stili', value: lang === 'en' ? { rational: '🎯 Rational', intuitive: '✨ Intuitive', balanced: '⚖️ Balanced' }[user.neuroProfile.decisionStyle] : { rational: '🎯 Rasyonel', intuitive: '✨ Sezgisel', balanced: '⚖️ Dengeli' }[user.neuroProfile.decisionStyle] || '—' },
                  { label: lang === 'en' ? 'Social Pattern' : 'Sosyal Örüntü', value: lang === 'en' ? { introvert: '🔇 Introvert', extrovert: '🎉 Extrovert', ambivert: '🔄 Ambivert' }[user.neuroProfile.socialPattern] : { introvert: '🔇 İntrovert', extrovert: '🎉 Extrovert', ambivert: '🔄 Ambivert' }[user.neuroProfile.socialPattern] || '—' },
                  { label: lang === 'en' ? 'Neuro Score' : 'Nöro Skor', value: `${user.neuroProfile.overallScore || 0}/100` },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                    <span style={{ color: '#94a3b8' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily check-in */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📊 {(t.profile && t.profile.checkinSection) || 'Günlük Check-in'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 20 }}>
            {[
              { key: 'mood', label: `😊 ${(t.profile && t.profile.moodLabel) || 'Ruh Hali'}`, color: '#00d4ff' },
              { key: 'energy', label: `⚡ ${(t.profile && t.profile.energyLabel) || 'Enerji'}`, color: '#10b981' },
              { key: 'stress', label: `😤 ${(t.profile && t.profile.stressLabel) || 'Stres'}`, color: '#ef4444' },
              { key: 'focus', label: `🎯 ${(t.profile && t.profile.focusLabel) || 'Odak'}`, color: '#7c3aed' },
            ].map((item) => (
              <div key={item.key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: item.color, marginBottom: 8 }}>{checkinData[item.key]}</div>
                <input type="range" min="1" max="10" value={checkinData[item.key]}
                  onChange={(e) => setCheckinData({ ...checkinData, [item.key]: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: item.color }} />
              </div>
            ))}
          </div>
          <button onClick={() => checkinMutation.mutate(checkinData)} className="btn btn-primary" disabled={checkinMutation.isLoading}>
            {checkinMutation.isLoading ? <div className="loading-spinner" /> : ((t.profile && t.profile.saveCheckin) || '✅ Check-in Kaydet')}
          </button>
        </div>

        {/* Sleep tracker */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>😴 {(t.profile && t.profile.sleepSection) || 'Uyku Takibi'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="form-label">{(t.profile && t.profile.bedTimeLabel) || 'Yatış Saati'}</label>
              <input type="time" className="form-input" value={sleepData.bedTime} onChange={(e) => setSleepData({ ...sleepData, bedTime: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{(t.profile && t.profile.wakeTimeLabel) || 'Kalkış Saati'}</label>
              <input type="time" className="form-input" value={sleepData.wakeTime} onChange={(e) => setSleepData({ ...sleepData, wakeTime: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#94a3b8' }}>{lang === 'en' ? 'Sleep Quality' : 'Uyku Kalitesi'}: {sleepData.quality}/10</span>
              <span style={{ color: '#7c3aed' }}>{sleepData.duration} {lang === 'en' ? 'hrs' : 'saat'}</span>
            </div>
            <input type="range" min="1" max="10" value={sleepData.quality} onChange={(e) => setSleepData({ ...sleepData, quality: Number(e.target.value) })} style={{ width: '100%', accentColor: '#7c3aed', marginBottom: 8 }} />
            <input type="range" min="1" max="12" value={sleepData.duration} onChange={(e) => setSleepData({ ...sleepData, duration: Number(e.target.value) })} style={{ width: '100%', accentColor: '#00d4ff' }} />
          </div>
          <button onClick={() => sleepMutation.mutate(sleepData)} className="btn btn-secondary" disabled={sleepMutation.isLoading}>
            {sleepMutation.isLoading ? <div className="loading-spinner" /> : ((t.profile && t.profile.saveSleep) || '😴 Uyku Kayıdını Ekle')}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
