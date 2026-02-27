import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage() {
  const { lang } = useLanguage();
  const tr = lang === 'tr';

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)', top: -200, left: -200, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', bottom: 0, right: -100, pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,26,0.9)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X-Neu</span>
        </Link>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← {tr ? 'Ana Sayfa' : 'Home'}
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 14, fontWeight: 600, color: '#00d4ff' }}>
            📬 {tr ? 'İletişim' : 'Contact'}
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {tr ? 'Bize Ulaşın' : 'Get in Touch'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
            {tr ? 'Her türlü soru ve görüşleriniz için bizimle iletişime geçin.' : 'Reach out to us for any questions or feedback.'}
          </p>
        </div>

        {/* Company Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: 40, marginBottom: 32, boxShadow: '0 0 40px rgba(0,212,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>⚡</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>SCE INNOVATION LTD. ŞTİ.</h2>
              <span style={{ fontSize: 13, color: '#00d4ff', fontWeight: 600, background: 'rgba(0,212,255,0.1)', padding: '2px 10px', borderRadius: 6, border: '1px solid rgba(0,212,255,0.2)' }}>Software Circuit Engineer</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Address */}
            <div style={{ display: 'flex', gap: 14, padding: '18px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>📍</div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{tr ? 'Adres' : 'Address'}</div>
                <div style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.6 }}>Çetin Emeç Bulvarı 25/3<br />Çankaya / Ankara</div>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', gap: 14, padding: '18px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>✉️</div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{tr ? 'E-posta' : 'Email'}</div>
                <a href="mailto:sce@scegrup.com" style={{ fontSize: 15, color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>sce@scegrup.com</a>
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', gap: 14, padding: '18px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>📞</div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{tr ? 'Telefon' : 'Phone'}</div>
                <a href="tel:+908508881889" style={{ fontSize: 15, color: '#e2e8f0', textDecoration: 'none', display: 'block' }}>+90 0850 888 1 889</a>
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ display: 'flex', gap: 14, padding: '18px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>💬</div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>WhatsApp</div>
                <a href="https://wa.me/905433929230" target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>+90 543 392 92 30</a>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/905433929230"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            width: '100%', padding: '18px 32px', borderRadius: 14,
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 700,
            boxShadow: '0 8px 32px rgba(37,211,102,0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,211,102,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,211,102,0.25)'; }}
        >
          <span style={{ fontSize: 22 }}>💬</span>
          {tr ? 'WhatsApp ile Hemen Yaz' : 'Message us on WhatsApp'}
        </a>

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 40 }}>
          {tr
            ? 'X-Neu, SCE INNOVATION LTD. ŞTİ. tarafından geliştirilmektedir.'
            : 'X-Neu is developed by SCE INNOVATION LTD. ŞTİ.'}
        </p>
      </div>
    </div>
  );
}
