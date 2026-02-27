import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 4, height: 20, background: 'linear-gradient(#10b981, #00d4ff)', borderRadius: 2, display: 'inline-block' }} />
      {title}
    </h2>
    <div style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function KVKKPage() {
  const { lang } = useLanguage();
  const tr = lang === 'tr';

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', bottom: -200, left: -200, pointerEvents: 'none' }} />

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 14, fontWeight: 600, color: '#10b981' }}>
            🛡️ KVKK {tr ? 'Aydınlatma Metni' : 'Disclosure Text'}
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 16 }}>
            {tr ? 'KVKK Aydınlatma Metni' : 'GDPR / KVKK Disclosure'}
          </h1>
          <p style={{ color: '#475569', fontSize: 14 }}>
            {tr ? 'Son güncelleme: Şubat 2026' : 'Last updated: February 2026'} · X-Neu by SCE INNOVATION LTD. ŞTİ.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 40 }}>
          {tr ? (
            <>
              <Section title="1. Veri Sorumlusu">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu sıfatıyla SCE INNOVATION LTD. ŞTİ. (Çetin Emeç Bulvarı 25/3, Çankaya / Ankara) tarafından aşağıda açıklanan kapsamda işlenecektir.
              </Section>
              <Section title="2. İşlenen Kişisel Veriler">
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li><strong style={{ color: '#e2e8f0' }}>Kimlik Bilgileri:</strong> Ad, soyad</li>
                  <li><strong style={{ color: '#e2e8f0' }}>İletişim Bilgileri:</strong> E-posta adresi</li>
                  <li><strong style={{ color: '#e2e8f0' }}>Analiz Verileri:</strong> Anket yanıtları, nörolojik profil sonuçları</li>
                  <li><strong style={{ color: '#e2e8f0' }}>Kullanım Verileri:</strong> Platform etkileşimleri, oturum bilgileri</li>
                </ul>
              </Section>
              <Section title="3. Kişisel Verilerin İşlenme Amaçları">
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>X-Neu platformunun sunulması ve kişiselleştirilmesi</li>
                  <li>Nörolojik uyumluluk analizlerinin gerçekleştirilmesi</li>
                  <li>AI koçluk hizmetlerinin iyileştirilmesi</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>İletişim faaliyetlerinin yürütülmesi</li>
                </ul>
              </Section>
              <Section title="4. Kişisel Verilerin Aktarımı">
                Kişisel verileriniz; yurt içinde hizmet alınan teknik altyapı sağlayıcıları ile yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir. Üçüncü taraflara ticari amaçla aktarım yapılmaz.
              </Section>
              <Section title="5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi">
                Verileriniz elektronik ortamda platform üzerinden toplanmakta; KVKK'nın 5. maddesi uyarınca açık rıza, sözleşmenin ifası ve meşru menfaat hukuki sebeplerine dayalı olarak işlenmektedir.
              </Section>
              <Section title="6. KVKK Kapsamındaki Haklarınız">
                KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde/dışında verilerin aktarıldığı üçüncü kişileri öğrenme</li>
                  <li>Eksik/yanlış işlenen verilerin düzeltilmesini talep etme</li>
                  <li>KVKK'nın 7. maddesi kapsamında silinmesini/yok edilmesini talep etme</li>
                  <li>İşlemenin otomatik sistemler aracılığıyla sizi olumsuz etkileyen bir sonuç üretmesine itiraz etme</li>
                  <li>Kanuna aykırı işleme nedeniyle uğranılan zararın giderilmesini talep etme</li>
                </ul>
              </Section>
              <Section title="7. Başvuru Yolu">
                Haklarınızı kullanmak için <a href="mailto:sce@scegrup.com" style={{ color: '#10b981', textDecoration: 'none' }}>sce@scegrup.com</a> adresine e-posta gönderebilir veya yazılı olarak Çetin Emeç Bulvarı 25/3, Çankaya / Ankara adresine başvurabilirsiniz. Başvurular 30 gün içinde yanıtlanır.
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Data Controller">
                Pursuant to the Law on Protection of Personal Data No. 6698 ("KVKK"), your personal data will be processed by SCE INNOVATION LTD. ŞTİ. (Çetin Emeç Bulvarı 25/3, Çankaya / Ankara) as data controller within the scope described below.
              </Section>
              <Section title="2. Personal Data Processed">
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li><strong style={{ color: '#e2e8f0' }}>Identity Information:</strong> First name, last name</li>
                  <li><strong style={{ color: '#e2e8f0' }}>Contact Information:</strong> Email address</li>
                  <li><strong style={{ color: '#e2e8f0' }}>Analysis Data:</strong> Survey responses, neurological profile results</li>
                  <li><strong style={{ color: '#e2e8f0' }}>Usage Data:</strong> Platform interactions, session information</li>
                </ul>
              </Section>
              <Section title="3. Purposes of Processing">
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Providing and personalizing the X-Neu platform</li>
                  <li>Conducting neurological compatibility analyses</li>
                  <li>Improving AI coaching services</li>
                  <li>Fulfilling legal obligations</li>
                  <li>Managing communication activities</li>
                </ul>
              </Section>
              <Section title="4. Data Transfer">
                Your personal data may be shared with domestic technical infrastructure providers and authorized public institutions as legally required. No transfer to third parties for commercial purposes.
              </Section>
              <Section title="5. Legal Basis">
                Data is collected electronically through the platform and processed based on explicit consent, performance of contract, and legitimate interest as per Article 5 of KVKK.
              </Section>
              <Section title="6. Your Rights">
                You have the following rights under KVKK Article 11:
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Right to learn whether personal data is processed</li>
                  <li>Right to request correction of incomplete/incorrect data</li>
                  <li>Right to request deletion or destruction of data</li>
                  <li>Right to object to automated decision-making</li>
                  <li>Right to claim compensation for damages from unlawful processing</li>
                </ul>
              </Section>
              <Section title="7. How to Apply">
                To exercise your rights, you may send an email to <a href="mailto:sce@scegrup.com" style={{ color: '#10b981', textDecoration: 'none' }}>sce@scegrup.com</a> or apply in writing to Çetin Emeç Bulvarı 25/3, Çankaya / Ankara. Applications are responded to within 30 days.
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
