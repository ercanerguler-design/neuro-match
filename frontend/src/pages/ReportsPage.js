import React from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { reportAPI } from '../services/api';
import MainLayout from '../components/MainLayout';

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery('reports', reportAPI.getReports, {
    select: (res) => res.data.data,
  });

  const handleShare = async (id) => {
    try {
      const res = await reportAPI.shareReport(id);
      await navigator.clipboard.writeText(res.data.shareUrl);
      toast.success('Paylaşım linki kopyalandı!');
    } catch {
      toast.error('Link kopyalanamadı');
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>📊 Raporlarım</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>Tüm nörolojik analizlerin ve raporlarım</p>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
        ) : reports?.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Henüz rapor yok</h2>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>İlk analizini tamamla ve raporunu oluştur.</p>
            <a href="/analysis" className="btn btn-primary">🧠 Analiz Başlat</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reports?.map((report) => (
              <div key={report._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16 }}>{report.title}</h3>
                    {report.isPremium && <span className="badge badge-warning">Premium</span>}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>{report.summary}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
                    <span>📅 {new Date(report.createdAt).toLocaleDateString('tr-TR')}</span>
                    <span>📥 {report.downloadCount} indirme</span>
                    {report.overallScore && <span>⚡ Skor: {report.overallScore}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleShare(report._id)} className="btn btn-secondary btn-sm">
                    🔗 Paylaş
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
