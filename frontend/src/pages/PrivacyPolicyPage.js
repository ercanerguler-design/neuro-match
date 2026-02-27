import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#00d4ff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 4, height: 20, background: 'linear-gradient(#00d4ff, #7c3aed)', borderRadius: 2, display: 'inline-block' }} />
      {title}
    </h2>
    <div style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const tr = lang === 'tr';

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', top: -200, left: -200, pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,26,0.9)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X-Neu</span>
        </Link>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>← {tr ? 'Ana Sayfa' : 'Home'}</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 14, fontWeight: 600, color: '#00d4ff' }}>
            🔒 {tr ? 'Gizlilik Politikası' : 'Privacy Policy'}
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 16 }}>{tr ? 'Gizlilik Politikası' : 'Privacy Policy'}</h1>
          <p style={{ color: '#475569', fontSize: 14 }}>{tr ? 'Son güncelleme: Şubat 2026' : 'Last updated: February 2026'} · X-Neu by SCE INNOVATION LTD. ŞTİ.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 40 }}>
          {tr ? (
            <>
              <Section title="1. Toplanan Bilgiler">
                X-Neu platformu olarak kullanıcılarımızdan isim, e-posta adresi, analiz sonuçları ve koç etkileşim verileri gibi bilgileri toplarız. Bu bilgiler yalnızca hizmetlerimizi sunmak amacıyla kullanılır.
              </Section>
              <Section title="2. Bilgilerin Kullanımı">
                <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Nörolojik profil oluşturma ve uyumluluk analizi</li>
                  <li>AI koç hizmetlerinin kişiselleştirilmesi</li>
                  <li>Platform güvenliği ve doğrulama</li>
                  <li>Hizmet iyileştirme ve geliştirme</li>
                </ul>
              </Section>
              <Section title="3. Bilgilerin Paylaşımı">
                Kişisel verileriniz hiçbir koşulda üçüncü taraflarla ticari amaçla paylaşılmaz. Yasal yükümlülükler dışında verileriniz yalnızca açık rızanızla paylaşılabilir.
              </Section>
              <Section title="4. Veri Güvenliği">
                Tüm verileriniz AES-256 şifreleme ve güvenli HTTPS bağlantıları ile korunmaktadır. Sunucularımız Avrupa veri merkezi standartlarına uygun şekilde barındırılmaktadır.
              </Section>
              <Section title="5. Veri Saklama Süresi">
                Kullanıcı verileri hesap aktif kaldığı sürece saklanır. Hesap silme talebinde tüm veriler 30 gün içinde kalıcı olarak silinir.
              </Section>
              <Section title="6. Haklarınız">
                <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Verilerin düzeltilmesini, silinmesini talep etme</li>
                  <li>Veri işlemeye itiraz etme</li>
                </ul>
              </Section>
              <Section title="7. İletişim">
                Gizlilik politikamız hakkında sorularınız için: <a href="mailto:sce@scegrup.com" style={{ color: '#00d4ff', textDecoration: 'none' }}>sce@scegrup.com</a>
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Information We Collect">
                As X-Neu platform, we collect information such as your name, email address, analysis results, and coach interaction data. This information is used solely to provide our services.
              </Section>
              <Section title="2. Use of Information">
                <p>We use the information we collect to:</p>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Create neurological profiles and compatibility analysis</li>
                  <li>Personalize AI coach services</li>
                  <li>Platform security and verification</li>
                  <li>Service improvement and development</li>
                </ul>
              </Section>
              <Section title="3. Sharing of Information">
                Your personal data will never be shared with third parties for commercial purposes. Outside of legal obligations, your data may only be shared with your explicit consent.
              </Section>
              <Section title="4. Data Security">
                All your data is protected with AES-256 encryption and secure HTTPS connections. Our servers are hosted in compliance with European data center standards.
              </Section>
              <Section title="5. Data Retention">
                User data is retained as long as the account remains active. Upon account deletion request, all data is permanently deleted within 30 days.
              </Section>
              <Section title="6. Your Rights">
                <p>You have the following rights:</p>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Right to know whether your personal data is being processed</li>
                  <li>Right to request correction or deletion of data</li>
                  <li>Right to object to data processing</li>
                </ul>
              </Section>
              <Section title="7. Contact">
                For questions about our privacy policy: <a href="mailto:sce@scegrup.com" style={{ color: '#00d4ff', textDecoration: 'none' }}>sce@scegrup.com</a>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
