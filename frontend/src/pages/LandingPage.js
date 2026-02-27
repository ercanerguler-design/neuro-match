import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { t, lang, setLang } = useLanguage();
  const l = t.landing;

  const BRAIN_TYPES = lang === 'en' ? [
    { type: 'Analytical', icon: '🔢', color: '#00d4ff', desc: 'Data-driven, systematic thinker' },
    { type: 'Creative', icon: '🎨', color: '#7c3aed', desc: 'Innovative, intuitive, visionary' },
    { type: 'Empathetic', icon: '💙', color: '#10b981', desc: 'People-centered, emotional intelligence master' },
    { type: 'Strategic', icon: '♟️', color: '#f59e0b', desc: 'Born leader, results-oriented' },
  ] : [
    { type: 'Analitik', icon: '🔢', color: '#00d4ff', desc: 'Veri odaklı, sistematik düşünür' },
    { type: 'Yaratıcı', icon: '🎨', color: '#7c3aed', desc: 'Yenilikçi, sezgisel, vizyoner' },
    { type: 'Empatik', icon: '💙', color: '#10b981', desc: 'İnsan odaklı, duygusal zeka ustası' },
    { type: 'Stratejik', icon: '♟️', color: '#f59e0b', desc: 'Lider doğuştan, sonuç odaklı' },
  ];

  const FEATURES = lang === 'en' ? [
    { icon: '🧠', title: 'Neurological Profile', desc: 'Scientifically discover your brain type. Understand your strengths and potential.' },
    { icon: '💑', title: 'Compatibility Analysis', desc: 'Measure neurological compatibility with business partners, romantic partners and friends.' },
    { icon: '🤖', title: 'AI Coach', desc: '24/7 personal AI coach. Real-time guidance tailored to your brain type.' },
    { icon: '📊', title: 'Detailed Reports', desc: 'Your career path, relationship map, and life optimization plan.' },
    { icon: '🎯', title: 'Career Compass', desc: 'Scientifically discover the most suitable career paths for your brain type.' },
    { icon: '📈', title: 'Growth Tracking', desc: 'Track your neurological growth with daily check-ins and sleep tracking.' },
  ] : [
    { icon: '🧠', title: 'Nörolojik Profil', desc: 'Beyin tipinizi bilimsel olarak keşfedin. Güçlü yönlerinizi ve potansiyelinizi anlayın.' },
    { icon: '💑', title: 'Uyumluluk Analizi', desc: 'İş ortakları, romantik eşler ve arkadaşlarla nörolojik uyumluluğunuzu ölçün.' },
    { icon: '🤖', title: 'AI Koç', desc: '7/24 kişisel AI koçunuz. Beyin tipinize özel, gerçek zamanlı rehberlik.' },
    { icon: '📊', title: 'Detaylı Raporlar', desc: 'Kariyer yolunuz, ilişki haritanız ve yaşam optimizasyon planınız.' },
    { icon: '🎯', title: 'Kariyer Pusulası', desc: 'Beyin tipinize en uygun kariyer yollarını bilimsel olarak keşfedin.' },
    { icon: '📈', title: 'Büyüme İzleme', desc: 'Günlük check-in ve uyku takibi ile nörolojik büyümenizi izleyin.' },
  ];

  const STATS = lang === 'en' ? [
    { number: '50,000+', label: 'Active Users' },
    { number: '98%', label: 'Satisfaction Rate' },
    { number: '4.9/5', label: 'App Store Rating' },
    { number: '120+', label: 'Countries' },
  ] : [
    { number: '50,000+', label: 'Aktif Kullanıcı' },
    { number: '98%', label: 'Memnuniyet Oranı' },
    { number: '4.9/5', label: 'App Store Puanı' },
    { number: '120+', label: 'Ülke' },
  ];

  const HOW_IT_WORKS = lang === 'en' ? [
    { step: '01', title: 'Complete Analysis', desc: 'Fill out the 25-question scientific questionnaire. 10 minutes is all it takes.' },
    { step: '02', title: 'AI Analysis', desc: 'Our GPT-based AI system creates your neurological profile.' },
    { step: '03', title: 'Discover & Grow', desc: 'Get your report, view matches, and grow with your coach.' },
  ] : [
    { step: '01', title: 'Analizi Tamamla', desc: '25 soruluk bilimsel anketi doldurun. 10 dakika yeterli.' },
    { step: '02', title: 'AI Analiz', desc: 'GPT-4 tabanlı AI sistemi nörolojik profilinizi oluşturur.' },
    { step: '03', title: 'Keşfet & Büyü', desc: 'Raporunuzu alın, eşleşmeleri görün, koçunuzla büyüyün.' },
  ];

  return (
    <div className="page-wrapper" style={{ background: '#0a0a1a' }}>
      {/* Background orbs */}
      <div className="bg-orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)', top: -200, left: -200 }} />
      <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', top: 100, right: -200 }} />
      <div className="bg-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', bottom: 200, left: '40%' }} />

      {/* Navbar */}
      <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,26,0.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧠</div>
          <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X-Neu</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Link to="/pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>{t.nav.pricing}</Link>
          <Link to="/enterprise" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>{t.nav.enterprise}</Link>
          <Link to="/enterprise/login" style={{
            color: '#c084fc', textDecoration: 'none', fontWeight: 600, fontSize: 13,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
            padding: '5px 12px', borderRadius: 8,
          }}>🏢 {t.nav.enterpriseLogin}</Link>

          {/* Lang toggle */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
            {['tr', 'en'].map((lc) => (
              <button key={lc} onClick={() => setLang(lc)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: lang === lc ? 'rgba(0,212,255,0.2)' : 'transparent',
                color: lang === lc ? '#00d4ff' : '#64748b',
                transition: 'all 0.2s',
              }}>
                {lc === 'tr' ? '🇹🇷' : '🇬🇧'} {lc.toUpperCase()}
              </button>
            ))}
          </div>

          <Link to="/login" className="btn btn-secondary btn-sm">{t.nav.login}</Link>
          <Link to="/register" className="btn btn-primary btn-sm">{t.nav.register}</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '120px 40px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 32, fontSize: 14, fontWeight: 600, color: '#00d4ff' }}>
          {l.badge}
        </div>

        <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 900, margin: '0 auto 24px' }}>
          <span style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{l.heroLine1}</span>
          <br />
          <span style={{ color: 'white' }}>{l.heroLine2}</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #10b981, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{l.heroLine3}</span>
        </h1>

        <p style={{ fontSize: 22, color: '#94a3b8', maxWidth: 680, margin: '0 auto 48px', lineHeight: 1.7 }}>
          {l.heroDesc}
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: 18, padding: '18px 48px' }}>
            {l.ctaStart}
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg" style={{ fontSize: 18 }}>
            {l.ctaPlans}
          </Link>
        </div>

        {/* Brain animation */}
        <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))', border: '2px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, margin: '0 auto', animation: 'float 3s ease-in-out infinite', boxShadow: '0 0 60px rgba(0,212,255,0.3)' }}>
          🧠
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {STATS.map((stat) => (
            <div key={stat.label} className="glass" style={{ padding: '24px 16px' }}>
              <div style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.number}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Brain Types */}
      <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 44, fontWeight: 800, marginBottom: 16 }}>
            {lang === 'en' ? '4 Neurological Brain Types' : '4 Nörolojik Beyin Tipi'}
          </h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 56, fontSize: 18 }}>
            {lang === 'en' ? 'Which one are you? Discover through analysis.' : 'Hangisi sizsiniz? Analiz yaparak keşfedin.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
            {BRAIN_TYPES.map((bt) => (
              <div key={bt.type} className="card" style={{ textAlign: 'center', borderColor: `${bt.color}30` }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{bt.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: bt.color, marginBottom: 8 }}>{bt.type}</h3>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>{bt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 44, fontWeight: 800, marginBottom: 16 }}>{l.featuresTitle}</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 56, fontSize: 18 }}>
            {lang === 'en' ? 'Unparalleled features in the world.' : 'Dünyada bir benzeri olmayan özellikler.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <div style={{ fontSize: 44, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, marginBottom: 16 }}>
            {lang === 'en' ? 'How It Works?' : 'Nasıl Çalışır?'}
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 56, fontSize: 18 }}>
            {lang === 'en' ? 'Discover your neurological profile in 3 steps' : '3 adımda nörolojik profilinizi keşfedin'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20, fontWeight: 800 }}>{s.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section style={{ padding: '60px 40px', background: 'rgba(124,58,237,0.05)', borderTop: '1px solid rgba(124,58,237,0.15)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            {lang === 'en' ? 'Enterprise Solutions' : 'Kurumsal Çözümler'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 17, marginBottom: 28 }}>
            {lang === 'en'
              ? 'Team compatibility analysis, burnout detection, and HR dashboard for your organization.'
              : 'Ekip uyum analizi, burnout tespiti ve HR dashboard ile kurumunuzu güçlendirin.'}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/enterprise" style={{
              padding: '12px 28px', borderRadius: 12, textDecoration: 'none',
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)',
              color: '#c084fc', fontWeight: 700, fontSize: 15,
            }}>
              {lang === 'en' ? '📋 Learn More' : '📋 Daha Fazla Bilgi'}
            </Link>
            <Link to="/enterprise/login" style={{
              padding: '12px 28px', borderRadius: 12, textDecoration: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #c084fc)', border: 'none',
              color: '#fff', fontWeight: 700, fontSize: 15,
            }}>
              🏢 {t.nav.enterpriseLogin}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: 700, margin: '0 auto', padding: 64, borderColor: 'rgba(0,212,255,0.2)' }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, marginBottom: 16 }}>
            {lang === 'en' ? 'Ready?' : 'Hazır mısın?'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 40 }}>
            {lang === 'en'
              ? 'Take the first step to discover your brain. Start free, upgrade anytime.'
              : 'Beynini keşfetmek için ilk adımı at. Ücretsiz başla, istediğin zaman yükselt.'}
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: 18, padding: '20px 56px' }}>
            {lang === 'en' ? '🚀 Start Now - Free' : '🚀 Şimdi Başla - Ücretsiz'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>⚡</div>
                <span style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1 }}>X-Neu</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{l.footer}</p>
              <p style={{ color: '#475569', fontSize: 12 }}>by <span style={{ color: '#94a3b8', fontWeight: 600 }}>SCE INNOVATION LTD. ŞTİ.</span></p>
              <p style={{ color: '#475569', fontSize: 12, fontStyle: 'italic' }}>Software Circuit Engineer</p>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>{lang === 'tr' ? 'İletişim' : 'Contact'}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📍</span>
                  <span style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>Çetin Emeç Bulvarı 25/3<br />Çankaya / Ankara</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>✉️</span>
                  <a href="mailto:sce@scegrup.com" style={{ color: '#00d4ff', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>sce@scegrup.com</a>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📞</span>
                  <a href="tel:+908508881889" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}>+90 0850 888 1 889</a>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>💬</span>
                  <a href="https://wa.me/905433929230" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Wp: +90 543 392 92 30</a>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>{lang === 'tr' ? 'Yasal' : 'Legal'}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { to: '/privacy', label: lang === 'tr' ? '🔒 Gizlilik Politikası' : '🔒 Privacy Policy' },
                  { to: '/terms', label: lang === 'tr' ? '📋 Kullanım Koşulları' : '📋 Terms of Use' },
                  { to: '/kvkk', label: '🛡️ KVKK' },
                  { to: '/contact', label: lang === 'tr' ? '📬 İletişim' : '📬 Contact' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500,
                      padding: '6px 12px', borderRadius: 8, transition: 'all 0.2s',
                      background: 'transparent', border: '1px solid transparent',
                      display: 'inline-block', width: 'fit-content',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#00d4ff'; e.currentTarget.style.background = 'rgba(0,212,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#374151', fontSize: 13 }}>
              © 2026 X-Neu · SCE INNOVATION LTD. ŞTİ. {lang === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
            </p>
            <p style={{ color: '#374151', fontSize: 13 }}>🧠 X-Neu</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
