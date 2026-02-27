import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { analysisAPI } from '../services/api';
import MainLayout from '../components/MainLayout';
import { useLanguage } from '../context/LanguageContext';

const QUESTIONS = [
  { id: 'q1', category: 'cognitive', text: 'Bir problemi çözerken ilk tepkiniz nedir?', options: ['Verileri toplar ve analiz ederim', 'Sezgimle hareket ederim', 'Farklı bakış açılarını düşünürüm', 'Hemen harekete geçerim'] },
  { id: 'q2', category: 'cognitive', text: 'Karar verirken en çok ne güvenirsiniz?', options: ['Mantık ve veriler', 'İçgüdüler ve duygular', 'Başkalarının görüşleri', 'Geçmiş deneyimler'] },
  { id: 'q3', category: 'cognitive', text: 'Yeni bir şey öğrenirken hangi yöntem size daha uygun?', options: ['Adım adım, sistematik', 'Denemek ve hata yapmak', 'Başkalarından gözlemleyerek', 'Büyük resmi görerek'] },
  { id: 'q4', category: 'cognitive', text: 'Bir proje planlarken ne yaparsınız?', options: ['Detaylı plan yaparım', 'Genel çerçeve koyarım', 'Esnek kalırım', 'Başkasıyla birlikte planlarım'] },
  { id: 'q5', category: 'cognitive', text: 'Hangi tür iş sizi en çok tatmin eder?', options: ['Problem çözme', 'Yaratıcı üretim', 'İnsan yardımı', 'Liderlik ve organizasyon'] },
  { id: 'q6', category: 'energy', text: 'Günün hangi saatinde en verimli hissediyorsunuz?', options: ['Sabah erken (6-10)', 'Öğleden sonra (12-16)', 'Akşam (18-22)', 'Gece geç (22+)'] },
  { id: 'q7', category: 'energy', text: 'Uyku düzeniniz nasıl?', options: ['Düzenli, erken yatan erken kalkan', 'Geç yatan geç kalkan', 'Değişken', 'Az uyku yeterli'] },
  { id: 'q8', category: 'energy', text: 'Uzun bir toplantıdan sonra nasıl hissediyorsunuz?', options: ['Bitkin ve yorgun', 'Enerjik ve motive', 'Nötr', 'Hayal kırıklığına uğramış'] },
  { id: 'q9', category: 'energy', text: 'Hafta sonu nasıl enerji toplarsınız?', options: ['Sessizce dinlenirim', 'Sosyal aktivitelerle', 'Yaratıcı hobilerle', 'Fiziksel egzersizle'] },
  { id: 'q10', category: 'energy', text: 'Stresli dönemde enerji seviyeniz nasıl değişir?', options: ['Düşer, kaçmak isterim', 'Artar, daha aktif olurum', 'Değişmez, sakin kalırım', 'Dalgalanır'] },
  { id: 'q11', category: 'social', text: 'Kalabalık bir partide ne yaparsınız?', options: ['Köşede birkaç kişiyle derin konuşma', 'Herkesle tanışıp konuşma', 'Ortamı gözlemleme', 'İlgi odağı olma'] },
  { id: 'q12', category: 'social', text: 'Çatışma durumunda tepkiniz nedir?', options: ['Geri çekilir, zamanla çözerim', 'Doğrudan yüzleşirim', 'Arabulucu olurum', 'Konuyu değiştiririm'] },
  { id: 'q13', category: 'social', text: 'Yeni bir gruba katıldığınızda ne yaparsınız?', options: ['Önce gözlemler, sonra katılırım', 'Hemen sosyalleşirim', 'Birini bulup sohbet ederim', 'Liderlik pozisyonu ararım'] },
  { id: 'q14', category: 'social', text: 'Size göre ideal çalışma ortamı nedir?', options: ['Sessiz, kendi başıma', 'Küçük ekip, yakın iletişim', 'Büyük açık ofis', 'Uzaktan, esnek'] },
  { id: 'q15', category: 'social', text: 'Başkalarının duygularına karşı hassasiyetiniz?', options: ['Çok yüksek, hemen fark ederim', 'Orta, çoğunu fark ederim', 'Düşük, mantığa odaklanırım', 'Sadece yakın olduklarımda'] },
  { id: 'q16', category: 'stress', text: 'Ani bir kriz durumunda ilk tepkiniz?', options: ['Paniklerim, donup kalırım', 'Hemen harekete geçerim', 'Yardım ararım', 'Sakinleşip analiz ederim'] },
  { id: 'q17', category: 'stress', text: 'Başarısızlık karşısında tepkiniz nedir?', options: ['Kendimi uzun süre yıparım', 'Ders çıkarıp devam ederim', 'Başkalarından destek isterim', 'Stratejimi değiştiririm'] },
  { id: 'q18', category: 'stress', text: 'Yoğun iş dönemlerinde ne yaparsınız?', options: ['Sosyal hayatımı tamamen keserim', 'Dengeyi korumaya çalışırım', 'Daha hızlı çalışırım', 'Önceliklendiririm'] },
  { id: 'q19', category: 'values', text: 'Sizi en çok ne motive eder?', options: ['Para ve güvenlik', 'İtibar ve başarı', 'İlişkiler ve aidiyet', 'Büyüme ve öğrenme'] },
  { id: 'q20', category: 'values', text: '10 yıl sonra nerede olmak istersiniz?', options: ['Güçlü finansal pozisyon', 'Alanda uzman/lider', 'Mutlu ve dengeli yaşam', 'Dünyayı değiştirmiş'] },
  { id: 'q21', category: 'values', text: 'En büyük korkularınızdan biri hangisi?', options: ['Başarısız olmak', 'Yalnız kalmak', 'Anlamsız bir hayat yaşamak', 'Kontrolü kaybetmek'] },
  { id: 'q22', category: 'values', text: 'İdeal lider nasıl olmalı?', options: ['Analitik ve stratejik', 'İlham verici ve vizyoner', 'Empatik ve destekleyici', 'Kararlı ve sonuç odaklı'] },
  { id: 'q23', category: 'career', text: 'Hangi tür görevleri seversiniz?', options: ['Kompleks problem çözme', 'Yaratıcı projeler', 'İnsan ilişkileri', 'Stratejik planlama'] },
  { id: 'q24', category: 'career', text: 'Takımda hangi rolü doğal alırsınız?', options: ['Analist/Uzman', 'İnovatör/Yaratıcı', 'Koordinatör/Arabulucu', 'Lider/Karar verici'] },
  { id: 'q25', category: 'career', text: 'Geri bildirim almak sizi nasıl etkiler?', options: ['Savunmaya geçerim', 'Heyecanlanırım', 'Memnun olurum', 'Nötr karşılarım'] },
];

