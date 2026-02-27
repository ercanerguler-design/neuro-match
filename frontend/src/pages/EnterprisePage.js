import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { enterpriseAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const FEATURE_ICONS = ['👥', '🔥', '🎯', '📊', '🤖', '🔒'];

export default function EnterprisePage() {
  const { user } = useAuthStore();
  const { t, lang, setLang } = useLanguage();
  const isEnterprise = user?.subscription?.plan === 'enterprise' || user?.role === 'enterprise' || user?.role === 'admin';

  // ── Enterprise Dashboard (for enterprise/admin users) ─────────────────────
  const EnterpriseDashboard = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [actionModal, setActionModal] = useState(null); // 'analysis' | 'addMember' | null
    const [analysisData, setAnalysisData] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const { data: dashData, isLoading: dashLoading } = useQuery('enterpriseDashboard', () => enterpriseAPI.getDashboard(), { staleTime: 60000 });
    const { data: hrData } = useQuery('hrInsights', () => enterpriseAPI.getHRInsights(), { staleTime: 60000 });
    const { data: membersData } = useQuery('enterpriseMembers', () => enterpriseAPI.getMembers(), { staleTime: 30000, select: (res) => res.data?.data || [] });
    const members = membersData || [];

    const dash = dashData?.data?.data || {};
    const hr = hrData?.data?.data || {};

    const brainBalance = hr.teamBalance || { analytical: 3, creative: 2, empathetic: 4, strategic: 1 };
    const total = Object.values(brainBalance).reduce((a, b) => a + b, 0) || 1;

    const handleTeamAnalysis = async () => {
      setActionLoading(true);
      try {
        const res = await enterpriseAPI.teamAnalysis([]);
        setAnalysisData(res.data?.data);
        setActionModal('analysis');
      } catch {
        toast.error(lang === 'tr' ? 'Analiz yüklenemedi' : 'Failed to load analysis');
      } finally {
        setActionLoading(false);
      }
    };

    const handleDownloadPersonnel = () => {
      if (members.length === 0) {
        toast.error(lang === 'tr' ? 'Panelde henüz üye yok' : 'No members in panel yet');
        return;
      }
      const headers = lang === 'tr'
        ? ['Ad Soyad', 'E-posta', 'Beyin Tipi', 'Nöro Skoru', 'Ort. Ruh Hali (1-10)', 'Ort. Stres (1-10)', 'Burnout Riski (%)', 'Check-in Sayısı', 'Analiz Durumu']
        : ['Full Name', 'Email', 'Brain Type', 'Neuro Score', 'Avg Mood (1-10)', 'Avg Stress (1-10)', 'Burnout Risk (%)', 'Check-in Count', 'Analysis Status'];
      const rows = members.map((m) => {
        const burnout = m.avgStress > 0
          ? Math.min(100, Math.round(m.avgStress * 10))
          : (m.avgMood > 0 ? Math.max(0, Math.round((10 - m.avgMood) * 9)) : '-');
        const analysisStatus = m.brainType
          ? (lang === 'tr' ? 'Tamamlandı' : 'Completed')
          : (lang === 'tr' ? 'Bekleniyor' : 'Pending');
        return [
          m.name || '-',
          m.email || '-',
          m.brainType || (lang === 'tr' ? 'Belirlenmedi' : 'Not Set'),
          m.neuroScore ?? '-',
          m.avgMood ? Number(m.avgMood).toFixed(1) : '-',
          m.avgStress ? Number(m.avgStress).toFixed(1) : '-',
          burnout,
          m.checkinCount ?? 0,
          analysisStatus,
        ];
      });
      const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `x-neu-personel-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(lang === 'tr' ? 'Personel raporu indirildi!' : 'Personnel report downloaded!');
    };

    const handleSearchMember = async (e) => {
      e.preventDefault();
      setSearchLoading(true); setSearchError(''); setSearchResult(null);
      try {
        const res = await enterpriseAPI.searchMember(searchEmail);
        setSearchResult(res.data?.data);
      } catch (err) {
        setSearchError(err?.response?.data?.message || (lang === 'tr' ? 'Kullanıcı bulunamadı' : 'User not found'));
      } finally { setSearchLoading(false); }
    };

    const handleAddMember = async (userId) => {
      setActionLoading(true);
      try {
        await enterpriseAPI.addMember(userId);
        toast.success(lang === 'tr' ? 'Üye panelinize eklendi!' : 'Member added to your panel!');
        setSearchResult(null); setSearchEmail('');
        qc.invalidateQueries('enterpriseMembers');
        qc.invalidateQueries('enterpriseDashboard');
      } catch (err) {
        toast.error(err?.response?.data?.message || (lang === 'tr' ? 'Üye eklenemedi' : 'Failed to add member'));
      } finally { setActionLoading(false); }
    };

    const handleRemoveMember = async (userId, name) => {
      setActionLoading(true);
      try {
        await enterpriseAPI.removeMember(userId);
        toast.success(lang === 'tr' ? `${name} panelden kaldırıldı` : `${name} removed from panel`);
        qc.invalidateQueries('enterpriseMembers');
        qc.invalidateQueries('enterpriseDashboard');
      } catch { toast.error(lang === 'tr' ? 'Kaldırma işlemi başarısız' : 'Remove failed'); }
      finally { setActionLoading(false); }
    };

    const brainColors = { analytical: '#00d4ff', creative: '#7c3aed', empathetic: '#10b981', strategic: '#f59e0b' };
    const leastNeeded = Object.entries(brainBalance).sort((a, b) => a[1] - b[1])[0]?.[0] || 'creative';
    const brainLabels = {
      analytical: { tr: 'Analitik', en: 'Analytical' },
      creative: { tr: 'Yaratıcı', en: 'Creative' },
      empathetic: { tr: 'Empatik', en: 'Empathetic' },
      strategic: { tr: 'Stratejik', en: 'Strategic' },
    };

    return (
      <MainLayout>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
                {lang === 'tr' ? '🏢 Kurumsal Dashboard' : '🏢 Enterprise Dashboard'}
              </h1>
              <p style={{ color: '#94a3b8' }}>
                {lang === 'tr' ? 'Ekibinizin nörolojik analiz paneli' : "Your team's neurological analytics panel"}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['tr', 'en'].map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${lang === l ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, color: lang === l ? '#00d4ff' : '#64748b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s' }}>
                  {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          {dashLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>{t.common.loading}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { icon: '👥', label: t.enterprise.teamMembers, value: total, color: '#00d4ff' },
                { icon: '🤝', label: t.enterprise.teamCompatibility, value: `%${dash.teamCompatibility ?? 87}`, color: '#10b981' },
                { icon: '🔥', label: t.enterprise.burnoutRisk, value: `%${dash.burnoutRisk ?? 23}`, color: '#ef4444' },
                { icon: '⚡', label: t.enterprise.productivity, value: dash.productivityScore ?? 91, color: '#7c3aed' },
              ].map((stat) => (
                <div key={stat.label} className="card" style={{ textAlign: 'center', transition: 'transform .2s', cursor: 'default' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Brain Type Distribution */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{t.enterprise.brainDistribution}</h3>
              {Object.entries(brainBalance).map(([type, count]) => {
                const pct = Math.round((count / total) * 100);
                const label = brainLabels[type]?.[lang] || type;
                return (
                  <div key={type} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                      <span style={{ color: brainColors[type], fontWeight: 600 }}>{label}</span>
                      <span style={{ color: '#94a3b8' }}>
                        {count} {lang === 'tr' ? 'kişi' : 'people'} ({pct}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${brainColors[type]}, ${brainColors[type]}88)`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HR Alerts & Insights */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>
                {lang === 'tr' ? '⚠️ HR Önerileri & Uyarılar' : '⚠️ HR Insights & Alerts'}
              </h3>
              {/* Hiring Recommendations */}
              {(hr.hiringRecommendations || [lang === 'tr' ? 'Empatik beyin tipleri için müşteri hizmetleri rolü önerilir' : 'Empathetic brain types recommended for customer service roles']).slice(0, 2).map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', borderRadius: 8, marginBottom: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span>✅</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{rec}</span>
                </div>
              ))}
              {/* Retention Risk */}
              {(hr.retentionRisk || [lang === 'tr' ? '3 çalışanda yüksek burnout riski tespit edildi' : 'High burnout risk detected in 3 team members']).slice(0, 2).map((risk, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', borderRadius: 8, marginBottom: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span>🔥</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{risk}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span>💡</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>
                  {lang === 'tr' ? 'Analitik-Yaratıcı çalışanları iş birliği projelerinde eşleştirin' : 'Pair Analytical-Creative employees on collaboration projects'}
                </span>
              </div>
            </div>
          </div>

          {/* Burnout Haritası */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>
                {lang === 'tr' ? '🔥 Takım Burnout Haritası' : '🔥 Team Burnout Map'}
              </h3>
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                {[{ color: '#10b981', label: lang === 'tr' ? 'Düşük (<30%)' : 'Low (<30%)' }, { color: '#f59e0b', label: lang === 'tr' ? 'Orta (30-60%)' : 'Medium (30-60%)' }, { color: '#ef4444', label: lang === 'tr' ? 'Yüksek (>60%)' : 'High (>60%)' }].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                    <span style={{ color: '#94a3b8' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {(() => {
              const burnoutTeam = members.length > 0
                ? members.map((m) => ({
                    name: (m.name || '').split(' ').slice(0, 2).join(' '),
                    burnoutRisk: m.avgStress > 0
                      ? Math.min(100, Math.round(m.avgStress * 10))
                      : (m.avgMood > 0 ? Math.max(0, Math.round((10 - m.avgMood) * 9)) : 0),
                    brainType: m.brainType || (lang === 'tr' ? 'bilinmiyor' : 'unknown'),
                  }))
                : (hr.teamMembers || [
                    { name: lang === 'tr' ? 'Ayşe K.' : 'Alice K.', burnoutRisk: 18, brainType: 'analytical' },
                    { name: lang === 'tr' ? 'Mehmet S.' : 'Michael S.', burnoutRisk: 67, brainType: 'creative' },
                    { name: lang === 'tr' ? 'Zeynep A.' : 'Zoe A.', burnoutRisk: 42, brainType: 'empathetic' },
                    { name: lang === 'tr' ? 'Can T.' : 'Carl T.', burnoutRisk: 25, brainType: 'strategic' },
                    { name: lang === 'tr' ? 'Fatma B.' : 'Fiona B.', burnoutRisk: 78, brainType: 'empathetic' },
                    { name: lang === 'tr' ? 'Ali R.' : 'Alex R.', burnoutRisk: 35, brainType: 'analytical' },
                    { name: lang === 'tr' ? 'Selin M.' : 'Sara M.', burnoutRisk: 54, brainType: 'creative' },
                    { name: lang === 'tr' ? 'Burak Y.' : 'Brian Y.', burnoutRisk: 12, brainType: 'strategic' },
                  ]);
              const getBarColor = (risk) => risk < 30 ? '#10b981' : risk < 60 ? '#f59e0b' : '#ef4444';
              const CustomTooltip = ({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const riskLabel = d.burnoutRisk < 30 ? (lang === 'tr' ? 'Düşük' : 'Low') : d.burnoutRisk < 60 ? (lang === 'tr' ? 'Orta' : 'Medium') : (lang === 'tr' ? 'Yüksek' : 'High');
                return (
                  <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                    <div style={{ color: getBarColor(d.burnoutRisk) }}>Risk: %{d.burnoutRisk} — {riskLabel}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{d.brainType}</div>
                  </div>
                );
              };
              const highRisk = burnoutTeam.filter((m) => m.burnoutRisk >= 60);
              return (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={burnoutTeam} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `%${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 2" strokeOpacity={0.4} />
                      <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.4} />
                      <Bar dataKey="burnoutRisk" radius={[4, 4, 0, 0]}>
                        {burnoutTeam.map((entry, index) => (
                          <Cell key={index} fill={getBarColor(entry.burnoutRisk)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {highRisk.length > 0 && (
                    <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>🚨 {lang === 'tr' ? 'Acil Dikkat Gereken Üyeler' : 'Members Needing Urgent Attention'}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {highRisk.map((m) => (
                          <span key={m.name} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#fca5a5' }}>
                            {m.name} — %{m.burnoutRisk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>
              {lang === 'tr' ? '🚀 Hızlı İşlemler' : '🚀 Quick Actions'}
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: lang === 'tr' ? '📊 Ekip Analizi' : '📊 Team Analysis', onClick: handleTeamAnalysis },
                { label: lang === 'tr' ? '👤 Üye Ekle' : '👤 Add Member', onClick: () => setActionModal('addMember') },
                { label: lang === 'tr' ? '� Personel Raporu' : '📋 Personnel Report', onClick: handleDownloadPersonnel },
                { label: lang === 'tr' ? '🎯 İşe Alım Modu' : '🎯 Hiring Mode', onClick: () => setActionModal('hiring') },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  disabled={actionLoading}
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', transition: 'all .2s', opacity: actionLoading ? 0.6 : 1 }}
                  onMouseEnter={(e) => { if (!actionLoading) { e.currentTarget.style.background = 'rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Team Analysis Modal */}
          {actionModal === 'analysis' && analysisData && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setActionModal(null)}>
              <div className="card" style={{ maxWidth: 500, width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700 }}>{lang === 'tr' ? '📊 Ekip Analizi' : '📊 Team Analysis'}</h3>
                  <button onClick={() => setActionModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#00d4ff' }}>{analysisData.teamSize}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{lang === 'tr' ? 'Üye' : 'Members'}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>%{analysisData.overallCompatibility}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{lang === 'tr' ? 'Uyum' : 'Compatibility'}</div>
                  </div>
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>{lang === 'tr' ? '💡 Öneriler:' : '💡 Recommendations:'}</h4>
                {(analysisData.recommendations || []).map((r, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', marginBottom: 8, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                    ✅ {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hiring Mode Modal */}
          {actionModal === 'hiring' && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setActionModal(null)}>
              <div className="card" style={{ maxWidth: 560, width: '90%', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700 }}>{lang === 'tr' ? '🎯 İşe Alım Modu' : '🎯 Hiring Mode'}</h3>
                  <button onClick={() => setActionModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>✕</button>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>{lang === 'tr' ? '📊 Mevcut Ekip Dağılımı' : '📊 Current Team Distribution'}</h4>
                  {Object.entries(brainBalance).map(([type, count]) => {
                    const pct = Math.round((count / total) * 100);
                    const needed = type === leastNeeded;
                    return (
                      <div key={type} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                          <span style={{ color: brainColors[type], fontWeight: 600 }}>{brainLabels[type]?.[lang]}</span>
                          <span style={{ color: needed ? '#f59e0b' : '#94a3b8', fontWeight: needed ? 700 : 400 }}>
                            {pct}% {needed && (lang === 'tr' ? '← Eksik' : '← Needed')}
                          </span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: needed ? `linear-gradient(90deg, #f59e0b, ${brainColors[type]})` : brainColors[type], transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>
                    💡 {lang === 'tr' ? 'Öncelikli İşe Alım Önerisi' : 'Priority Hiring Recommendation'}
                  </div>
                  <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>
                    {lang === 'tr'
                      ? `Ekibiniz en çok ${brainLabels[leastNeeded]?.tr} beyin tipine ihtiyaç duyuyor. Bu profile sahip adaylar ekip dengesini güçlendirecek ve üretkenliği artıracak.`
                      : `Your team needs more ${brainLabels[leastNeeded]?.en} profiles. Candidates with this brain type will strengthen team balance and boost productivity.`}
                  </div>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>
                  {lang === 'tr' ? '🏆 Beyin Tipine Göre Uygun Roller' : '🏆 Suitable Roles by Brain Type'}
                </h4>
                {[
                  { type: 'analytical', roles: { tr: 'Veri Analisti · Yazılım Mühendisi · Finans Uzmanı', en: 'Data Analyst · Software Engineer · Finance Specialist' } },
                  { type: 'creative', roles: { tr: 'UI/UX Tasarımcı · Pazarlama Uzmanı · İnovasyon Lideri', en: 'UI/UX Designer · Marketing Specialist · Innovation Lead' } },
                  { type: 'empathetic', roles: { tr: 'İK Uzmanı · Müşteri Deneyimi · Takım Koçu', en: 'HR Specialist · Customer Experience · Team Coach' } },
                  { type: 'strategic', roles: { tr: 'Proje Yöneticisi · İş Geliştirme · Operasyon Direktörü', en: 'Project Manager · Business Development · Operations Director' } },
                ].map(({ type, roles }) => (
                  <div key={type} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 8, marginBottom: 8, background: type === leastNeeded ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${type === leastNeeded ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: brainColors[type], marginTop: 3, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: brainColors[type], marginBottom: 3 }}>{brainLabels[type]?.[lang]}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{roles[lang]}</div>
                    </div>
                    {type === leastNeeded && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, whiteSpace: 'nowrap' }}>★ {lang === 'tr' ? 'ÖNCELİKLİ' : 'PRIORITY'}</span>}
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                  💡 {lang === 'tr'
                    ? 'Aday değerlendirme sürecinde X-Neu analiz raporlarını paylaşarak aday-ekip uyumunu ölçebilirsiniz.'
                    : 'Share X-Neu analysis reports during candidate evaluation to measure candidate-team compatibility.'}
                </div>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {actionModal === 'addMember' && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => { setActionModal(null); setSearchResult(null); setSearchEmail(''); setSearchError(''); }}>
              <div className="card" style={{ maxWidth: 440, width: '90%' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700 }}>{lang === 'tr' ? '👤 E-posta ile Üye Ekle' : '👤 Add Member by Email'}</h3>
                  <button onClick={() => { setActionModal(null); setSearchResult(null); setSearchEmail(''); setSearchError(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>✕</button>
                </div>
                <form onSubmit={handleSearchMember} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>E-posta</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      placeholder="kullanici@firma.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      required
                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
                    />
                    <button type="submit" disabled={searchLoading} style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 8, padding: '10px 18px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: searchLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: searchLoading ? 0.7 : 1 }}>
                      {searchLoading ? '...' : (lang === 'tr' ? 'Ara' : 'Search')}
                    </button>
                  </div>
                </form>
                {searchError && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>⚠️ {searchError}</div>}
                {searchResult && (
                  <div style={{ padding: 16, borderRadius: 10, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{searchResult.name}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{searchResult.email}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {searchResult.brainType && (
                        <span style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#00d4ff', fontWeight: 600 }}>🧠 {searchResult.brainType}</span>
                      )}
                      {searchResult.overallScore > 0 && (
                        <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#10b981', fontWeight: 600 }}>⭐ {searchResult.overallScore}</span>
                      )}
                    </div>
                    <button onClick={() => handleAddMember(searchResult._id)} disabled={actionLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 8, padding: '10px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}>
                      {actionLoading ? (lang === 'tr' ? 'Ekleniyor...' : 'Adding...') : (lang === 'tr' ? '✅ Panele Ekle' : '✅ Add to Panel')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members List */}
          {members.length > 0 && (
            <div className="card" style={{ marginTop: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 17 }}>👥 {lang === 'tr' ? 'Panel Üyeleri' : 'Panel Members'} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 14 }}>({members.length})</span></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.map((m) => (
                  <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{m.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {m.brainType && (
                        <span style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 6, padding: '3px 9px', fontSize: 11, color: '#00d4ff', fontWeight: 600 }}>🧠 {m.brainType}</span>
                      )}
                      {m.neuroScore > 0 && (
                        <span style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '3px 9px', fontSize: 11, color: '#10b981', fontWeight: 600 }}>⭐ {m.neuroScore}</span>
                      )}
                      {m.avgMood > 0 && (
                        <span style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '3px 9px', fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>😊 {m.avgMood}/10</span>
                      )}
                      {m.avgStress > 0 && (
                        <span style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 9px', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>😓 {m.avgStress}/10</span>
                      )}
                      {m.checkinCount > 0 && (
                        <span style={{ fontSize: 11, color: '#64748b' }}>📅 {m.checkinCount} check-in</span>
                      )}
                    </div>
                    <button onClick={() => handleRemoveMember(m._id, m.name)} disabled={actionLoading} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', color: '#ef4444', fontSize: 12, cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {lang === 'tr' ? 'Kaldır' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    );
  };

  // ── Enterprise users see the dashboard ───────────────────────────────────
  if (isEnterprise) return <EnterpriseDashboard />;

  // ── Marketing page for non-enterprise users ───────────────────────────────
  const features = t.enterprise.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }));

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: '80px 40px', position: 'relative' }}>
      <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', top: 0, right: 0 }} />

      {/* Language Toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 100 }}>
        {['tr', 'en'].map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${lang === l ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, color: lang === l ? '#f59e0b' : '#64748b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s' }}>
            {l === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: 14, marginBottom: 24, display: 'inline-block' }}>
            ← {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
          </Link>
          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>
            🏢 {lang === 'tr' ? 'Kurumsal Çözüm' : 'Enterprise Solution'}
          </div>
          <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
            {lang === 'tr' ? "Ekibinizin " : "Unleash Your Team's "}
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {lang === 'tr' ? 'Nörolojik Gücünü' : 'Neurological Power'}
            </span>
            {lang === 'tr' ? ' Keşfedin' : ''}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 20, maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.7 }}>
            {lang === 'tr'
              ? 'Ekibinizin beyin tipi uyumunu analiz edin. Burnout riskini önleyin. Üretkenliği %40 artırın.'
              : 'Analyze your team\'s brain type compatibility. Prevent burnout risk. Increase productivity by 40%.'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/enterprise/login" className="btn btn-primary btn-lg" style={{ fontSize: 18, padding: '18px 48px', background: 'linear-gradient(135deg, #f59e0b, #00d4ff)' }}>
              🏢 {lang === 'tr' ? 'Kurumsal Giriş' : 'Enterprise Login'}
            </Link>
            <Link to="/pricing" className="btn btn-lg" style={{ fontSize: 16, padding: '18px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: 12, textDecoration: 'none' }}>
              {lang === 'tr' ? 'Planları Gör →' : 'View Plans →'}
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 80 }}>
          {[
            { value: '%40', label: lang === 'tr' ? 'Üretkenlik Artışı' : 'Productivity Increase' },
            { value: '%68', label: lang === 'tr' ? 'Burnout Azalması' : 'Burnout Reduction' },
            { value: '%91', label: lang === 'tr' ? 'Müşteri Memnuniyeti' : 'Client Satisfaction' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center', borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#f59e0b', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
          {lang === 'tr' ? '🎯 Neler Sunuyoruz?' : '🎯 What We Offer'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, marginBottom: 80 }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ borderColor: 'rgba(245,158,11,0.2)', transition: 'transform .2s, border-color .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,212,255,0.08))', border: '1px solid rgba(245,158,11,0.25)', padding: 56 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
            {lang === 'tr' ? 'Ekibinizi Dönüştürün' : 'Transform Your Team'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            {lang === 'tr'
              ? 'Demo talep edin veya kurumsal hesabınızla giriş yapın.'
              : 'Request a demo or sign in with your enterprise account.'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/enterprise/login" style={{ background: 'linear-gradient(135deg, #f59e0b, #00d4ff)', color: '#fff', padding: '14px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
              {lang === 'tr' ? '🏢 Kurumsal Giriş' : '🏢 Enterprise Login'}
            </Link>
            <a href="mailto:sce@scegrup.com" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '14px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
              {lang === 'tr' ? '📧 Demo Talep Et' : '📧 Request Demo'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
