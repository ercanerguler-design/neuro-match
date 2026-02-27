import React, { useState } from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { reportAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

const BRAIN_TYPE_ICONS = { analytical: '🔢', creative: '🎨', empathetic: '💙', strategic: '♟️' };
const BRAIN_TYPE_LABELS = { analytical: 'Analitik', creative: 'Yaratıcı', empathetic: 'Empatik', strategic: 'Stratejik' };

function generatePDF(report, user) {
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    doc.setFillColor(10, 10, 26);
    doc.rect(0, 0, W, 297, 'F');
    doc.setFillColor(0, 212, 255);
    doc.rect(0, 0, W, 2, 'F');

    y = 22;
    doc.setTextColor(0, 212, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('X-Neu', W / 2, y, { align: 'center' });

    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Nörolojik Profil Raporu', W / 2, y, { align: 'center' });

    y += 8;
    doc.setDrawColor(50, 50, 80);
    doc.setLineWidth(0.3);
    doc.line(20, y, W - 20, y);

    y += 12;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || 'Kullanıcı', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(report.title, 20, y);
    doc.text(new Date(report.createdAt).toLocaleDateString('tr-TR'), W - 20, y, { align: 'right' });

    y += 14;
    doc.setFillColor(20, 20, 46);
    doc.roundedRect(20, y, W - 40, 28, 4, 4, 'F');
    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.4);
    doc.roundedRect(20, y, W - 40, 28, 4, 4, 'S');
    const bt = user?.neuroProfile?.brainType || 'analytical';
    doc.setFontSize(13);
    doc.setTextColor(0, 212, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`Beyin Tipi: ${BRAIN_TYPE_LABELS[bt] || bt}`, 30, y + 11);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`Nöro Skoru: ${report.overallScore || '—'}/100`, 30, y + 21);
    if (report.overallScore) {
      const bx = 110, bw = 70, pct = (report.overallScore / 100) * bw;
      doc.setFillColor(30, 30, 60);
      doc.roundedRect(bx, y + 17, bw, 5, 2, 2, 'F');
      doc.setFillColor(0, 212, 255);
      doc.roundedRect(bx, y + 17, pct, 5, 2, 2, 'F');
    }
    y += 38;

    if (report.summary) {
      const lines = doc.splitTextToSize(report.summary, W - 48);
      doc.setFillColor(16, 16, 40);
      doc.roundedRect(20, y, W - 40, 10 + lines.length * 5.5, 3, 3, 'F');
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, 28, y + 8);
      y += 16 + lines.length * 5.5;
    }

    (report.sections || []).forEach((section) => {
      if (y > 255) {
        doc.addPage();
        doc.setFillColor(10, 10, 26);
        doc.rect(0, 0, W, 297, 'F');
        y = 20;
      }
      y += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(124, 58, 237);
      doc.text(`${section.icon || '•'} ${section.title}`, 20, y);
      y += 6;
      if (section.content) {
        const ls = doc.splitTextToSize(section.content, W - 44);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(ls, 24, y);
        y += ls.length * 5 + 4;
      }
      (section.recommendations || []).slice(0, 4).forEach((rec) => {
        const rs = doc.splitTextToSize(`→  ${rec}`, W - 52);
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(rs, 26, y);
        y += rs.length * 4.5 + 2;
      });
    });

    doc.setDrawColor(50, 50, 80);
    doc.setLineWidth(0.3);
    doc.line(20, 285, W - 20, 285);
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2026 X-Neu · SCE INNOVATION LTD. ŞTİ. · x-neu.com', W / 2, 291, { align: 'center' });
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 295, W, 2, 'F');

    doc.save(`x-neu-rapor-${Date.now()}.pdf`);
    toast.success('📄 PDF rapor indirildi!');
  }).catch(() => toast.error('PDF oluşturulamadı'));
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(null);
  const { t, lang } = useLanguage();
  const BRAIN_TYPE_LABELS = (t.match && t.match.brainLabels) || { analytical: 'Analitik', creative: 'Yaratıcı', empathetic: 'Empatik', strategic: 'Stratejik' };

  const { data: reports, isLoading } = useQuery('reports', reportAPI.getReports, {
    select: (res) => res.data.data,
  });

  const handleShare = async (id) => {
    try {
      const res = await reportAPI.shareReport(id);
      await navigator.clipboard.writeText(res.data.shareUrl);
      toast.success((t.reports && t.reports.linkCopied) || 'Paylaşım linki kopyalandı!');
    } catch {
      toast.error((t.reports && t.reports.copyFailed) || 'Link kopyalanamadı');
    }
  };

  const handlePDF = (report) => {
    setDownloading(report._id);
    generatePDF(report, user);
    setTimeout(() => setDownloading(null), 2000);
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>📊 {(t.reports && t.reports.title) || 'Raporlarım'}</h1>
            <p style={{ color: '#94a3b8' }}>{(t.reports && t.reports.subtitleFull) || 'Tüm nörolojik analizlerin — PDF olarak indirilebilir'}</p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
          </div>
        ) : !reports?.length ? (
          <div className="card" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{lang === 'en' ? 'No reports yet' : 'Henüz rapor yok'}</h2>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>{(t.reports && t.reports.startAnalysis) || 'İlk analizini tamamla ve raporunu oluştur.'}</p>
            <a href="/analysis" className="btn btn-primary">🧠 {lang === 'en' ? 'Start Analysis' : 'Analiz Başlat'}</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reports.map((report) => (
              <div key={report._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 22 }}>{BRAIN_TYPE_ICONS[user?.neuroProfile?.brainType] || '📊'}</span>
                    <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{report.title}</h3>
                    {report.isPremium && <span className="badge badge-warning">Premium</span>}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>
                    {(report.summary || '').slice(0, 150)}{(report.summary || '').length > 150 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', flexWrap: 'wrap' }}>
                    <span>📅 {new Date(report.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR')}</span>
                    <span>📮 {report.downloadCount || 0} {(t.reports && t.reports.downloads) || 'indirme'}</span>
                    {report.overallScore && (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>⚡ {report.overallScore}/100</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePDF(report)}
                    disabled={downloading === report._id}
                    style={{
                      padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(0,212,255,0.35)',
                      background: 'rgba(0,212,255,0.08)', color: '#00d4ff', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                      opacity: downloading === report._id ? 0.6 : 1, transition: 'opacity 0.2s',
                    }}
                  >
                    {downloading === report._id
                      ? <><div className="loading-spinner" style={{ width: 12, height: 12 }} /> {(t.reports && t.reports.preparing) || 'Hazırlanıyor...'}</>
                      : (t.reports && t.reports.downloadPDF) || '📄 PDF İndir'
                    }
                  </button>
                  <button
                    onClick={() => handleShare(report._id)}
                    style={{
                      padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    🔗 {lang === 'en' ? 'Share' : 'Paylaş'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
