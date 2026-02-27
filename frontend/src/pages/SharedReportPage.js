import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { reportAPI } from '../services/api';
import { generatePDF } from '../utils/generatePDF';

const BRAIN_TYPE_ICONS = { analytical: '🔢', creative: '🎨', empathetic: '💙', strategic: '♟️' };
const BRAIN_TYPE_LABELS = { analytical: 'Analitik', creative: 'Yaratıcı', empathetic: 'Empatik', strategic: 'Stratejik' };
const BRAIN_TYPE_COLORS = {
  analytical: '#00d4ff',
  creative: '#7c3aed',
  empathetic: '#10b981',
  strategic: '#f59e0b',
};

export default function SharedReportPage() {
  const { token } = useParams();
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: report, isLoading, isError } = useQuery(
    ['sharedReport', token],
    () => reportAPI.getShared(token).then((r) => r.data.data),
    { retry: false, refetchOnWindowFocus: false }
  );

  const handlePDF = () => {
    setPdfLoading(true);
    generatePDF(
      report,
      report?.user,
      () => { toast.success('PDF indirildi!'); setPdfLoading(false); },
      () => { toast.error('PDF oluşturulamadı'); setPdfLoading(false); }
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X-Neu</span>
          <span style={{ fontSize: 13, color: '#64748b' }}>Paylaşılan Rapor</span>
        </Link>
        <Link to="/register" style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          Ücretsiz Kayıt Ol
        </Link>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.2)', borderTop: '3px solid #00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Rapor yükleniyor...
          </div>
        )}

        {isError && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Rapor Bulunamadı</h2>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>Bu rapor bağlantısı geçersiz veya süresi dolmuş olabilir.</p>
            <Link to="/" style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
              Ana Sayfaya Dön
            </Link>
          </div>
        )}

        {report && (
          <>
            {/* Report header card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 28px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{report.title}</h1>
                  <p style={{ color: '#64748b', fontSize: 13 }}>
                    {report.user?.name && <span style={{ color: '#94a3b8' }}>{report.user.name}  ·  </span>}
                    {new Date(report.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={handlePDF}
                  disabled={pdfLoading}
                  style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: pdfLoading ? 'not-allowed' : 'pointer', opacity: pdfLoading ? 0.7 : 1, whiteSpace: 'nowrap' }}
                >
                  {pdfLoading ? '⏳ Hazırlanıyor...' : '📄 PDF İndir'}
                </button>
              </div>

              {/* Brain type + score */}
              {report.user?.neuroProfile?.brainType && (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ padding: '12px 18px', borderRadius: 10, background: `${BRAIN_TYPE_COLORS[report.user.neuroProfile.brainType]}18`, border: `1px solid ${BRAIN_TYPE_COLORS[report.user.neuroProfile.brainType]}44` }}>
                    <span style={{ fontSize: 24, marginRight: 10 }}>{BRAIN_TYPE_ICONS[report.user.neuroProfile.brainType]}</span>
                    <span style={{ fontWeight: 700, color: BRAIN_TYPE_COLORS[report.user.neuroProfile.brainType], fontSize: 15 }}>
                      {BRAIN_TYPE_LABELS[report.user.neuroProfile.brainType] || report.user.neuroProfile.brainType} Beyin Tipi
                    </span>
                  </div>
                  {report.overallScore > 0 && (
                    <div style={{ padding: '12px 18px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>⚡</span>
                      <span style={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>Nöro Skoru: {report.overallScore}/100</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            {report.summary && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10, letterSpacing: 1 }}>ÖZET</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14 }}>{report.summary}</p>
              </div>
            )}

            {/* Sections */}
            {(report.sections || []).map((section, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: section.content ? 12 : 16 }}>
                  {section.icon} {section.title}
                </h3>
                {section.content && (
                  <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.8, marginBottom: 14 }}>{section.content}</p>
                )}
                {(section.recommendations || []).length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {section.recommendations.map((rec, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                        <span style={{ color: '#00d4ff', flexShrink: 0 }}>›</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* CTA */}
            <div style={{ textAlign: 'center', padding: '32px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16 }}>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 18 }}>
                Kendi nörolojik profilinizi keşfetmek ister misiniz?
              </p>
              <Link to="/register" style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', padding: '12px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                🧠 Ücretsiz Analiz Yap
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
