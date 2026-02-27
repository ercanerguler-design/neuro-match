import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { communityAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const BRAIN_COLORS = { analytical: '#00d4ff', creative: '#7c3aed', empathetic: '#10b981', strategic: '#f59e0b' };

export default function CommunityPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { t, lang } = useLanguage();
  const VALID_ROOMS = ['analytical', 'creative', 'empathetic', 'strategic'];
  const rawBrain = (user?.neuroProfile?.brainType || '').toLowerCase();
  const myBrain = VALID_ROOMS.includes(rawBrain) ? rawBrain : 'analytical';
  const [activeRoom, setActiveRoom] = useState(myBrain);
  const [newPost, setNewPost] = useState('');

  const ROOMS = (t.community && t.community.rooms) ? [
    { key: 'analytical', label: t.community.rooms.analytical.label, icon: '🔢', color: '#00d4ff', desc: t.community.rooms.analytical.desc, members: 1243 },
    { key: 'creative', label: t.community.rooms.creative.label, icon: '🎨', color: '#7c3aed', desc: t.community.rooms.creative.desc, members: 987 },
    { key: 'empathetic', label: t.community.rooms.empathetic.label, icon: '💙', color: '#10b981', desc: t.community.rooms.empathetic.desc, members: 1567 },
    { key: 'strategic', label: t.community.rooms.strategic.label, icon: '♟️', color: '#f59e0b', desc: t.community.rooms.strategic.desc, members: 832 },
  ] : [
    { key: 'analytical', label: 'Analitik', icon: '🔢', color: '#00d4ff', desc: 'Veri, sistem ve mantık odaklı tartışmalar', members: 1243 },
    { key: 'creative', label: 'Yaratıcı', icon: '🎨', color: '#7c3aed', desc: 'Tasarım, sanat ve inovasyon paylaşımları', members: 987 },
    { key: 'empathetic', label: 'Empatik', icon: '💙', color: '#10b981', desc: 'İnsan ilişkileri, duygusal zeka ve bağlantı', members: 1567 },
    { key: 'strategic', label: 'Stratejik', icon: '♟️', color: '#f59e0b', desc: 'Girişimcilik, liderlik ve büyüme stratejileri', members: 832 },
  ];

  const BRAIN_LABELS = (t.match && t.match.brainLabels) || { analytical: 'Analitik', creative: 'Yaratıcı', empathetic: 'Empatik', strategic: 'Stratejik' };
  const currentRoom = ROOMS.find((r) => r.key === activeRoom);

  const safeRoom = VALID_ROOMS.includes(activeRoom) ? activeRoom : 'analytical';
  const { data: postsData, isLoading } = useQuery(
    ['community', safeRoom],
    () => communityAPI.getPosts(safeRoom),
    { select: (res) => res.data.data, staleTime: 30000, enabled: VALID_ROOMS.includes(activeRoom) }
  );
  const roomPosts = postsData || [];

  const createMutation = useMutation(
    (content) => communityAPI.createPost(activeRoom, content),
    {
      onSuccess: (res) => {
        qc.setQueryData(['community', activeRoom], (old) => {
          const newItem = res.data.data;
          const prev = old?.data?.data || [];
          return { data: { data: [newItem, ...prev] } };
        });
        setNewPost('');
      },
    }
  );

  const likeMutation = useMutation(
    (postId) => communityAPI.likePost(postId),
    {
      onSuccess: (res, postId) => {
        const { likes, liked } = res.data.data;
        qc.setQueryData(['community', activeRoom], (old) => ({
          data: { data: (old?.data?.data || []).map((p) =>
            String(p._id) === String(postId) ? { ...p, likes, liked } : p
          )},
        }));
      },
    }
  );

  const handlePost = () => {
    if (!newPost.trim() || createMutation.isLoading) return;
    createMutation.mutate(newPost.trim());
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🤝 {(t.community && t.community.title) || 'Beyin Tipi Toplulukları'}</h1>
          <p style={{ color: '#94a3b8' }}>{(t.community && t.community.subtitle) || 'Aynı beyin tipindeki insanlarla bağlan, fikir paylaş, birlikte büyü'}</p>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: 260, flexShrink: 0 }}>
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>🏠 {(t.community && t.community.sidebarTitle) || 'Topluluklar'}</h3>
              {ROOMS.map((room) => (
                <button key={room.key} onClick={() => setActiveRoom(room.key)}
                  style={{ width: '100%', textAlign: 'left', background: activeRoom === room.key ? `${room.color}14` : 'transparent', border: `1px solid ${activeRoom === room.key ? room.color + '44' : 'transparent'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', marginBottom: 6, transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 18 }}>{room.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: activeRoom === room.key ? room.color : '#e2e8f0' }}>{room.label}</span>
                    {room.key === myBrain && <span style={{ fontSize: 10, background: 'rgba(0,212,255,0.2)', color: '#00d4ff', borderRadius: 8, padding: '1px 6px' }}>Sen</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{room.members.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')} {(t.community && t.community.members) || 'üye'}</div>
                </button>
              ))}
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📊 Topluluk İstatistikleri</h3>
              {ROOMS.map((room) => {
                const pct = Math.round((room.members / 4629) * 100);
                return (
                  <div key={room.key} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: room.color }}>{room.icon} {room.label}</span>
                      <span style={{ color: '#64748b' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: room.color, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="card" style={{ marginBottom: 20, padding: '20px 24px', borderTop: `3px solid ${currentRoom?.color}`, background: `linear-gradient(135deg, ${currentRoom?.color}08, transparent)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 36 }}>{currentRoom?.icon}</span>
                <div>
                  <h2 style={{ fontWeight: 800, marginBottom: 4, color: currentRoom?.color }}>{currentRoom?.label} Topluluğu</h2>
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{currentRoom?.desc}</p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: currentRoom?.color }}>{currentRoom?.members.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{(t.community && t.community.members) || 'üye'}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${BRAIN_COLORS[myBrain]}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, fontWeight: 700, color: '#fff' }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
                    onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') handlePost(); }}
                    placeholder={(t.community && t.community.postPlaceholder) ? `${(t.community.sidebarTitle ? currentRoom?.label + ' ' : '')}${t.community.postPlaceholder}` : `${currentRoom?.label} topluluuğuyla bir şey paylaş...`}
                    rows={3}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, resize: 'none', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#475569' }}>{lang === 'en' ? 'Press Ctrl+Enter to send' : 'Ctrl+Enter ile gönder'}</span>
                    <button onClick={handlePost} disabled={!newPost.trim() || createMutation.isLoading}
                      style={{ background: newPost.trim() ? `linear-gradient(135deg, ${currentRoom?.color}, #7c3aed)` : 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: newPost.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', opacity: createMutation.isLoading ? 0.7 : 1 }}>
                      {createMutation.isLoading ? '...' : `📤 ${(t.community && t.community.postBtn) || 'Paylaş'}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>{(t.community && t.community.loading) || 'Gönderiler yükleniyor...'}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {roomPosts.map((post) => (
                  <div key={post._id} className="card" style={{ transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${BRAIN_COLORS[post.brain]}22`, border: `1.5px solid ${BRAIN_COLORS[post.brain]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {post.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {post.author}
                          {post.isReal && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: 6, padding: '1px 6px' }}>✓ Üye</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ color: BRAIN_COLORS[post.brain] }}>● {BRAIN_LABELS[post.brain]}</span>
                          <span>·</span>
                          <span>{post.time}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#e2e8f0', margin: '0 0 12px 0' }}>{post.content}</p>
                    <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={() => post.isReal && likeMutation.mutate(post._id)}
                        style={{ background: 'none', border: 'none', cursor: post.isReal ? 'pointer' : 'default', fontSize: 13, color: post.liked ? '#ef4444' : '#64748b', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}>
                        {post.liked ? '❤️' : '🤍'} {post.likes}
                      </button>
                      <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>💬 {post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
