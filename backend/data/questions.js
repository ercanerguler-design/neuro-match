const NEURO_QUESTIONS = [
  // Analytical vs Creative
  { id: 'q1', category: 'cognitive', text: 'Bir problemi çözerken ilk tepkiniz nedir?', options: ['Verileri toplar ve analiz ederim', 'Sezgimle hareket ederim', 'Farklı bakış açılarını düşünürüm', 'Hemen harekete geçerim'], type: 'single' },
  { id: 'q2', category: 'cognitive', text: 'Karar verirken en çok ne güvenirsiniz?', options: ['Mantık ve veriler', 'İçgüdüler ve duygular', 'Başkalarının görüşleri', 'Geçmiş deneyimler'], type: 'single' },
  { id: 'q3', category: 'cognitive', text: 'Yeni bir şey öğrenirken hangi yöntem size daha uygun?', options: ['Adım adım, sistematik', 'Denemek ve hata yapmak', 'Başkalarından gözlemleyerek', 'Büyük resmi görerek'], type: 'single' },
  { id: 'q4', category: 'cognitive', text: 'Bir proje planlarken...', options: ['Detaylı plan yaparım', 'Genel çerçeve koyarım', 'Esnek kalırım', 'Başkasıyla birlikte planlarım'], type: 'single' },
  { id: 'q5', category: 'cognitive', text: 'Hangi tür iş sizi en çok tatmin eder?', options: ['Problem çözme', 'Yaratıcı üretim', 'İnsan yardımı', 'Liderlik ve organizasyon'], type: 'single' },

  // Energy & Rhythm
  { id: 'q6', category: 'energy', text: 'Günün hangi saatinde en verimli hissediyorsunuz?', options: ['Sabah erken (6-10)', 'Öğleden sonra (12-16)', 'Akşam (18-22)', 'Gece geç (22+)'], type: 'single' },
  { id: 'q7', category: 'energy', text: 'Uyku düzeniniz nasıl?', options: ['Düzenli, erken yatan erken kalkan', 'Geç yatan geç kalkan', 'Değişken', 'Az uyku yeterli'], type: 'single' },
  { id: 'q8', category: 'energy', text: 'Uzun bir toplantıdan sonra nasıl hissediyorsunuz?', options: ['Bitkin ve yorgun', 'Enerjik ve motive', 'Nötr', 'Hayal kırıklığına uğramış'], type: 'single' },
  { id: 'q9', category: 'energy', text: 'Hafta sonu nasıl enerji toplarsınız?', options: ['Sessizce dinlenirim', 'Sosyal aktivitelerle', 'Yaratıcı hobilerle', 'Fiziksel egzersizle'], type: 'single' },
  { id: 'q10', category: 'energy', text: "Stresli bir dönemde enerji seviyeniz...", options: ['Düşer, kaçmak isterim', 'Artar, daha aktif olurum', 'Değişmez, sakin kalırım', 'Dalgalanır'], type: 'single' },

  // Social Pattern
  { id: 'q11', category: 'social', text: 'Kalabalık bir partide ne yaparsınız?', options: ['Köşede birkaç kişiyle derin konuşma', 'Herkesle tanışıp konuşma', 'Ortamı gözlemleme', 'İlgi odağı olma'], type: 'single' },
  { id: 'q12', category: 'social', text: 'Çatışma durumunda tepkiniz?', options: ['Geri çekilir, zamanla çözerim', 'Doğrudan yüzleşirim', 'Arabulucu olurum', 'Konuyu değiştiririm'], type: 'single' },
  { id: 'q13', category: 'social', text: 'Yeni bir gruba katıldığınızda...', options: ['Önce gözlemler, sonra katılırım', 'Hemen sosyalleşirim', 'Birini bulup sohbet ederim', 'Liderlik pozisyonu ararım'], type: 'single' },
  { id: 'q14', category: 'social', text: 'Size göre ideal çalışma ortamı?', options: ['Sessiz, kendi başıma', 'Küçük ekip, yakın iletişim', 'Büyük açık ofis', 'Uzaktan, esnek'], type: 'single' },
  { id: 'q15', category: 'social', text: 'Başkalarının duygularına karşı hassasiyetiniz?', options: ['Çok yüksek, hemen fark ederim', 'Orta, çoğunu fark ederim', 'Düşük, mantığa odaklanırım', 'Sadece yakın olduklarımda'], type: 'single' },

  // Stress & Resilience
  { id: 'q16', category: 'stress', text: 'Ani bir kriz durumunda ilk tepkiniz?', options: ['Paniklerim, donup kalırım', 'Hemen harekete geçerim', 'Yardım ararım', 'Sakinleşip analiz ederim'], type: 'single' },
  { id: 'q17', category: 'stress', text: 'Başarısızlık karşısında tepkiniz?', options: ['Kendimi uzun süre yıparım', 'Ders çıkarıp devam ederim', 'Başkalarından destek isterim', 'Stratejimi değiştiririm'], type: 'single' },
  { id: 'q18', category: 'stress', text: 'Yoğun iş dönemlerinde...', options: ['Sosyal hayatımı tamamen keserim', 'Dengeyi korumaya çalışırım', 'Daha hızlı çalışırım', 'Önceliklendiririm'], type: 'single' },

  // Values & Motivation
  { id: 'q19', category: 'values', text: 'Sizi en çok ne motive eder?', options: ['Para ve güvenlik', 'İna ve başarı', 'İlişkiler ve aidiyet', 'Büyüme ve öğrenme'], type: 'single' },
  { id: 'q20', category: 'values', text: '10 yıl sonra nerede olmak istersiniz?', options: ['Güçlü finansal pozisyon', 'Alanda uzman/lider', 'Mutlu ve dengeli yaşam', 'Dünyayı değiştirmiş'], type: 'single' },
  { id: 'q21', category: 'values', text: 'En büyük korkularınızdan biri?', options: ['Başarısız olmak', 'Yalnız kalmak', 'Anlamsız bir hayat yaşamak', 'Kontrolü kaybetmek'], type: 'single' },
  { id: 'q22', category: 'values', text: 'İdeal lider nasıl olmalı?', options: ['Analitik ve stratejik', 'İlham verici ve vizyoner', 'Empatik ve destekleyici', 'Kararlı ve sonuç odaklı'], type: 'single' },

  // Career
  { id: 'q23', category: 'career', text: 'Hangi tür görevleri seversiniz?', options: ['Kompleks problem çözme', 'Yaratıcı projeler', 'İnsan ilişkileri', 'Stratejik planlama'], type: 'single' },
  { id: 'q24', category: 'career', text: 'Takımda hangi rolü doğal alırsınız?', options: ['Analist/Uzman', 'İnovatör/Yaratıcı', 'Koordinatör/Arabulucu', 'Lider/Karar verici'], type: 'single' },
  { id: 'q25', category: 'career', text: 'Geri bildirim almak sizi nasıl etkiler?', options: ['Savunmaya geçerim', 'Heyecanlanırım', 'Memnun olurum', 'Nötr karşılarım'], type: 'single' },
];

module.exports = NEURO_QUESTIONS;
