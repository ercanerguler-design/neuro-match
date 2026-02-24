import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { matchAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';

const MATCH_TYPES = [
  { value: 'professional', label: 'İş Ortağı', icon: '💼', desc: 'En uyumlu iş ortağını bul' },
  { value: 'romantic', label: 'Romantik', icon: '💑', desc: 'Beyin uyumluluğuna göre partner' },
  { value: 'friendship', label: 'Arkadaşlık', icon: '🤝', desc: 'Derin arkadaşlık uyumu' },
  { value: 'personal', label: 'Kişisel', icon: '👥', desc: 'Genel uyumluluk analizi' },
];

export default function MatchPage() {
  const [selectedType, setSelectedType] = useState('professional');
  const { user } = useAuthStore();

  const { data: compatibles, isFetching } = useQuery(
    ['compatibles', selectedType],
    () => matchAPI.findCompatible(selectedType),
    { select: (res) => res.data.data, enabled: !!user?.neuroProfile?.brainType }
  );

  const { data: myMatches } = useQuery('my-matches', matchAPI.getMyMatches, {
    select: (res) => res.data.data,
  });

  if (!user?.neuroProfile?.brainType) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🔍</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Önce Analizini Tamamla</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32 }}>Eşleştirme özelliğini kullanmak için nörolojik analizini tamamlaman gerekiyor.</p>
          <a href="/analysis" className="btn btn-primary btn-lg">🧠 Analizi Başlat</a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>💑 Nörolojik Eşleştirme</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>Beyin tipine göre en uyumlu kişileri keşfet</p>

        {/* Match type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {MATCH_TYPES.map((type) => (
            <button key={type.value} onClick={() => setSelectedType(type.value)}
              style={{ padding: '20px 16px', borderRadius: 16, border: `2px solid ${selectedType === type.value ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`, background: selectedType === type.value ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', color: '#fff', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{type.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: selectedType === type.value ? '#00d4ff' : '#fff', marginBottom: 4 }}>{type.label}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{type.desc}</div>
            </button>
          ))}
        </div>

        {/* Compatible users */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            🎯 En Uyumlu Kişiler - {MATCH_TYPES.find(t => t.value === selectedType)?.label}
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
                      {u.neuroProfile?.brainType === 'analytical' ? '🔢 Analitik' : u.neuroProfile?.brainType === 'creative' ? '🎨 Yaratıcı' : u.neuroProfile?.brainType === 'empathetic' ? '💙 Empatik' : '♟️ Stratejik'}
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
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📋 Geçmiş Eşleşmelerim</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myMatches.slice(0, 5).map((match) => (
                <div key={match._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{match.target?.name || 'Anonim'}</span>
                    <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 8 }}>
                      {MATCH_TYPES.find(t => t.value === match.type)?.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, color: match.compatibilityScore > 75 ? '#10b981' : '#00d4ff' }}>
                      %{match.compatibilityScore}
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: 11 }}>
                      {new Date(match.createdAt).toLocaleDateString('tr-TR')}
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
