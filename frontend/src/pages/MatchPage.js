import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { matchAPI, authAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

export default function MatchPage() {
  const [selectedType, setSelectedType] = useState('professional');
  const { user, updateUser } = useAuthStore();
  const { t, lang } = useLanguage();
  const [profileChecked, setProfileChecked] = useState(false);

  // Normalize brainType to lowercase from store
  const rawBrainType = user?.neuroProfile?.brainType;
  const hasBrainType = !!rawBrainType;

  // Auto-refresh user from server once on mount if local store shows no brainType
  // (handles case where analysis was completed but store was not updated)
  useEffect(() => {
    if (!hasBrainType) {
      authAPI.getMe()
        .then((res) => {
          const freshUser = res?.data?.data;
          if (freshUser) updateUser(freshUser);
        })
        .catch(() => {})
        .finally(() => setProfileChecked(true));
    } else {
      setProfileChecked(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use normalized brainType (lowercase) everywhere
  const myBrainType = rawBrainType ? rawBrainType.toLowerCase() : null;

  const MATCH_TYPES = (t.match && t.match.matchTypes) || [
    { value: 'professional', label: 'İş Ortağı', icon: '💼', desc: 'En uyumlu iş ortağını bul' },
    { value: 'startup', label: 'Startup Kurucu', icon: '🚀', desc: 'Tamamlayıcı kurucu bul' },
    { value: 'romantic', label: 'Romantik', icon: '💑', desc: 'Beyin uyumluluğuna göre partner' },
    { value: 'friendship', label: 'Arkadaşlık', icon: '🤝', desc: 'Derin arkadaşlık uyumu' },
    { value: 'personal', label: 'Kişisel', icon: '👥', desc: 'Genel uyumluluk analizi' },
  ];

  const CO_FOUNDER_ROLES = (t.match && t.match.coFounder && t.match.coFounder.roles) || {
    analytical: { idealRole: 'CTO / Ürün', pairs: ['creative', 'strategic'], tip: 'Sistemi sen kur, yaratıcı ortak vizyonu genişletsin.' },
    creative: { idealRole: 'CPO / Tasarım', pairs: ['analytical', 'strategic'], tip: 'Ürünü sen şekillendir, analitik ortak tekniği yönetsin.' },
    empathetic: { idealRole: 'COO / Müşteri', pairs: ['strategic', 'analytical'], tip: 'İnsan odaklı büyüme için stratejik kurucu gerekli.' },
    strategic: { idealRole: 'CEO / Büyüme', pairs: ['analytical', 'creative'], tip: 'Şirketi sen yönet, yaratıcı ürünü, analitik tekniği geliştirsin.' },
  };

  const brainLabels = (t.match && t.match.brainLabels) || { analytical: 'Analitik', creative: 'Yaratıcı', empathetic: 'Empatik', strategic: 'Stratejik' };

  const { data: compatibles, isFetching } = useQuery(
    ['compatibles', selectedType],
    () => matchAPI.findCompatible(selectedType),
    { select: (res) => res.data.data, enabled: !!myBrainType }
  );

  const { data: myMatches } = useQuery('my-matches', matchAPI.getMyMatches, {
    select: (res) => res.data.data,
  });

  // Show loading while we verify the profile from server
  if (!profileChecked) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', paddingTop: 120 }}>
          <div className="loading-spinner" style={{ width: 48, height: 48, margin: '0 auto 24px' }} />
          <p style={{ color: '#94a3b8' }}>{lang === 'en' ? 'Loading your profile...' : 'Profil yükleniyor...'}</p>
        </div>
      </MainLayout>
    );
  }

  if (!myBrainType) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🔍</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{lang === 'en' ? 'Complete Your Analysis First' : 'Önce Analizini Tamamla'}</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32 }}>{lang === 'en' ? 'You need to complete your neurological analysis to use the matching feature.' : 'Eşleştirme özelliğini kullanmak için nörolojik analizini tamamlaman gerekiyor.'}</p>
          <a href="/analysis" className="btn btn-primary btn-lg">🧠 {lang === 'en' ? 'Start Analysis' : 'Analizi Başlat'}</a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>💑 {(t.match && t.match.pageTitle) || 'Nörolojik Eşleştirme'}</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>{lang === 'en' ? 'Discover the most compatible people based on your brain type' : 'Beyin tipine göre en uyumlu kişileri keşfet'}</p>

        {/* Match type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 32 }}>
          {MATCH_TYPES.map((type) => (
            <button key={type.value} onClick={() => setSelectedType(type.value)}
              style={{ padding: '20px 16px', borderRadius: 16, border: `2px solid ${selectedType === type.value ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`, background: selectedType === type.value ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', color: '#fff', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{type.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: selectedType === type.value ? '#00d4ff' : '#fff', marginBottom: 4 }}>{type.label}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{type.desc}</div>
            </button>
          ))}
        </div>

        {/* Startup Co-founder Panel */}
        {selectedType === 'startup' && (() => {
          const myBrain = myBrainType || 'strategic';
          const roleInfo = CO_FOUNDER_ROLES[myBrain] || CO_FOUNDER_ROLES.strategic;
          const brainIcons = { analytical: '🔢', creative: '🎨', empathetic: '💙', strategic: '♟️' };
          const localBrainLabels = brainLabels;
          return (
            <div className="card" style={{ marginBottom: 32, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#7c3aed' }}>🚀 {(t.match && t.match.coFounder && t.match.coFounder.title) || 'Startup Kurucu Profili'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{lang === 'en' ? 'Your Brain Type' : 'Senin Beyin Tipin'}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{brainIcons[myBrain]} {localBrainLabels[myBrain] || myBrain}</div>
                  <div style={{ fontSize: 13, color: '#00d4ff', marginTop: 6, fontWeight: 600 }}>{lang === 'en' ? 'Recommended Role' : 'Önerilen Rol'}: {roleInfo.idealRole}</div>
                </div>
                <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{lang === 'en' ? 'Ideal Co-founder Profile' : 'İdeal Kurucu Profili'}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {roleInfo.pairs.map((bt) => (
                      <span key={bt} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
                        {brainIcons[bt]} {localBrainLabels[bt]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                💡 {roleInfo.tip}
              </div>
            </div>
          );
        })()}

        {/* Compatible users */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            🎯 {lang === 'en' ? 'Most Compatible People' : 'En Uyumlu Kişiler'} - {MATCH_TYPES.find(t2 => t2.value === selectedType)?.label}
          </h2>
          {isFetching ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
              {(compatibles || []).map(({ user: u, score }, i) => (
                <div key={u._id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{u.name}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
                      {(() => {
                        const bt = (u.neuroProfile?.brainType || '').toLowerCase();
                        return bt === 'analytical' ? `🔢 ${brainLabels.analytical}` : bt === 'creative' ? `🎨 ${brainLabels.creative}` : bt === 'empathetic' ? `💙 ${brainLabels.empathetic}` : bt === 'strategic' ? `♟️ ${brainLabels.strategic}` : bt;
                      })()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${score}%`, background: score > 80 ? '#10b981' : score > 60 ? '#00d4ff' : '#f59e0b' }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: score > 80 ? '#10b981' : '#00d4ff', minWidth: 40 }}>{score}%</span>
                    </div>
                  </div>
                  {i < 3 && <span className="badge badge-success" style={{ fontSize: 10 }}>Top {i+1}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My matches */}
        {myMatches?.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📋 {lang === 'en' ? 'My Past Matches' : 'Geçmiş Eşleşmelerim'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myMatches.slice(0, 5).map((match) => (
                <div key={match._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{match.target?.name || 'Anonim'}</span>
                    <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 8 }}>
                      {MATCH_TYPES.find(mt => mt.value === match.type)?.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, color: match.compatibilityScore > 75 ? '#10b981' : '#00d4ff' }}>
                      %{match.compatibilityScore}
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: 11 }}>
                      {new Date(match.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