const CATEGORY_ICONS = { cognitive: '🧠', energy: '⚡', social: '👥', stress: '😤', values: '🎯', career: '💼' };

export default function AnalysisPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const CATEGORY_LABELS = (t.analysis && t.analysis.categoryLabels) || { cognitive: 'Bilişsel', energy: 'Enerji', social: 'Sosyal', stress: 'Stres', values: 'Değerler', career: 'Kariyer' };

  const currentQ = QUESTIONS[currentIndex];
  const progress = (currentIndex / QUESTIONS.length) * 100;
  const answered = Object.keys(answers).length;

  const handleAnswer = (questionId, answer, category) => {
    const newAnswers = { ...answers, [questionId]: { questionId, category, answer } };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (answered < QUESTIONS.length) {
      toast.error((t.analysis && t.analysis.errorAnswerAll) || 'Lütfen tüm soruları cevaplayın');
      return;
    }
    setLoading(true);
    try {
      const answersArray = Object.values(answers);
      const res = await analysisAPI.submitQuestionnaire(answersArray);
      toast.success('🧠 Analiz başlatıldı! Sonuçlar hazırlanıyor...');
      navigate(`/results/${res.data.analysisId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analiz başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  if (!analysisStarted) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🧠</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>{(t.analysis && t.analysis.title) || 'Nörolojik Analiz'}</h1>
          <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, marginBottom: 48 }}>
            {(t.analysis && t.analysis.startDesc) || '25 soruluk bilimsel anket ile beyin tipinizi keşfedin.'}
            {' '}{lang === 'en' ? 'Average' : 'Ortalama'} <strong style={{ color: '#00d4ff' }}>{(t.analysis && t.analysis.startMinutes) || '10 dk'}</strong> {lang === 'en' ? 'minutes.' : 'sürer.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48 }}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{CATEGORY_ICONS[key]}</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{(t.analysis && t.analysis.willAnalyze) || 'Analiz edilecek'}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setAnalysisStarted(true)} className="btn btn-primary btn-lg" style={{ fontSize: 18, padding: '18px 56px' }}>
            {(t.analysis && t.analysis.startBtn) || '🚀 Analizi Başlat'}
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              {CATEGORY_ICONS[currentQ.category]} {CATEGORY_LABELS[currentQ.category]}
            </span>
            <span style={{ color: '#00d4ff', fontWeight: 600, fontSize: 14 }}>
              {currentIndex + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="card" style={{ marginBottom: 24, animation: 'fadeIn 0.4s ease' }} key={currentQ.id}>
          <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.5, marginBottom: 32 }}>
            {currentIndex + 1}. {currentQ.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQ.options.map((option, idx) => {
              const isSelected = answers[currentQ.id]?.answer === option;
              return (
                <button key={idx} onClick={() => handleAnswer(currentQ.id, option, currentQ.category)}
                  style={{
                    textAlign: 'left', padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 15, transition: 'all 0.2s',
                    background: isSelected ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: isSelected ? '2px solid #00d4ff' : '2px solid rgba(255,255,255,0.08)',
                    color: isSelected ? '#00d4ff' : '#fff',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}>
                  <span style={{ marginRight: 12, fontWeight: 700, color: '#64748b' }}>
                    {['A', 'B', 'C', 'D'][idx]}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="btn btn-secondary" disabled={currentIndex === 0}>
            {(t.analysis && t.analysis.navBack) || '← Geri'}
          </button>

          <span style={{ color: '#64748b', fontSize: 14 }}>{answered} {(t.analysis && t.analysis.answeredOf) || 'soru cevaplandı'}</span>

          {currentIndex === QUESTIONS.length - 1 ? (
            <button onClick={handleSubmit} className="btn btn-primary" disabled={loading || answered < QUESTIONS.length}>
              {loading ? <div className="loading-spinner" /> : ((t.analysis && t.analysis.navAnalyze) || '🧠 Analiz Et →')}
            </button>
          ) : (
            <button onClick={() => setCurrentIndex(Math.min(QUESTIONS.length - 1, currentIndex + 1))} className="btn btn-secondary">
              {(t.analysis && t.analysis.navNext) || 'İleri →'}
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
