import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userAPI, coachAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const BRAIN_TYPE_COLORS = { analytical: '#00d4ff', creative: '#7c3aed', empathetic: '#10b981', strategic: '#f59e0b' };

// Generate radar data based on brain type + overallScore
function buildRadarData(neuroProfile, lang) {
  const labels = lang === 'en'
    ? ['Analytical', 'Creative', 'Empathetic', 'Strategic', 'Social', 'Leadership']
    : ['Analitik', 'Yaratıcı', 'Empatik', 'Stratejik', 'Sosyal', 'Liderlik'];

  const base = {
    analytical: [90, 55, 50, 78, 45, 70],
    creative:   [55, 90, 68, 60, 78, 65],
    empathetic: [52, 62, 90, 55, 88, 60],
    strategic:  [72, 60, 60, 90, 65, 88],
  };

  const bt = neuroProfile?.brainType || 'analytical';
  const score = neuroProfile?.overallScore || 75;
  const factor = score / 100;
  const raw = base[bt] || base.analytical;

  return labels.map((subject, i) => ({
    subject,
    A: Math.round(raw[i] * factor * 0.4 + raw[i] * 0.6),
  }));
}

function ScoreSlider({ label, value, onChange, color = '#00d4ff' }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: 'right' }}>{value}</span>
      </div>
      <input
        type="range" min="1" max="10" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 6, borderRadius: 3, outline: 'none', cursor: 'pointer',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${(value - 1) / 9 * 100}%, rgba(255,255,255,0.1) ${(value - 1) / 9 * 100}%, rgba(255,255,255,0.1) 100%)`,
          WebkitAppearance: 'none', appearance: 'none',
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t, lang } = useLanguage();
  const d = t.dashboard;
  const qc = useQueryClient();

  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinData, setCheckinData] = useState({ mood: 7, energy: 7, stress: 4, focus: 7 });

  const { data: dashboard, isLoading: dashLoading } = useQuery(
    'dashboard',
    userAPI.getDashboard,
    { select: (res) => res.data.data }
  );

  const { data: coachData } = useQuery(
    'daily-coach',
    coachAPI.getDailyMessage,
    {
      select: (res) => res.data.data,
      enabled: !!user?.neuroProfile?.brainType,
      retry: 1,
    }
  );

  const checkinMutation = useMutation(
    (data) => userAPI.checkin(data),
    {
      onSuccess: () => {
        toast.success(d.checkinSaved);
        setShowCheckin(false);
        qc.invalidateQueries('dashboard');
      },
      onError: () => toast.error(lang === 'tr' ? 'Check-in kaydedilemedi' : 'Could not save check-in'),
    }
  );

  const hasProfile = !!user?.neuroProfile?.brainType;
  const brainColor = BRAIN_TYPE_COLORS[user?.neuroProfile?.brainType] || '#00d4ff';
  const brainLabel = t.brainTypes[user?.neuroProfile?.brainType] || d.notDetermined;
  const radarData = buildRadarData(user?.neuroProfile, lang);

  const moodData = (dashboard?.recentCheckins || []).slice(-7).map((c, i) => ({
    day: lang === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
      : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i],
    [d.mood]: c.mood,
    [d.energy]: c.energy,
  }));

  const stats = [
    {
      icon: hasProfile ? ({ analytical: '🔢', creative: '🎨', empathetic: '💙', strategic: '♟️' }[user?.neuroProfile?.brainType] || '❓') : '❓',
      label: d.brainTypeLabel,
      value: hasProfile ? brainLabel : d.notDetermined,
      color: brainColor,
      sub: hasProfile ? null : '→ ' + (lang === 'tr' ? 'Analiz yap' : 'Run analysis'),
    },
    {
      icon: '⚡', label: d.neuroScore,
      value: hasProfile ? String(user?.neuroProfile?.overallScore || 0) : d.notSet,
      color: '#10b981', sub: hasProfile ? '/100' : null,
    },
    {
      icon: '😊', label: d.avgMood,
      value: dashboard?.stats?.avgMood ? `${dashboard.stats.avgMood}${d.outOf}` : d.notSet,
      color: '#f59e0b',
      sub: dashboard?.stats?.checkinsThisWeek ? `${dashboard.stats.checkinsThisWeek}x ${lang === 'tr' ? 'bu hafta' : 'this week'}` : null,
    },
    {
      icon: '😴', label: d.avgSleep,
      value: dashboard?.stats?.avgSleep ? `${dashboard.stats.avgSleep}${d.hours}` : d.notSet,
      color: '#7c3aed', sub: null,
    },
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
              {d.welcome}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>{d.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setShowCheckin(true)} style={{
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              📊 {d.checkin}
            </button>
            {!hasProfile && (
              <Link to="/analysis" className="btn btn-primary">{d.startAnalysis}</Link>
            )}
          </div>
        </div>

        {/* No profile banner */}
        {!hasProfile && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))',
            border: '1px solid rgba(0,212,255,0.25)', borderRadius: 16, padding: 28,
            marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{d.profileBanner}</h2>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>{d.profileBannerSub}</p>
            </div>
            <Link to="/analysis" className="btn btn-primary btn-lg">{d.startAnalysis} →</Link>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginBottom: 28 }}>
          {stats.map((stat) => (
            <div key={stat.label} className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: `radial-gradient(circle at 50% 0%, ${stat.color}10 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />
              <div style={{ fontSize: 34, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              {stat.sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{stat.sub}</div>}
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: hasProfile ? '1fr 1fr' : '1fr', gap: 22, marginBottom: 22 }}>
          {hasProfile && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>{d.neuroMap}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name={lang === 'tr' ? 'Sen' : 'You'} dataKey="A" stroke={brainColor} fill={brainColor} fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 13, color: brainColor, fontWeight: 700 }}>
                  {brainLabel} — {user?.neuroProfile?.overallScore || 0}/100
                </span>
              </div>
            </div>
          )}

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(124,58,237,0.04))' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 16 }}>{d.dailyCoach}</h3>
            {coachData ? (
              <>
                <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14, marginBottom: 16 }}>{coachData.message}</p>
                <Link to="/coach" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00d4ff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  {lang === 'tr' ? 'Koçla Devam Et' : 'Continue with Coach'} →
                </Link>
              </>
            ) : dashLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 14 }}>
                <div className="loading-spinner" style={{ width: 16, height: 16 }} /> {t.common.loading}
              </div>
            ) : hasProfile ? (
              <div style={{ color: '#64748b', fontSize: 14 }}>
                <p style={{ marginBottom: 12 }}>{lang === 'tr' ? 'Koç mesajı yükleniyor...' : 'Coach message loading...'}</p>
                <Link to="/coach" className="btn btn-primary btn-sm">{d.talkCoach}</Link>
              </div>
            ) : (
              <div>
                <p style={{ color: '#94a3b8', marginBottom: 14, fontSize: 14, lineHeight: 1.7 }}>{d.coachWait}</p>
                <Link to="/analysis" className="btn btn-primary btn-sm">{d.startAnalysis}</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mood chart */}
        {moodData.length > 0 && (
          <div className="card" style={{ marginBottom: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>{d.weeklyMood}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={moodData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f0f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff' }} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey={d.mood} stroke="#00d4ff" fill="url(#moodGrad)" strokeWidth={2} dot={{ fill: '#00d4ff', r: 4 }} />
                <Area type="monotone" dataKey={d.energy} stroke="#7c3aed" fill="url(#energyGrad)" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>{d.quickActions}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
            {[
              { to: '/analysis', icon: '🧠', label: d.newAnalysis, color: '#00d4ff' },
              { to: '/match', icon: '💑', label: d.findMatch, color: '#7c3aed' },
              { to: '/coach', icon: '🤖', label: d.talkCoach, color: '#10b981' },
              { to: '/reports', icon: '📊', label: d.myReports, color: '#f59e0b' },
            ].map((action) => (
              <Link key={action.label} to={action.to} className="card" style={{
                textDecoration: 'none', textAlign: 'center',
                border: `1px solid ${action.color}20`, cursor: 'pointer',
                transition: 'all 0.2s', padding: '20px 16px',
              }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>{action.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: action.color }}>{action.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setShowCheckin(false)}>
          <div className="glass" style={{ width: '100%', maxWidth: 440, padding: 36, position: 'relative' }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCheckin(false)} style={{
              position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
              color: '#64748b', cursor: 'pointer', fontSize: 20,
            }}>✕</button>

            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{d.checkinTitle}</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>
              {lang === 'tr' ? '1-10 arası puanla' : 'Rate from 1-10'}
            </p>

            <ScoreSlider label={`😊 ${d.mood}`} value={checkinData.mood} onChange={(v) => setCheckinData((p) => ({ ...p, mood: v }))} color="#00d4ff" />
            <ScoreSlider label={`⚡ ${d.energy}`} value={checkinData.energy} onChange={(v) => setCheckinData((p) => ({ ...p, energy: v }))} color="#10b981" />
            <ScoreSlider label={`😤 ${d.stress}`} value={checkinData.stress} onChange={(v) => setCheckinData((p) => ({ ...p, stress: v }))} color="#ef4444" />
            <ScoreSlider label={`🎯 ${d.focus}`} value={checkinData.focus} onChange={(v) => setCheckinData((p) => ({ ...p, focus: v }))} color="#f59e0b" />

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[
                { k: 'mood', v: checkinData.mood, c: '#00d4ff', l: d.mood },
                { k: 'energy', v: checkinData.energy, c: '#10b981', l: d.energy },
                { k: 'stress', v: checkinData.stress, c: '#ef4444', l: d.stress },
                { k: 'focus', v: checkinData.focus, c: '#f59e0b', l: d.focus },
              ].map((item) => (
                <div key={item.k} style={{
                  flex: 1, textAlign: 'center', background: `${item.c}15`,
                  border: `1px solid ${item.c}30`, borderRadius: 8, padding: '8px 4px',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.c }}>{item.v}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{item.l}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => checkinMutation.mutate(checkinData)}
              disabled={checkinMutation.isLoading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {checkinMutation.isLoading ? <div className="loading-spinner" /> : `📊 ${t.common.save}`}
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}


