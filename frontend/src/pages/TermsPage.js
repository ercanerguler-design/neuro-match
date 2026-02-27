import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 4, height: 20, background: 'linear-gradient(#7c3aed, #c084fc)', borderRadius: 2, display: 'inline-block' }} />
      {title}
    </h2>
    <div style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function TermsPage() {
  const { lang } = useLanguage();
  const tr = lang === 'tr';

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', top: -200, right: -200, pointerEvents: 'none' }} />

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 14, fontWeight: 600, color: '#c084fc' }}>
            📋 {tr ? 'Kullanım Koşulları' : 'Terms of Use'}
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 16 }}>{tr ? 'Kullanım Koşulları' : 'Terms of Use'}</h1>
          <p style={{ color: '#475569', fontSize: 14 }}>{tr ? 'Son güncelleme: Şubat 2026' : 'Last updated: February 2026'} · X-Neu by SCE INNOVATION LTD. ŞTİ.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 40 }}>
          {tr ? (
            <>
              <Section title="1. Hizmetin Kapsamı">
                X-Neu, nörolojik uyumluluk analizi, AI koçluk ve kariyer rehberliği hizmetleri sunan bir platformdur. Bu hizmetler SCE INNOVATION LTD. ŞTİ. tarafından sağlanmaktadır.
              </Section>
              <Section title="2. Kullanıcı Yükümlülükleri">
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Platform yalnızca 18 yaş ve üzeri bireyler tarafından kullanılabilir</li>
                  <li>Hesap bilgilerinizin gizliliğini korumak sizin sorumluluğunuzdadır</li>
                  <li>Başka kullanıcıların verilerine yetkisiz erişim kesinlikle yasaktır</li>
                  <li>Platformu kötü amaçlı yazılım yaymak amacıyla kullanamazsınız</li>
                </ul>
              </Section>
              <Section title="3. Fikri Mülkiyet">
                X-Neu markası, tüm içerikler, algoritmalar ve tasarımlar SCE INNOVATION LTD. ŞTİ.'nin fikri mülkiyetidir. İzinsiz kopyalanması veya dağıtılması yasaktır.
              </Section>
              <Section title="4. Abonelik ve Ödemeler">
                Ücretli planlar aylık veya yıllık faturalandırılır. İptal durumunda mevcut dönem sonuna kadar erişim devam eder. Kısmi iade yapılmaz.
              </Section>
              <Section title="5. Sorumluluk Sınırlaması">
                X-Neu'nun sunduğu analizler bilimsel destekli olmakla birlikte tıbbi veya psikolojik tanı niteliği taşımaz. Sonuçlar rehber niteliğinde değerlendirilmelidir.
              </Section>
              <Section title="6. Hesap Askıya Alma">
                Kullanım koşullarının ihlali halinde X-Neu, önceden bildirimde bulunmaksızın hesabınızı askıya alma veya silme hakkını saklı tutar.
              </Section>
              <Section title="7. Değişiklikler">
                Bu koşullar zaman zaman güncellenebilir. Önemli değişiklikler e-posta ile bildirilir. Platformu kullanmaya devam etmek değişikliklerin kabul edildiği anlamına gelir.
              </Section>
              <Section title="8. İletişim">
                <a href="mailto:sce@scegrup.com" style={{ color: '#c084fc', textDecoration: 'none' }}>sce@scegrup.com</a>
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Scope of Service">
                X-Neu is a platform providing neurological compatibility analysis, AI coaching, and career guidance services. These services are provided by SCE INNOVATION LTD. ŞTİ.
              </Section>
              <Section title="2. User Obligations">
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Platform may only be used by individuals aged 18 and above</li>
                  <li>It is your responsibility to keep your account credentials secure</li>
                  <li>Unauthorized access to other users' data is strictly prohibited</li>
                  <li>You may not use the platform to distribute malware</li>
                </ul>
              </Section>
              <Section title="3. Intellectual Property">
                X-Neu brand, all content, algorithms, and designs are the intellectual property of SCE INNOVATION LTD. ŞTİ. Unauthorized copying or distribution is prohibited.
              </Section>
              <Section title="4. Subscriptions and Payments">
                Paid plans are billed monthly or annually. Upon cancellation, access continues until the end of the current period. Partial refunds are not provided.
              </Section>
              <Section title="5. Limitation of Liability">
                Analyses provided by X-Neu are scientifically supported but do not constitute medical or psychological diagnoses. Results should be considered as guidance only.
              </Section>
              <Section title="6. Account Suspension">
                In case of violation of terms of use, X-Neu reserves the right to suspend or delete your account without prior notice.
              </Section>
              <Section title="7. Changes">
                These terms may be updated from time to time. Significant changes will be notified via email. Continuing to use the platform implies acceptance of the changes.
              </Section>
              <Section title="8. Contact">
                <a href="mailto:sce@scegrup.com" style={{ color: '#c084fc', textDecoration: 'none' }}>sce@scegrup.com</a>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
