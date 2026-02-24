import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import MainLayout from '../components/MainLayout';
import { adminAPI } from '../services/api';

const PLAN_COLORS   = { free: '#64748b', basic: '#00d4ff', premium: '#7c3aed', enterprise: '#f59e0b' };
const ROLE_COLORS   = { user: '#64748b', enterprise: '#f59e0b', admin: '#ef4444' };
const STATUS_COLORS = { active: '#10b981', inactive: '#64748b', cancelled: '#ef4444', trial: '#f59e0b' };
const BRAIN_COLORS  = { analytical: '#00d4ff', creative: '#7c3aed', empathetic: '#10b981', strategic: '#f59e0b' };

// ── Küçük yardımcı bileşenler ────────────────────────────────────────────────

function Btn({ children, onClick, disabled, color = '#00d4ff', style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: `${color}18`, border: `1px solid ${color}44`,
        color, borderRadius: 8, padding: '6px 12px', fontSize: 12,
        cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600,
        fontFamily: 'Inter, sans-serif', opacity: disabled ? 0.5 : 1,
        transition: 'all .15s', whiteSpace: 'nowrap', ...style,
      }}
    >
      {children}
    </button>
  );
}

function Badge({ text, color }) {
  return (
    <span style={{
      background: `${color}22`, border: `1px solid ${color}55`,
      color, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>{text}</span>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', transition: 'transform .2s' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      {children}
    </div>
  );
}

// ── Üye Oluşturma Modali ─────────────────────────────────────────────────────

const EMPTY = { name: '', email: '', password: 'Neuro2024!', role: 'user', plan: 'free', status: 'inactive', endDate: '', phone: '', company: '' };

function CreateModal({ defaultRole, onClose, onCreate }) {
  const [form, setForm] = useState({
    ...EMPTY,
    role: defaultRole,
    plan: defaultRole === 'enterprise' ? 'enterprise' : 'free',
    status: defaultRole === 'enterprise' ? 'active' : 'inactive',
  });
  const [loading, setLoading] = useState(false);
  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isEnt = form.role === 'enterprise';

  const inp = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#e2e8f0', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
  };
  const lbl = {
    display: 'block', marginBottom: 6, fontSize: 12,
    color: '#94a3b8', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.04em',
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error('İsim ve email zorunlu');
    if (form.password.length < 6) return toast.error('Şifre en az 6 karakter');
    setLoading(true);
    try { await onCreate(form); onClose(); } finally { setLoading(false); }
  };

  const PRESETS = [
    { label: '👤 Normal', role: 'user',       plan: 'free',       status: 'inactive', color: '#64748b' },
    { label: '💜 Premium', role: 'user',       plan: 'premium',    status: 'active',   color: '#7c3aed' },
    { label: '🏢 Kurumsal', role: 'enterprise', plan: 'enterprise', status: 'active',   color: '#f59e0b' },
  ];

  return (
    <Overlay onClose={onClose}>
      <div className="glass" style={{ width: '100%', maxWidth: 560, padding: 36, maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Başlık */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 2 }}>
              {isEnt ? '🏢 Kurumsal Üye Ekle' : '➕ Yeni Üye Ekle'}
            </h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              {isEnt ? 'Kurumsal hesap + enterprise panel erişimi' : 'Sisteme yeni kullanıcı oluştur'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 16 }}>✕</button>
        </div>

        {/* Hızlı preset seçimi */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {PRESETS.map((p) => {
            const active = form.role === p.role && form.plan === p.plan;
            return (
              <button key={p.label}
                onClick={() => setForm((f) => ({ ...f, role: p.role, plan: p.plan, status: p.status }))}
                style={{ flex: 1, padding: '8px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: 'Inter, sans-serif', transition: 'all .2s', border: `1px solid ${active ? p.color : 'rgba(255,255,255,0.1)'}`, background: active ? `${p.color}20` : 'rgba(255,255,255,0.03)', color: active ? p.color : '#64748b' }}>
                {p.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>İsim *</label>
              <input style={inp} value={form.name} onChange={(e) => s('name', e.target.value)} placeholder="Ad Soyad" required />
            </div>
            <div>
              <label style={lbl}>Email *</label>
              <input style={inp} type="email" value={form.email} onChange={(e) => s('email', e.target.value)} placeholder="ornek@email.com" required />
            </div>
            <div>
              <label style={lbl}>Şifre *</label>
              <input style={inp} type="text" value={form.password} onChange={(e) => s('password', e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>Telefon</label>
              <input style={inp} value={form.phone} onChange={(e) => s('phone', e.target.value)} placeholder="+90 xxx xxx xx xx" />
            </div>
          </div>

          {isEnt && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Şirket Adı</label>
              <input style={inp} value={form.company} onChange={(e) => s('company', e.target.value)} placeholder="Şirket Adı A.Ş." />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Rol</label>
              <select style={inp} value={form.role} onChange={(e) => s('role', e.target.value)}>
                <option value="user">👤 Kullanıcı</option>
                <option value="enterprise">🏢 Kurumsal</option>
                <option value="admin">🛡️ Admin</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Plan</label>
              <select style={inp} value={form.plan} onChange={(e) => s('plan', e.target.value)}>
                <option value="free">🆓 Ücretsiz</option>
                <option value="basic">💙 Basic</option>
                <option value="premium">💜 Premium</option>
                <option value="enterprise">🏆 Enterprise</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Abonelik Durumu</label>
              <select style={inp} value={form.status} onChange={(e) => s('status', e.target.value)}>
                <option value="inactive">inactive</option>
                <option value="active">active</option>
                <option value="trial">trial</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Bitiş Tarihi (opsiyonel)</label>
              <input style={inp} type="date" value={form.endDate} onChange={(e) => s('endDate', e.target.value)} />
            </div>
          </div>

          {/* Özet satırı */}
          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 18, fontSize: 12, color: '#94a3b8', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span>Rol: <Badge text={form.role} color={ROLE_COLORS[form.role]} /></span>
            <span>Plan: <Badge text={form.plan} color={PLAN_COLORS[form.plan]} /></span>
            <span>Durum: <Badge text={form.status} color={STATUS_COLORS[form.status] || '#64748b'} /></span>
            {!form.endDate && form.plan !== 'free' && <span style={{ color: '#64748b' }}>• Bitiş tarihi otomatik hesaplanacak</span>}
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: isEnt ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', color: '#fff', borderRadius: 12, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Oluşturuluyor...' : isEnt ? '🏢 Kurumsal Üye Oluştur' : '➕ Üye Oluştur'}
          </button>
        </form>
      </div>
    </Overlay>
  );
}

// ── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const qc = useQueryClient();

  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [planFilter, setPlanFilter]   = useState('');
  const [activeTab, setActiveTab]     = useState('users');

  const [showCreate, setShowCreate]         = useState(false);
  const [createRole, setCreateRole]         = useState('user');
  const [editUser, setEditUser]             = useState(null);
  const [editForm, setEditForm]             = useState({});
  const [extendDays, setExtendDays]         = useState(30);
  const [confirmDelete, setConfirmDelete]   = useState(null);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: stats, isLoading: statsLoading } = useQuery(
    'adminStats',
    () => adminAPI.getStats().then((r) => r.data.data),
    { staleTime: 30000 }
  );

  const { data: usersResp, isLoading: usersLoading } = useQuery(
    ['adminUsers', page, search, roleFilter, planFilter],
    () => adminAPI.getUsers({ page, limit: 15, search, role: roleFilter, plan: planFilter }).then((r) => r.data),
    { keepPreviousData: true, staleTime: 10000 }
  );

  const users = usersResp?.data || [];
  const pag   = usersResp?.pagination || {};

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation(
    (data) => adminAPI.createUser(data),
    {
      onSuccess: (r) => {
        qc.invalidateQueries('adminUsers');
        qc.invalidateQueries('adminStats');
        toast.success(r.data.message || 'Kullanıcı oluşturuldu ✅');
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Oluşturma başarısız'),
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => adminAPI.updateUser(id, data),
    {
      onSuccess: () => {
        qc.invalidateQueries('adminUsers');
        qc.invalidateQueries('adminStats');
        toast.success('Güncellendi ✅');
        setEditUser(null);
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Güncelleme başarısız'),
    }
  );

  const deleteMutation = useMutation(
    (id) => adminAPI.deleteUser(id),
    {
      onSuccess: () => {
        qc.invalidateQueries('adminUsers');
        qc.invalidateQueries('adminStats');
        toast.success('Kullanıcı silindi');
        setConfirmDelete(null);
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Silme başarısız'),
    }
  );

  const extendMutation = useMutation(
    ({ id, days }) => adminAPI.extendSubscription(id, days),
    {
      onSuccess: (r) => { qc.invalidateQueries('adminUsers'); toast.success(r.data.message || 'Abonelik uzatıldı ✅'); },
      onError: (e) => toast.error(e.response?.data?.error || 'Uzatma başarısız'),
    }
  );

  const resetPwMutation = useMutation(
    ({ id, pw }) => adminAPI.resetPassword(id, pw),
    {
      onSuccess: (r, { pw }) => toast.success(`Şifre sıfırlandı → ${pw}`),
      onError: () => toast.error('Şifre sıfırlanamadı'),
    }
  );

  // ── Yardımcılar ──────────────────────────────────────────────────────────

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name:    user.name,
      role:    user.role,
      plan:    user.subscription?.plan   || 'free',
      status:  user.subscription?.status || 'inactive',
      endDate: user.subscription?.endDate
        ? new Date(user.subscription.endDate).toISOString().split('T')[0]
        : '',
      isActive: user.isActive !== false,
    });
  };

  const openCreate = (role = 'user') => { setCreateRole(role); setShowCreate(true); };

  const handleResetPw = (user) => {
    const pw = window.prompt(`${user.name} için yeni şifre (boş bırak → Neuro2024!):`);
    if (pw === null) return;
    resetPwMutation.mutate({ id: user._id, pw: pw.trim() || 'Neuro2024!' });
  };

  const brainTypes = stats?.brainTypes || {};
  const totalBrain = Object.values(brainTypes).reduce((a, b) => a + b, 0) || 1;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div style={{ maxWidth: 1220, margin: '0 auto' }}>

        {/* ── Üst Bar ──── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>🛡️ Admin Paneli</h1>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>NEURO-MATCH — Sistem Yönetimi</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Btn onClick={() => openCreate('user')} color="#00d4ff" style={{ padding: '10px 18px', fontSize: 13 }}>➕ Üye Ekle</Btn>
            <Btn onClick={() => openCreate('enterprise')} color="#f59e0b" style={{ padding: '10px 18px', fontSize: 13 }}>🏢 Kurumsal Üye Ekle</Btn>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
              {[{ id: 'stats', label: '📊 İstatistikler' }, { id: 'users', label: '👥 Kullanıcılar' }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'Inter, sans-serif', background: activeTab === tab.id ? 'rgba(0,212,255,0.15)' : 'transparent', color: activeTab === tab.id ? '#00d4ff' : '#64748b', transition: 'all .2s' }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── İSTATİSTİKLER ─── */}
        {activeTab === 'stats' && (
          statsLoading
            ? <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Yükleniyor...</div>
            : <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
                  <StatCard icon="👥" label="Toplam Kullanıcı" value={stats?.totalUsers || 0} color="#00d4ff" />
                  <StatCard icon="🏢" label="Kurumsal" value={stats?.enterpriseUsers || 0} color="#f59e0b" />
                  <StatCard icon="✅" label="Aktif Abonelik" value={stats?.activeSubscriptions || 0} color="#10b981" />
                  <StatCard icon="🆓" label="Ücretsiz Plan" value={stats?.freeUsers || 0} color="#64748b" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
                  <StatCard icon="💙" label="Basic Plan" value={stats?.basicUsers || 0} color="#00d4ff" />
                  <StatCard icon="💜" label="Premium Plan" value={stats?.premiumUsers || 0} color="#7c3aed" />
                  <StatCard icon="🏆" label="Enterprise Plan" value={stats?.enterprisePlanUsers || 0} color="#f59e0b" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 15 }}>🧠 Beyin Tipi Dağılımı</h3>
                    {Object.entries(brainTypes).map(([type, count]) => {
                      const pct = Math.round((count / totalBrain) * 100);
                      const names = { analytical: 'Analitik', creative: 'Yaratıcı', empathetic: 'Empatik', strategic: 'Stratejik' };
                      return (
                        <div key={type} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                            <span style={{ color: BRAIN_COLORS[type], fontWeight: 600 }}>{names[type] || type}</span>
                            <span style={{ color: '#94a3b8' }}>{count} kişi ({pct}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct || 2}%`, background: BRAIN_COLORS[type], transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                    {!Object.keys(brainTypes).length && <p style={{ color: '#64748b', fontSize: 13 }}>Henüz analiz yok</p>}
                  </div>
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 15 }}>🕒 Son Kayıt Olanlar</h3>
                    {(stats?.recentUsers || []).map((u) => (
                      <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{u.email}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <Badge text={u.role} color={ROLE_COLORS[u.role] || '#64748b'} />
                          <Badge text={u.subscription?.plan || 'free'} color={PLAN_COLORS[u.subscription?.plan] || '#64748b'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
        )}

        {/* ── KULLANICILAR ─── */}
        {activeTab === 'users' && (
          <>
            {/* Filtreler */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="🔍  İsim veya email ara..."
                className="form-input"
                style={{ flex: 1, minWidth: 200, padding: '10px 16px', fontSize: 14 }} />
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="form-input" style={{ width: 155, padding: '10px 14px', fontSize: 14 }}>
                <option value="">Tüm Roller</option>
                <option value="user">👤 Kullanıcı</option>
                <option value="enterprise">🏢 Kurumsal</option>
                <option value="admin">🛡️ Admin</option>
              </select>
              <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="form-input" style={{ width: 155, padding: '10px 14px', fontSize: 14 }}>
                <option value="">Tüm Planlar</option>
                <option value="free">Ücretsiz</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: 13, color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
                {pag.total || 0} kullanıcı
              </div>
            </div>

            {/* Tablo */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {usersLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Yükleniyor...</div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Kullanıcı bulunamadı</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Kullanıcı', 'Rol', 'Plan', 'Durum', 'Bitiş', 'Beyin Tipi', 'Hızlı İşlemler'].map((h) => (
                          <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{u.email}</div>
                            {u.company && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 1 }}>🏢 {u.company}</div>}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Badge text={u.role} color={ROLE_COLORS[u.role] || '#64748b'} />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Badge text={u.subscription?.plan || 'free'} color={PLAN_COLORS[u.subscription?.plan] || '#64748b'} />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Badge text={u.subscription?.status || 'inactive'} color={STATUS_COLORS[u.subscription?.status] || '#64748b'} />
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {u.subscription?.endDate ? new Date(u.subscription.endDate).toLocaleDateString('tr-TR') : '—'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {u.neuroProfile?.brainType
                              ? <Badge text={u.neuroProfile.brainType} color={BRAIN_COLORS[u.neuroProfile.brainType] || '#64748b'} />
                              : <span style={{ color: '#475569', fontSize: 12 }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              <Btn onClick={() => openEdit(u)} color="#00d4ff">✏️ Düzenle</Btn>
                              <Btn
                                color="#10b981"
                                title="30 gün uzat"
                                disabled={extendMutation.isLoading}
                                onClick={() => extendMutation.mutate({ id: u._id, days: 30 })}
                              >+30g</Btn>
                              <Btn
                                color="#10b981"
                                title="1 yıl uzat"
                                disabled={extendMutation.isLoading}
                                onClick={() => extendMutation.mutate({ id: u._id, days: 365 })}
                              >+1Y</Btn>
                              <Btn color="#f59e0b" title="Şifre sıfırla" onClick={() => handleResetPw(u)}>🔑</Btn>
                              {u.role !== 'admin' && (
                                <Btn color="#ef4444" onClick={() => setConfirmDelete(u)}>🗑️</Btn>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sayfalama */}
            {pag.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}>
                <Btn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} color="#94a3b8" style={{ padding: '8px 16px' }}>← Önceki</Btn>
                {Array.from({ length: Math.min(7, pag.pages) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ background: page === p ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${page === p ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`, color: page === p ? '#00d4ff' : '#94a3b8', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: page === p ? 700 : 400, fontFamily: 'Inter, sans-serif' }}>
                    {p}
                  </button>
                ))}
                <Btn onClick={() => setPage((p) => Math.min(pag.pages, p + 1))} disabled={page === pag.pages} color="#94a3b8" style={{ padding: '8px 16px' }}>Sonraki →</Btn>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── OLUŞTURMA MODALI ─── */}
      {showCreate && (
        <CreateModal
          defaultRole={createRole}
          onClose={() => setShowCreate(false)}
          onCreate={(data) => createMutation.mutateAsync(data)}
        />
      )}

      {/* ── DÜZENLEME MODALI ─── */}
      {editUser && (
        <Overlay onClose={() => setEditUser(null)}>
          <div className="glass" style={{ width: '100%', maxWidth: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>✏️ Kullanıcı Düzenle</h2>
              <button onClick={() => setEditUser(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✕</button>
            </div>

            <div style={{ marginBottom: 14, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontWeight: 700 }}>{editUser.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{editUser.email}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">İsim</label>
                <input className="form-input" value={editForm.name || ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select className="form-input" value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="user">user</option>
                  <option value="enterprise">enterprise</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Plan</label>
                <select className="form-input" value={editForm.plan} onChange={(e) => setEditForm((f) => ({ ...f, plan: e.target.value }))}>
                  <option value="free">free</option>
                  <option value="basic">basic</option>
                  <option value="premium">premium</option>
                  <option value="enterprise">enterprise</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Durum</label>
                <select className="form-input" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="inactive">inactive</option>
                  <option value="active">active</option>
                  <option value="trial">trial</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Bitiş Tarihi</label>
                <input className="form-input" type="date" value={editForm.endDate || ''} onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <input type="checkbox" id="isActiveChk" checked={editForm.isActive !== false} onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="isActiveChk" style={{ cursor: 'pointer', fontSize: 14 }}>Hesap Aktif</label>
            </div>

            {/* Gün uzat */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Abonelik Uzat (gün)</label>
                <input type="number" className="form-input" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} min={1} max={3650} />
              </div>
              <button onClick={() => extendMutation.mutate({ id: editUser._id, days: extendDays })}
                disabled={extendMutation.isLoading}
                style={{ alignSelf: 'flex-end', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: 10, padding: '0 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'Inter, sans-serif', height: 44 }}>
                ⏱️ Uzat
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => updateMutation.mutate({ id: editUser._id, data: editForm })}
                disabled={updateMutation.isLoading}
                style={{ flex: 1, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', color: '#fff', borderRadius: 10, padding: '12px', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                {updateMutation.isLoading ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
              <button onClick={() => handleResetPw(editUser)}
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                🔑 Şifre Sıfırla
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── SİLME ONAY ─── */}
      {confirmDelete && (
        <Overlay onClose={() => setConfirmDelete(null)}>
          <div className="glass" style={{ width: '100%', maxWidth: 380, padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>Kullanıcıyı Sil</h2>
            <p style={{ color: '#94a3b8', marginBottom: 6 }}>
              <strong style={{ color: '#e2e8f0' }}>{confirmDelete.name}</strong> kalıcı olarak silinecek.
            </p>
            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 22 }}>{confirmDelete.email}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '11px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>İptal</button>
              <button onClick={() => deleteMutation.mutate(confirmDelete._id)} disabled={deleteMutation.isLoading}
                style={{ flex: 1, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: 10, padding: '11px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                {deleteMutation.isLoading ? 'Siliniyor...' : '🗑️ Sil'}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </MainLayout>
  );
}
