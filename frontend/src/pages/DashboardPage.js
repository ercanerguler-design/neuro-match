import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userAPI, coachAPI, authAPI } from '../services/api';
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
  const { user, updateUser } = useAuthStore();
  const { t, lang } = useLanguage();
  const d = t.dashboard;
  const qc = useQueryClient();

  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinData, setCheckinData] = useState({ mood: 7, energy: 7, stress: 4, focus: 7 });
  const [aiInsight, setAiInsight] = useState(null);
  const [showInsight, setShowInsight] = useState(false);

  const { data: dashboard, isLoading: dashLoading } = useQuery(
    'dashboard',
    userAPI.getDashboard,
    {
      select: (res) => res.data.data,
      staleTime: 0,           // always fetch fresh — brainType must be up to date
      onSuccess: (data) => {
        // Sync fresh neuroProfile from server into Zustand store
        if (data?.neuroProfile?.brainType) {
          const bt = data.neuroProfile.brainType.toLowerCase();
          updateUser({ neuroProfile: { ...data.neuroProfile, brainType: bt } });
        }
      },
    }
  );

  // Derive brainType from each source independently (avoid truthy empty-object {} trap from Mongoose)
  const VALID_BT = ['analytical', 'creative', 'empathetic', 'strategic'];
  const dashBTRaw = (dashboard?.neuroProfile?.brainType || '').toLowerCase();
  const storeBTRaw = (user?.neuroProfile?.brainType || '').toLowerCase();
  const dashBT = VALID_BT.includes(dashBTRaw) ? dashBTRaw : '';
  const storeBT = VALID_BT.includes(storeBTRaw) ? storeBTRaw : '';
  const liveBrainType = dashBT || storeBT;
  const liveNeuroProfile = liveBrainType
    ? (dashBT ? dashboard.neuroProfile : user?.neuroProfile)
    : (dashboard?.neuroProfile || user?.neuroProfile);
  // Always refresh /auth/me on mount to sync latest brainType into store
  useEffect(() => {
    authAPI.getMe().then((res) => {
      const u = res?.data?.data;
      if (u?.neuroProfile?.brainType) {
        const bt = u.neuroProfile.brainType.toLowerCase();
        updateUser({ neuroProfile: { ...u.neuroProfile, brainType: bt } });
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: coachData } = useQuery(
    'daily-coach',
    coachAPI.getDailyMessage,
    {
      select: (res) => res.data.data,
      enabled: !!liveBrainType,
      retry: 1,
    }
  );

  const checkinMutation = useMutation(
    (data) => userAPI.checkin(data),
    {
      onSuccess: (res) => {
        const insight = res?.data?.aiInsight;
        if (insight) {
          setAiInsight(insight);
          setShowInsight(true);
        } else {
          toast.success(d.checkinSaved);
        }
        setShowCheckin(false);
        qc.invalidateQueries('dashboard');
      },
      onError: () => toast.error(lang === 'tr' ? 'Check-in kaydedilemedi' : 'Could not save check-in'),
    }
  );

  const hasProfile = !!liveBrainType;
  const normalizedBrainType = liveBrainType;
  const brainColor = BRAIN_TYPE_COLORS[normalizedBrainType] || '#00d4ff';
  const brainLabel = t.brainTypes[normalizedBrainType] || d.notDetermined;
  const radarData = buildRadarData({ ...liveNeuroProfile, brainType: normalizedBrainType }, lang);

  // Gamification data
  const gami = dashboard?.gamification || {};
  const xpPercent = gami.neededXP ? Math.round((gami.currentXP / gami.neededXP) * 100) : 0;

  const moodData = (dashboard?.recentCheckins || []).slice(-7).map((c, i) => ({
    day: lang === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
      : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i],
    [d.mood]: c.mood,
    [d.energy]: c.energy,
  }));

  // 30-day check-in trend
  const trendData = (dashboard?.checkinHistory || []).map((c, i) => ({
    day: i + 1,
    mood: c.mood,
    energy: c.energy,
    stress: c.stress,
    focus: c.focus,
  }));

  const stats = [
    {
      icon: dashLoading && !hasProfile ? '⏳' : (hasProfile ? ({ analytical: '🔢', creative: '🎨', empathetic: '💙', strategic: '♟️' }[normalizedBrainType] || '🧠') : '❓'),
      label: d.brainTypeLabel,
      value: dashLoading && !hasProfile ? '...' : (hasProfile ? brainLabel : d.notDetermined),
      color: brainColor,
      sub: hasProfile ? null : (dashLoading ? null : '→ ' + (lang === 'tr' ? 'Analiz yap' : 'Run analysis')),
    },
    {
      icon: '⚡', label: d.neuroScore,
      value: dashLoading && !hasProfile ? '...' : (hasProfile ? String(liveNeuroProfile?.overallScore || 0) : d.notSet),
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

        {/* Gamification Panel */}
        {(gami.xp > 0 || gami.level > 0) && (
          <div className="card" style={{ marginBottom: 22, background: 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(124,58,237,0.06))', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                  📈 {lang === 'tr' ? 'Nöro Seviyesi' : 'Neuro Level'}
                  <span style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginLeft: 10, fontSize: 20, fontWeight: 900 }}>
                    Lv. {gami.level || 1}
                  </span>
                </h3>
                <p style={{ color: '#64748b', fontSize: 12 }}>{gami.xp || 0} XP — {lang === 'tr' ? 'Bir sonraki seviye için' : 'Next level in'} {(gami.neededXP || 100) - (gami.currentXP || 0)} XP</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>{gami.streak || 0} 🔥</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{lang === 'tr' ? 'Günlük Seri' : 'Daily Streak'}</div>
                </div>
              </div>
            </div>
            {/* XP Progress Bar */}
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
                background: 'linear-gradient(90deg,#00d4ff,#7c3aed)',
                width: `${xpPercent}%`,
              }} />
            </div>
            {/* Badges */}
            {(gami.badges || []).length > 0 ? (
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  🏅 {lang === 'tr' ? 'Rozetler' : 'Badges'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(gami.badges || []).map((badge) => (
                    <div key={badge.id} title={badge.name} style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span>{badge.emoji}</span>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: '#475569', fontSize: 13 }}>
                {lang === 'tr' ? '🎯 Analiz tamamla, check-in yap ve rozet kazan!' : '🎯 Complete analyses, check in daily, and earn badges!'}
              </p>
            )}
          </div>
        )}

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
                  {brainLabel} — {liveNeuroProfile?.overallScore || 0}/100
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

        {/* Mood chart - always visible */}
        <div className="card" style={{ marginBottom: 22 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>{d.weeklyMood}</h3>
          {moodData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#475569' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <p style={{ fontSize: 14, marginBottom: 14 }}>{lang === 'tr' ? 'Henüz check-in verisi yok. İlk kaydını yap!' : 'No check-in data yet. Log your first entry!'}</p>
              <button onClick={() => setShowCheckin(true)} style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', color: '#fff', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ✅ {lang === 'tr' ? 'Check-in Yap' : 'Log Check-in'}
              </button>
            </div>
          ) : (
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
          )}
        </div>

        {/* 30-Day Check-in Trend */}
        {trendData.length > 0 && (
          <div className="card" style={{ marginBottom: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>
              📅 {lang === 'tr' ? '30 Günlük Nöro Takibi' : '30-Day Neuro Trend'}
            </h3>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              {lang === 'tr' ? 'Beyin durumunun zaman içindeki değişimi' : 'How your brain state evolves over time'}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="moodGrad30" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stressGrad30" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: lang === 'tr' ? 'Gün' : 'Day', fill: '#475569', fontSize: 11, position: 'insideBottomRight', offset: -5 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f0f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey="mood" name={lang === 'tr' ? 'Ruh Hali' : 'Mood'} stroke="#00d4ff" fill="url(#moodGrad30)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="energy" name={lang === 'tr' ? 'Enerji' : 'Energy'} stroke="#10b981" fill="none" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="stress" name={lang === 'tr' ? 'Stres' : 'Stress'} stroke="#ef4444" fill="url(#stressGrad30)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
              {[{c:'#00d4ff',l:lang==='tr'?'Ruh Hali':'Mood'},{c:'#10b981',l:lang==='tr'?'Enerji':'Energy'},{c:'#ef4444',l:lang==='tr'?'Stres':'Stress'}].map(x=>(
                <div key={x.l} style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:24,height:3,background:x.c,borderRadius:2}}/>
                  <span style={{fontSize:12,color:'#64748b'}}>{x.l}</span>
                </div>
              ))}
            </div>
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

      {/* AI Mood Insight Modal */}
      {showInsight && aiInsight && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowInsight(false)}>
          <div className="glass" style={{ width: '100%', maxWidth: 480, padding: 36, position: 'relative', border: '1px solid rgba(0,212,255,0.3)' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🧠</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#00d4ff' }}>
                {lang === 'tr' ? 'Nöro-Analiz Sonucu' : 'AI Mood Analysis'}
              </h2>
              <p style={{ fontSize: 12, color: '#475569' }}>
                {lang === 'tr' ? 'Ruh hali verilerin analiz edildi' : 'Based on your recent check-ins'}
              </p>
            </div>
            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#e2e8f0', margin: 0 }}>{aiInsight}</p>
            </div>
            <button onClick={() => { setShowInsight(false); toast.success(d.checkinSaved); }}
              style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              ✓ {lang === 'tr' ? 'Anladım, teşekkürler!' : 'Got it, thanks!'}
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}


