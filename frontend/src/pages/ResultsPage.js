import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { analysisAPI, authAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

export default function ResultsPage() {
  const { id } = useParams();
  const [dots, setDots] = useState('.');
  const { updateUser } = useAuthStore();
  const { t, lang } = useLanguage();

  const BRAIN_TYPE_INFO = {
    analytical: { icon: '🔢', label: (t.results && t.results.brainInfo && t.results.brainInfo.analytical && t.results.brainInfo.analytical.label) || 'Analitik', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', desc: (t.results && t.results.brainInfo && t.results.brainInfo.analytical && t.results.brainInfo.analytical.desc) || 'Veri odaklı, sistematik düşünür.' },
    creative: { icon: '🎨', label: (t.results && t.results.brainInfo && t.results.brainInfo.creative && t.results.brainInfo.creative.label) || 'Yaratıcı', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', desc: (t.results && t.results.brainInfo && t.results.brainInfo.creative && t.results.brainInfo.creative.desc) || 'Yenilikçi, sezgisel, büyük resmi görür.' },
    empathetic: { icon: '💙', label: (t.results && t.results.brainInfo && t.results.brainInfo.empathetic && t.results.brainInfo.empathetic.label) || 'Empatik', color: '#10b981', bg: 'rgba(16,185,129,0.1)', desc: (t.results && t.results.brainInfo && t.results.brainInfo.empathetic && t.results.brainInfo.empathetic.desc) || 'İnsan odaklı, duygusal zeka yüksek.' },
    strategic: { icon: '♟️', label: (t.results && t.results.brainInfo && t.results.brainInfo.strategic && t.results.brainInfo.strategic.label) || 'Stratejik', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', desc: (t.results && t.results.brainInfo && t.results.brainInfo.strategic && t.results.brainInfo.strategic.desc) || 'Uzun vadeli düşünür, liderlik doğal.' },
  };

  const { data: analysis, isLoading } = useQuery(
    ['analysis', id],
    () => analysisAPI.getAnalysis(id),
    {
      select: (res) => res.data.data,
      refetchInterval: (data) => (data?.status === 'processing' ? 3000 : false),
    }
  );

  // When analysis completes, refresh user's neuroProfile in store
  useEffect(() => {
    if (analysis?.status === 'completed' && analysis?.aiResults?.brainType) {
      authAPI.getMe().then((res) => {
        if (res.data?.data) {
          // normalize brainType to lowercase before storing
          const freshUser = res.data.data;
          if (freshUser.neuroProfile?.brainType) {
            freshUser.neuroProfile.brainType = freshUser.neuroProfile.brainType.toLowerCase();
          }
          updateUser(freshUser);
        }
      }).catch(() => {
        // Manually update with analysis result if /me fails
        updateUser({ neuroProfile: {
          brainType: (analysis.aiResults.brainType || 'analytical').toLowerCase(),
          overallScore: analysis.aiResults.overallScore,
          energyRhythm: analysis.aiResults.energyRhythm,
          decisionStyle: analysis.aiResults.decisionStyle,
          stressResponse: analysis.aiResults.stressResponse,
          socialPattern: analysis.aiResults.socialPattern,
        }});
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis?.status]);

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => d.length >= 3 ? '.' : d + '.'), 500);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || analysis?.status === 'processing') {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', paddingTop: 120 }}>
          <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 2s ease-in-out infinite', display: 'inline-block' }}>🧠</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{(t.results && t.results.loadingTitle) || 'AI Analiz Yapıyor'}{dots}</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32 }}>{(t.results && t.results.loadingDesc) || 'GPT-4 tabanlı nörolojik profil oluşturuluyor. Lütfen bekleyin.'}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {((t.results && t.results.steps) || ['Anket verileri işleniyor', 'Beyin tipi tespit ediliyor', 'Profil oluşturuluyor', 'Rapor yazılıyor']).map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#00d4ff' }}>
                <div className="loading-spinner" style={{ width: 14, height: 14 }} />
                {step}
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (analysis?.status === 'failed') {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>{(t.results && t.results.failedTitle) || 'Analiz başarısız oldu'}</h2>
          <Link to="/analysis" className="btn btn-primary">{(t.results && t.results.retry) || 'Tekrar Dene'}</Link>
        </div>
      </MainLayout>
    );
  }

  const results = analysis?.aiResults;
  const normalizedBrainType = (results?.brainType || '').toLowerCase() || 'analytical';
  const btInfo = BRAIN_TYPE_INFO[normalizedBrainType] || BRAIN_TYPE_INFO.analytical;

  const radarData = [
    { subject: (t.results && t.results.brainInfo && t.results.brainInfo.analytical && t.results.brainInfo.analytical.label) || 'Analitik', A: normalizedBrainType === 'analytical' ? 90 : 60 },
    { subject: (t.results && t.results.brainInfo && t.results.brainInfo.creative && t.results.brainInfo.creative.label) || 'Yaratıcı', A: normalizedBrainType === 'creative' ? 90 : 65 },
    { subject: (t.results && t.results.brainInfo && t.results.brainInfo.empathetic && t.results.brainInfo.empathetic.label) || 'Empatik', A: normalizedBrainType === 'empathetic' ? 90 : 70 },
    { subject: (t.results && t.results.brainInfo && t.results.brainInfo.strategic && t.results.brainInfo.strategic.label) || 'Stratejik', A: normalizedBrainType === 'strategic' ? 90 : 68 },
    { subject: lang === 'en' ? 'Energy' : 'Enerji', A: 75 },
    { subject: lang === 'en' ? 'Social' : 'Sosyal', A: results?.socialPattern === 'extrovert' ? 85 : 55 },
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48, padding: '48px 32px', background: `linear-gradient(135deg, ${btInfo.bg}, rgba(124,58,237,0.05))`, border: `1px solid ${btInfo.color}30`, borderRadius: 24 }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>{btInfo.icon}</div>
          <div className="badge badge-primary" style={{ marginBottom: 16, fontSize: 14 }}>{lang === 'en' ? 'Neurological Profile Completed' : 'Nörolojik Profil Tamamlandı'}</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: btInfo.color, marginBottom: 16 }}>
            {btInfo.label} Beyin Tipi
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {results?.brainTypeDescription}
          </p>
          <div style={{ marginTop: 24 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: `linear-gradient(135deg, ${btInfo.color}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: `0 0 40px ${btInfo.color}50` }}>
              <span style={{ fontSize: 40, fontWeight: 900 }}>{results?.overallScore}</span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: 8, fontSize: 14 }}>{lang === 'en' ? 'Neuro Score' : 'Nöro Skor'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Radar */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🧠 {lang === 'en' ? 'Neurological Map' : 'Nörolojik Harita'}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar dataKey="A" stroke={btInfo.color} fill={btInfo.color} fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Key stats */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🎯 {lang === 'en' ? 'Profile Summary' : 'Profil Özeti'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: lang === 'en' ? 'Energy Rhythm' : 'Enerji Ritmi', value: lang === 'en' ? { morning: 'Morning 🌅', evening: 'Evening 🌙', flexible: 'Flexible ⚡' }[results?.energyRhythm] : { morning: 'Sabahyı 🌅', evening: 'Akşamcı 🌙', flexible: 'Esnek ⚡' }[results?.energyRhythm] || '—' },
                { label: lang === 'en' ? 'Decision Style' : 'Karar Stili', value: lang === 'en' ? { rational: 'Rational 🎯', intuitive: 'Intuitive ✨', balanced: 'Balanced ⚖️' }[results?.decisionStyle] : { rational: 'Rasyonel 🎯', intuitive: 'Sezgisel ✨', balanced: 'Dengeli ⚖️' }[results?.decisionStyle] || '—' },
                { label: lang === 'en' ? 'Social Pattern' : 'Sosyal Örüntü', value: lang === 'en' ? { introvert: 'Introvert 🔇', extrovert: 'Extrovert 🎉', ambivert: 'Ambivert 🔄' }[results?.socialPattern] : { introvert: 'İntrovert 🔇', extrovert: 'Extrovert 🎉', ambivert: 'Ambivert 🔄' }[results?.socialPattern] || '—' },
                { label: lang === 'en' ? 'Stress Response' : 'Stres Tepkisi', value: lang === 'en' ? { fight: 'Fighter 🥊', flight: 'Avoidant 🦋', freeze: 'Freeze ❄️', tend: 'Caretaker 🤝' }[results?.stressResponse] : { fight: 'Savaşçı 🥊', flight: 'Kaçınmacı 🦋', freeze: 'Donucu ❄️', tend: 'Bakıcı 🤝' }[results?.stressResponse] || '—' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8', fontSize: 14 }}>{item.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SWOT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 24 }}>
          {[
            { title: '💪 Güçlü Yönler', items: results?.strengths, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { title: '⚠️ Gelişim Alanları', items: results?.weaknesses, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { title: '🚀 Fırsatlar', items: results?.opportunities, color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
            { title: '🛡️ Dikkat Edilmesi Gerekenler', items: results?.threats, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          ].map((section) => (
            <div key={section.title} className="card" style={{ background: section.bg, borderColor: `${section.color}30` }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: section.color }}>{section.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(section.items || []).map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#fff' }}>
                    <span style={{ color: section.color, marginTop: 2 }}>▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Career & Daily */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>💼 {lang === 'en' ? 'Best Career Matches' : 'En Uygun Kariyerler'}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(results?.careerMatches || []).map((career) => (
                <span key={career} className="badge badge-primary">{career}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📋 {lang === 'en' ? 'Daily Recommendations' : 'Günlük Öneriler'}</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(results?.dailyRecommendations || []).map((rec) => (
                <li key={rec} style={{ fontSize: 14, color: '#94a3b8', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#00d4ff' }}>✓</span> {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/match" className="btn btn-primary btn-lg">💑 {lang === 'en' ? 'Find Compatible People' : 'Uyumlu Kişileri Bul'}</Link>
          <Link to="/coach" className="btn btn-secondary btn-lg">🤖 {lang === 'en' ? 'Continue with AI Coach' : 'AI Koçla Devam Et'}</Link>
          <Link to="/dashboard" className="btn btn-secondary btn-lg">📊 {lang === 'en' ? 'Dashboard' : 'Dashboard'}</Link>
        </div>
      </div>
    </MainLayout>
  );
}
