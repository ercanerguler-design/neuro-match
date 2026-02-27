import React, { useState } from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { reportAPI } from '../services/api';
import { generatePDF } from '../utils/generatePDF';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

const BRAIN_TYPE_ICONS = { analytical: '🔢', creative: '🎨', empathetic: '💙', strategic: '♟️' };

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(null);
  const [sharing, setSharing] = useState(null);
  const { t, lang } = useLanguage();

  const { data: reports, isLoading } = useQuery('reports', reportAPI.getReports, {
    select: (res) => res.data.data,
  });

  const handleShare = async (report) => {
    setSharing(report._id);
    try {
      const res = await reportAPI.shareReport(report._id);
      const url = res.data.shareUrl || `https://www.x-neu.com/shared-report/${res.data.shareToken}`;
      await navigator.clipboard.writeText(url);
      toast.success('🔗 Paylaşım bağlantısı kopyalandı!');
    } catch {
      toast.error('Bağlantı kopyalanamadı');
    } finally {
      setSharing(null);
    }
  };

  const handlePDF = (report) => {
    setDownloading(report._id);
    generatePDF(
      report,
      user,
      () => { toast.success('📄 PDF indirildi!'); setDownloading(null); },
      () => { toast.error('PDF oluşturulamadı'); setDownloading(null); }
    );
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
                    onClick={() => handleShare(report)}
                    disabled={sharing === report._id}
                    style={{
                      padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: sharing === report._id ? 'not-allowed' : 'pointer',
                      fontSize: 13, fontWeight: 600, opacity: sharing === report._id ? 0.6 : 1,
                    }}
                  >
                    {sharing === report._id ? '⏳ Hazırlanıyor...' : (lang === 'en' ? '🔗 Share Link' : '🔗 Bağlantı Kopyala')}
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
