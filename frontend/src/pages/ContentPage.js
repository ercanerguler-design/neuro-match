import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import useAuthStore from '../store/authStore';

const CONTENT_LIBRARY = {
  analytical: [
    { id: 1, type: 'article', emoji: '📐', title: 'Karar Almada Veri Bilimini Kullanmak', desc: 'Analitik beyin tipleri için kanıta dayalı karar alma teknikleri.', tag: 'Verimlilik', read: '8 dk', color: '#00d4ff' },
    { id: 2, type: 'video', emoji: '🎥', title: 'Sistem Düşünme ile Problem Çözme', desc: 'Karmaşık problemleri parçalara ayırma ve yapısal çözüm üretme.', tag: 'Düşünce', read: '14 dk', color: '#00d4ff' },
    { id: 3, type: 'book', emoji: '📚', title: '"Thinking in Systems" — Özet', desc: 'Donella Meadows\'ın sistem düşünce kitabının ana fikirleri.', tag: 'Kitap', read: '12 dk', color: '#00d4ff' },
    { id: 4, type: 'tool', emoji: '🔧', title: 'Notion ile Veri Tabanlı Karar Süreci', desc: 'Kararlarınızı Notion kanalıyla belgelemenin en etkili yolu.', tag: 'Araç', read: '5 dk', color: '#00d4ff' },
    { id: 5, type: 'article', emoji: '🧮', title: 'Analitik Beyin Tipi ve Liderlik', desc: 'Sistem odaklı düşüncenin takım dinamiklerine etkisi.', tag: 'Liderlik', read: '10 dk', color: '#00d4ff' },
    { id: 6, type: 'exercise', emoji: '⚡', title: 'Günlük: 5 Dakika Kritik Analiz', desc: 'Düzenli analitik düşünce egzersizi ile zihinsel netlik.', tag: 'Egzersiz', read: '5 dk', color: '#00d4ff' },
  ],
  creative: [
    { id: 7, type: 'article', emoji: '🎨', title: 'Yaratıcı Akışa Girmek: Bilim Ne Diyor?', desc: 'Nörobilim açısından "flow" hali ve yaratıcı beyin.', tag: 'Yaratıcılık', read: '9 dk', color: '#7c3aed' },
    { id: 8, type: 'video', emoji: '🎥', title: 'Lateral Düşünce Teknikleri — De Bono', desc: 'Edward de Bono\'nun yanal düşünce metotlarının özeti.', tag: 'İnovasyon', read: '11 dk', color: '#7c3aed' },
    { id: 9, type: 'tool', emoji: '🔧', title: 'Figma ile Hızlı Prototipleme', desc: 'Yaratıcı fikirleri 30 dakikada görsel prototipe dönüştür.', tag: 'Araç', read: '6 dk', color: '#7c3aed' },
    { id: 10, type: 'exercise', emoji: '✏️', title: 'Morning Pages: Günlük Yazma Rutini', desc: 'Julia Cameron\'ın ünlü tekniği ile yaratıcı bloğu aş.', tag: 'Egzersiz', read: '4 dk', color: '#7c3aed' },
    { id: 11, type: 'book', emoji: '📚', title: '"Big Magic" — Elizabeth Gilbert Özeti', desc: 'Yaratıcı yaşam üzerine en ilham verici kitabın özeti.', tag: 'Kitap', read: '10 dk', color: '#7c3aed' },
    { id: 12, type: 'article', emoji: '🌈', title: 'Yaratıcı Tükenmişliği Önlemek', desc: 'Sürdürülebilir yaratıcılık için 7 pratik strateji.', tag: 'Sağlık', read: '7 dk', color: '#7c3aed' },
  ],
  empathetic: [
    { id: 13, type: 'article', emoji: '💙', title: 'Derin Dinleme: Empatinin Süpergücü', desc: 'Aktif dinleme ile ilişkileri ve liderliği güçlendirme.', tag: 'İlişkiler', read: '8 dk', color: '#10b981' },
    { id: 14, type: 'video', emoji: '🎥', title: 'Brené Brown: Savunmasızlık Üzerine', desc: 'Empati ve duygusal zeka üzerine TED konuşmasının özeti.', tag: 'Duygusal Zeka', read: '13 dk', color: '#10b981' },
    { id: 15, type: 'exercise', emoji: '🧘', title: 'Günlük Empati Meditasyonu', desc: 'Bağlantı ve şefkat duygusunu güçlendiren 10 dakikalık pratik.', tag: 'Meditasyon', read: '10 dk', color: '#10b981' },
    { id: 16, type: 'tool', emoji: '🗣️', title: 'Nonviolent Communication (NVC) Rehberi', desc: 'Marshall Rosenberg\'in şiddet içermeyen iletişim modelini uygula.', tag: 'İletişim', read: '7 dk', color: '#10b981' },
    { id: 17, type: 'book', emoji: '📚', title: '"Empathy" — Roman Krznaric Özeti', desc: 'Empatinin bireysel ve toplumsal güce dönüştürülmesi.', tag: 'Kitap', read: '9 dk', color: '#10b981' },
    { id: 18, type: 'article', emoji: '💚', title: 'Empatik Liderler Neden Daha Başarılı?', desc: 'Fortune 500 araştırmalarından empatik liderlik verileri.', tag: 'Liderlik', read: '6 dk', color: '#10b981' },
  ],
  strategic: [
    { id: 19, type: 'article', emoji: '♟️', title: 'İkinci Düzen Düşünce: Stratejik Üstünlük', desc: 'Olayların sonuçlarının sonuçlarını görmek ile rekabet avantajı.', tag: 'Strateji', read: '10 dk', color: '#f59e0b' },
    { id: 20, type: 'video', emoji: '🎥', title: 'Ray Dalio\'nun Prensipleri — Özet', desc: 'Dünyanın en büyük hedge fonu kurucusunun sistem yaklaşımı.', tag: 'Finans', read: '15 dk', color: '#f59e0b' },
    { id: 21, type: 'book', emoji: '📚', title: '"Good Strategy Bad Strategy" — Özet', desc: 'Richard Rumelt\'in gerçek strateji ile sahte strateji ayrımı.', tag: 'Kitap', read: '11 dk', color: '#f59e0b' },
    { id: 22, type: 'tool', emoji: '🔧', title: 'OKR ile Stratejik Hedef Belirleme', desc: 'Google ve Intel\'in kullandığı hedef yönetim sistemini kur.', tag: 'Araç', read: '8 dk', color: '#f59e0b' },
    { id: 23, type: 'exercise', emoji: '🎯', title: 'Haftalık Stratejik İnceleme Rutini', desc: '30 dakikalık haftalık review ile uzun vadeli görünürlük.', tag: 'Verimlilik', read: '5 dk', color: '#f59e0b' },
    { id: 24, type: 'article', emoji: '🏆', title: 'Stratejik Beyin Tipi ve Girişimcilik', desc: 'Başarılı girişimcilerin %67\'si stratejik beyin tipine sahip.', tag: 'Girişimcilik', read: '9 dk', color: '#f59e0b' },
  ],
};

const TYPE_ICONS = { article: '📄', video: '🎬', book: '📖', tool: '🛠️', exercise: '⚡' };

const CONTENT_BODIES = {
  1: `Analitik düşünürler veriye dayalı karar almada doğal bir üstünlüğe sahiptir.\n\n**Veri Toplama Aşaması**\nKarar almadan önce şu soruları yanıtlayın: Hangi veriyi topluyorum? Bu veri güvenilir mi? Yeterince temsil edici mi?\n\n**Karar Matrisi Yöntemi**\n1. Kriterleri listele (maliyet, etki, süre, risk)\n2. Her kritere ağırlık puanı ver (toplam 100)\n3. Her seçeneği her kritere göre puan (1-10)\n4. Ağırlıklı toplamları hesapla\n5. En yüksek skor = veri destekli karar\n\n**Önemli Not**\nEğer sezginin hesap sonucuyla örtüşmüyorsa — bu değerli veri. Hangi varsayımını sorgulamalısın?`,
  2: `Sistem düşünme; olayları tek tek değil, birbirleriyle etkileşen parçalar bütünü olarak görme becerisidir.\n\n**Temel Kavramlar**\n- Döngüsel nedensellik: A, B'yi etkiler — B de A'yı etkiler\n- Gecikmeli geri bildirim: Değişimlerin etkisi hemen görülmez\n- Kaldıraç noktaları: Küçük müdahale büyük etki yaratır\n\n**Uygulamalı Örnek**\nBir projede gecikmeler artıyorsa tepki "daha çok çalış" olur. Sistem düşünürü ise gecikmenin nedenini haritalandırır: eksik tanım mı, bağımlılık mı, iletişim kopukluğu mu?\n\n**Pratik Araç: Causal Loop Diagram**\nKağıt üzerinde değişkenleri yaz. Oklar çiz: etkiler aynı yönde mi (pozitif) ters yönde mi (negatif)? Döngüleri bul ve kaldıraç noktasına müdahale et.`,
  3: `Donella Meadows'ın bu klasik kitabı, karmaşık dünyayı anlamanın en etkili araçlarından birini sunar.\n\n**Ana Fikirler**\n1. Her sistem stok (birikim), akış (değişim hızı) ve geri bildirimden oluşur\n2. Sistemler kendi amaçlarına göre davranır — sizin amacınıza göre değil\n3. En etkili müdahale noktaları çoğunlukla sezgiye aykırıdır\n\n**Pratik Çıkarımlar**\n- Bir sorunu çözmek için önce sistemin amacını anla\n- Gecikmeleri sabırla yönet, hızla çözülmez\n- "Daha fazla baskı" genellikle sistemi kırılgan kılar\n\n**Kitaptan Alıntı**\n"Sistemleri anlamak, dünyanın neden beklentilerimize uymadığını ve değişim için nerede durduğumuzu anlamamızı sağlar."`,
  4: `Notion'ı basit bir not aracı olarak değil, karar yönetim sistemi olarak kullanabilirsiniz.\n\n**Kurulum Adımları**\n1. "Kararlar" adında yeni bir Database oluştur\n2. Şu kolonları ekle: Karar, Tarih, Seçenekler, Seçilen, Beklenti, Gerçek Sonuç\n3. Her önemli kararı kaydet\n\n**Örnek Kayıt**\n- Karar: Yeni pazarlama ajansı seçimi\n- Seçenekler: A (ucuz, tecrübesiz) / B (pahalı, deneyimli)\n- Kriter: ROI beklentisi, referans geçmişi, iletişim kalitesi\n- Seçilen: B — çünkü?\n- 3 ay sonra: Beklenti gerçekleşti mi?\n\n**Faydası**\nBu sistem sayesinde kararlarının kalitesini zamanla ölçebilir ve örüntüleri fark edebilirsin.`,
  5: `Analitik liderler güçlü yönlerini tam anlamıyla kullandıklarında takımlarını üstün performansa taşıyabilirler.\n\n**Güçlü Yönler**\n- Verilere dayalı net hedefler koyma\n- Süreçleri sistematik optimize etme\n- Risk analizinde derinlik ve öngörü\n\n**Dikkat Edilmesi Gereken**\nAnalitik liderler bazen "yeterince veri" beklerken karar gecikmesi yaşatabilirler. Çözüm: "Yeterli veri" eşiğini önceden tanımlamak ve o noktada harekete geçmek.\n\n**Ekip Dengesi**\nAnalitik lider + yaratıcı düşünür + empatik koordinatör üçgeni en güçlü takım yapısını oluşturur. Kendi beyin tipini tamamlayan insanlarla çalışmaktan çekinme.`,
  6: `Her sabah 5 dakika ile analitik zihninizi keskinleştirin.\n\n**Sabah Rutini (5 dk)**\n1. Bugün karşılaşabileceğim en karmaşık karar nedir?\n2. Bu kararı etkileyen 3 faktörü yaz\n3. Her faktör için 1 ölçülebilir gösterge belirle\n4. Varsayımlarını listele\n5. Hangi varsayım en çok risk taşıyor?\n\n**Akşam Değerlendirmesi (3 dk)**\n- Öngörülerim ne kadar doğruydu?\n- Hangi veriyi gözden kaçırdım?\n- Yarın farklı ne yapacağım?\n\n**Tavsiye**: Bu rutini bir deftere yaz — 30 gün sonra kendi örüntülerini göreceksin.`,
  7: `Mihaly Csikszentmihalyi'nin "flow" teorisi artık nörobilim tarafından da destekleniyor.\n\n**Flow Nedir?**\nFlow, zorluğun beceriyle tam dengelendiği, zamanın eridiği ve odağın maksimuma ulaştığı zihinsel durumdur.\n\n**Beyinde Ne Olur?**\n- Prefrontal korteks kısmen devre dışı kalır (az öz-eleştiri)\n- Dopamin ve norepinefrin salgılanır (odak + motivasyon)\n- Varsayılan Mod Ağı aktive olur (bağlantı kurma)\n\n**Flow'a Girmek İçin**\n1. Görevi net tanımla — belirsizlik flow'u engeller\n2. Bildirimleri kapat, minimum 90 dakika blokla\n3. Yeterince zor ama imkânsız olmayan bir hedef seç\n4. Fiziksel ritüel oluştur (aynı müzik, aynı mekan)\n\n**Uyarı**: Yorgunken flow zorlaşır. En yaratıcı saatlerini bul ve koru.`,
  8: `Edward de Bono, 1967'de "lateral thinking" kavramını icat etti. Dikey düşünce yerine yanal düşünce yaratıcılığın temelidir.\n\n**6 Şapka Tekniği**\n- ⚪ Beyaz: Saf veriler ve bilgi\n- 🔴 Kırmızı: Duygular ve sezgiler\n- ⚫ Siyah: Riskler ve sorunlar\n- 🟡 Sarı: Fırsatlar ve avantajlar\n- 🟢 Yeşil: Yaratıcı ve alternatif fikirler\n- 🔵 Mavi: Süreç yönetimi ve özet\n\n**Provokasyon Tekniği (PO)**\nMantıksız bir önerme yap, sonra ondan gerçekçi fikir üret.\nÖrnek: "PO: Araçlar geriye gider" → ters yön şeridi fikri doğdu.\n\n**Random Entry**\nSözlükten rastgele bir kelime seç ve çözmek istediğin problemle ilişkilendir.`,
  9: `Figma ile fikri somutlaştırmanın en hızlı yolu Crazy 8s metodudur.\n\n**Crazy 8s Nasıl Yapılır?**\n1. A4 kağıdı 8 eşit parçaya böl\n2. Her bölüm için 1 dakika — 8 farklı tasarım/fikir çiz\n3. En güçlü 1-2'yi seç\n4. Figma'da wireframe olarak oluştur\n5. Tıklanabilir prototip bağlantılarını kur (Prototype sekmesi)\n\n**Temel Figma Kısayolları**\n- F: Frame oluştur\n- R: Dikdörtgen\n- T: Metin ekle\n- Ctrl+D: Kopyala-yapıştır\n- Ctrl+G: Seçili öğeleri grupla\n\n**Temel Prensip**: "Mükemmel değil, hızlı ve test edilebilir" mantığıyla ilerle.`,
  10: `"The Artist's Way" kitabından gelen Morning Pages, yaratıcılık bloğunu kıran en güçlü araçlardan biridir.\n\n**Nasıl Yapılır?**\n1. Her sabah uyandıktan hemen sonra (telefona bakmadan)\n2. El yazısıyla 3 A4 sayfa yaz\n3. Konu yok — aklına ne gelirse\n4. Kimse okumayacak, sen de okumamalısın\n\n**Neden İşe Yarıyor?**\nZihindeki "iç eleştirmen" sabahın erken saatlerinde en uykulu ve en sessizdir. Yazmak onu devre dışı bırakır ve yaratıcı potansiyel serbest kalır.\n\n**İlk 2 Hafta Normaldir**\n"Yazacak bir şeyim yok" hissedeceksin. Tam olarak onu yaz: "Yazacak bir şeyim yok, yazacak bir şeyim yok..." Devam et.`,
  11: `Elizabeth Gilbert, "Eat Pray Love"ın yazarı. Big Magic'te yaratıcılığı farklı bir gözle ele alıyor.\n\n**Ana Mesaj**\nYaratıcı fikirler gezgin varlıklardır — eğer sen onları sahiplenmezsen başkasını bulurlar.\n\n**Korku ile Yaratıcılık**\nKorku her zaman orada olacak. Ama sürücü koltuğuna oturmasına izin verme. "Korkuyu arabaya al ama direksiyona geçme" metaforu.\n\n**İzin Almadan Yarat**\n- Maestro olmadan çal\n- Usta olmadan yaz\n- Uzman olmadan tasarım yap\n\n**Merak vs Tutku**\nGilbert, "tutkunu takip et" baskısının insanları felç ettiğini söylüyor. Bunun yerine: sadece merakını takip et — nereye götürürse.`,
  12: `Yaratıcı tükenmişlik (creative burnout), üretkenliği değil sürdürülebilirliği hedeflemenin sonucudur.\n\n**7 Strateji**\n1. Girdi-çıktı dengesi: Tükettikten sonra bir şey yarat, üretmeden önce kendini besle\n2. Projeleri tamamla — yarım kalmış işler sürekli zihinsel yük yaratır\n3. "Yaratıcı randevular" koy — haftada 2 saat yalnızca sana ait\n4. Farklı bir disiplinle oyna — dansçıysan resim yap\n5. Doğada yürü — default mode network'ü aktive eder ve bağlantı kurar\n6. Dijital detoks günleri belirle\n7. Başarısızlığı veriye dönüştür: "işe yaramadı" değil "bu bağlamda işe yaramadı"`,
  13: `Gerçek dinleme, cevabını hazırlarken beklemek değildir. Tam dikkatle karşındakinde olmaktır.\n\n**4 Düzey Dinleme**\n1. İndirilen: Zaten bildiklerini onaylayan şeyleri duyarsın\n2. Olgusal: Yeni bilgilere dikkat edersin\n3. Empatik: Karşındakinin bakış açısını hissedersin\n4. Üretici: Geleceğin olasılıklarını birlikte hissedersin\n\n**Pratik Teknikler**\n- Telefonu ters çevir veya cebine koy\n- Cevap vermeden önce 3 saniye bekle\n- "Seni doğru anladım mı: ..." diye özetle\n- Yargılamadan sor: "Bunu nasıl hissettirdi?"\n\n**Liderlikte Etkisi**\nDerin dinleyen liderler takımdaki sorunları en erken fark edenlerdir.`,
  14: `Brené Brown'ın "The Power of Vulnerability" konuşması 60 milyondan fazla kez izlendi.\n\n**Ana Mesaj**\nSavunmasızlık zayıflık değil, en cesur eylemdir. Gerçek bağlantı ancak sahici savunmasızlıkla kurulur.\n\n**Utanç vs Suçluluk**\n- Utanç: "Ben kötüyüm" — kimliğe saldırı\n- Suçluluk: "Kötü bir şey yaptım" — davranış odaklı\nSağlıklı ilişkiler suçlulukla çalışır, utançla değil.\n\n**Wholeheartedness (Tam Kalbililik)**\nBrown'ın araştırdığı kavram: sevgi ve aidiyet için layık olduğuna inanan insanların ortak özellikleri cesaret, şefkat ve bağlantıdır.\n\n**Günlük Uygulama**: Bugün birine "bilmiyorum" veya "yanılmışım" demeyi dene. Bu en cesur iki cümledir.`,
  15: `Metta meditasyonu (loving-kindness), empati bölgelerini aktive ettiği bilimsel çalışmalarla gösterilmiş bir pratiktir.\n\n**10 Dakikalık Pratik**\n1. Rahat otur, gözleri kapat — 2 dk nefes farkındalığı\n2. Kendine yönel: "Mutlu olasın, huzurlu olasın, sağlıklı olasın" (2 dk)\n3. Sevdiğin birine: Aynı cümleleri onun için hisset (2 dk)\n4. Nötr biri için: Bugün tesadüfen karşılaştığın biri (2 dk)\n5. Zor biri için: Sana zorluk çıkaran biri — en zor ama en güçlü adım (2 dk)\n\n**Bilimsel Arka Plan**\nDüzenli metta pratiği; empati kapasitesini artırır, yargılamayı azaltır, sosyal bağlantı hissini güçlendirir.`,
  16: `NVC (Nonviolent Communication), çatışmayı azaltan ve bağlantıyı derinleştiren bir iletişim modelidir.\n\n**4 Adım Modeli**\n1. Gözlem: Yorumsuz, somut gözlem — "Toplantıda söz almadın"\n2. Duygu: Bu bende ne hissettirdi — "Endişelendim"\n3. İhtiyaç: Altındaki temel ihtiyaç — "Ekip uyumuna önem veriyorum"\n4. Rica: Somut, yapılabilir — "Bir dahaki toplantıda fikirlerini paylaşır mısın?"\n\n**Sıkça Yapılan Hata**\nGözlem yerine değerlendirme:\n- Gözlem: "Toplantıda söz almadın"\n- Değerlendirme: "Her zaman çekilgen davranıyorsun"\n\n**Bugün Dene**: Bir şikayetini NVC formatına çevir.`,
  17: `Roman Krznaric'in kitabı empatiyi soyut kavramdan pratik beceriye dönüştürüyor.\n\n**6 Empati Alışkanlığı**\n1. Farklılıkları merak et — yargılama, anlamaya çalış\n2. Yüksek sesli hayal gücü — karşındakinin geçmişini, korkularını, hayallerini düşün\n3. Çok sayıda hayat dene — farklı kitaplar oku, yabancı kültürlere aç ol\n4. Sanat ve edebiyat: Empati kasını zorlayan en etkili araç\n5. Zor koşulları deneyimle: Dezavantajlıların bakışından gerçekliği görmeye çalış\n6. Yüz yüze sohbetin gücü — sosyal medyada gerçek empati kurulmaz\n\n**Önemli Ayrım**\nEmpati sempati değildir. Sempati "senin için üzüldüm", empati "seninle hissediyorum."`,
  18: `Businessolver'ın araştırması: Çalışanların %96'sı empatik işverenin önemli olduğunu söylüyor, yalnızca %50'si patronlarının gerçekten empatik olduğunu düşünüyor.\n\n**Araştırma Verileri**\n- Empatik liderli şirketlerde çalışan bağlılığı %40 daha yüksek\n- İşten ayrılma oranı %30 daha düşük\n- İnovasyon ve problem çözme skorları anlamlı biçimde daha iyi\n\n**Empati ≠ Zaaf**\nEn büyük yanlış anlama: empati = her şeye evet demek. Gerçek empatik lider net sınırlar çizer ama bu sınırları açıklar.\n\n**3 Pratik Davranış**\n1. Bire bir toplantılarda ilk cümle: "Nasılsın — gerçekten?"\n2. Geri bildirimi davranış odaklı ver, kişilik odaklı değil\n3. Takımının motivasyonunu düzenli ve bireysel sor`,
  19: `Howard Marks'ın "second-level thinking" kavramı: Herkesin gördüğünü değil, herkesin görmediğini görme.\n\n**Birinci Düzen vs İkinci Düzen**\n- 1. düzen: "Bu şirket iyi, satın al"\n- 2. düzen: "Bu şirket iyi, ama herkes bunu biliyor. Fiyat çoktan yansımış mı?"\n\n**3 Temel Soru**\n1. Büyük çoğunluk ne düşünüyor?\n2. Ben ne düşünüyorum ve neden farklı?\n3. Eğer haklıysam, rakip veya piyasa neyi kaçırmış?\n\n**Kullanım Alanları**\n- Yatırım kararları\n- İşe alım — diğerlerinin gözden kaçırdığı adaylar\n- Ürün stratejisi — doymuş pazarda doyurulmayan niş\n\n**Pratik**: Bir sonraki önemli kararında ilk adım olarak "herkes ne düşünüyor?" sorusunu sor.`,
  20: `Ray Dalio, Bridgewater Associates'i yazdığı "Principles" ile yönetiyor. Her karar önceden belirlenmiş kurallara göre alınıyor.\n\n**Ana Fikirler**\n1. Gerçeklikle yüzleş — ağrılı gerçeği geciktirme, erkenden gör\n2. Radikal şeffaflık — her toplantı kayıt altına alınır, herkes görür\n3. Hataları sistemleştir: "Bu hata hangi sistemik zayıflıktan kaynaklandı?"\n\n**5 Adımlı Süreç**\n1. Net hedef koy\n2. Problemi tespit et\n3. Kök nedeni bul\n4. Plan yap\n5. Uygula ve gözlemle\n\n**Büyük Hata Döngüsü**\n"Hata → Acı → Yansıtma → Gelişim" — Dalio: "Acı + Yansıtma = İlerleme"`,
  21: `Richard Rumelt, dünya stratejistlerin stratejisti olarak biliniyor. Bu kitap "iyi strateji" için en net rehber.\n\n**Kötü Strateji Nedir?**\n- Hedefler listesi (strateji değil)\n- Vizyon bildirisi (strateji değil)\n- Finansal hedefler (strateji değil)\n- "Müşteri odaklı olacağız" (strateji değil)\n\n**İyi Stratejinin 3 Parçası (Kernel)**\n1. Teşhis: Durumu doğru anla — "Asıl sorun nedir?"\n2. Yönlendiren politika: Bu teşhise nasıl yaklaşacaksın?\n3. Tutarlı eylemler: Politikayı destekleyen somut adımlar\n\n**Örnek: Apple 1997**\n- Teşhis: Çok geniş ürün yelpazesi, odak kaybı\n- Politika: Radikal sadeleşme\n- Eylemler: 300 üründen 10'a inmek`,
  22: `OKR (Objectives & Key Results), Andy Grove'un Intel'de geliştirdiği, Google'ın büyümesini hızlandıran hedef sistemidir.\n\n**Yapı**\n- Objective: İlham verici, niteliksel hedef\n- Key Result: Ölçülebilir, zamanlı, doğruluğu test edilebilir\n\n**Örnek**\nObjective: Müşteri deneyimini sektörün en iyisi yap\n- KR1: NPS'i 42'den 65'e çıkar (Q2 sonuna kadar)\n- KR2: Destek çözüm süresini 48 saatten 12 saate indir\n- KR3: Müşteri kayıp oranını %8'den %4'e düşür\n\n**Kritik Kurallar**\n- 3-5 OKR yeterli — aşırı OKR odağı dağıtır\n- %70 başarı = iyi bir OKR (100% = hedef çok kolaydi)\n- OKR'ı bireysel performans değerlendirmesiyle bağlama`,
  23: `Her Cuma veya Pazartesi 30 dakika. Bu rutin uzun vadeli strateji ile günlük aksiyonları bağlar.\n\n**Haftalık Review Soruları**\n1. Bu hafta gerçekten ne başardım?\n2. Stratejik hedeflerime ne kadar yaklaştım?\n3. Neyi erteledim ve gerçek neden ne?\n4. Önümüzdeki hafta en yüksek etkili 3 aksiyon nedir?\n5. Kayması gereken bir proje var mı?\n\n**Önerilen Araçlar**\n- Notion veya Obsidian — haftalık şablon\n- OKR tracker\n- "Not-To-Do" listesi — ne yapmamalısın?\n\n**Temel Prensip**\n30 dakika harcanan bu review, hafta içinde saatler kurtarır ve stratejik kayışı önler.`,
  24: `X-Neu verilerine göre platform üzerindeki analizlerde başarılı seri girişimcilerin büyük çoğunluğu stratejik beyin tipinde çıktı.\n\n**Stratejik Girişimcinin Güçleri**\n- Uzun vadeli büyüme modellerini görme\n- Kaynakları etkili tahsis etme\n- Pazardaki boşlukları erken fark etme\n- Doğru zamanlama için sabır\n\n**Dikkat Edilmesi Gereken**\nStratejik beyin tipleri aşırı planlayıp geç başlayabilirler. "Mükemmel plan" beklentisi erken momentum kaybına yol açar. Bir an harekete geç.\n\n**Tamamlayıcı Kurucu Kombinasyonları**\n- Stratejik + Yaratıcı: Vizyon + ürün\n- Stratejik + Empatik: Vizyon + ekip/müşteri\n- Stratejik + Analitik: Vizyon + veri\n\n**Öneri**: Kendi beyin tipini tamamlayan bir kurucu ara.`,
};
const BRAIN_TABS = [
  { key: 'mine', label: 'Benim İçin', icon: '🧠' },
  { key: 'analytical', label: 'Analitik', icon: '🔢' },
  { key: 'creative', label: 'Yaratıcı', icon: '🎨' },
  { key: 'empathetic', label: 'Empatik', icon: '💙' },
  { key: 'strategic', label: 'Stratejik', icon: '♟️' },
];

export default function ContentPage() {
  const { user } = useAuthStore();
  const myBrain = user?.neuroProfile?.brainType || 'analytical';
  const [activeTab, setActiveTab] = useState('mine');
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState(null);

  const currentBrain = activeTab === 'mine' ? myBrain : activeTab;
  const contents = CONTENT_LIBRARY[currentBrain] || [];

  const filtered = filter === 'all' ? contents : contents.filter((c) => c.type === filter);

  const toggleSave = (id) => {
    setSaved((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🎓 İçerik Öneri Motoru</h1>
          <p style={{ color: '#94a3b8' }}>Beyin tipine göre kişiselleştirilmiş makale, video ve alıştırmalar</p>
        </div>

        {/* Brain Type Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {BRAIN_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ background: activeTab === tab.key ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeTab === tab.key ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)'}`, color: activeTab === tab.key ? '#00d4ff' : '#94a3b8', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
              {tab.icon} {tab.label}
              {tab.key === 'mine' && (
                <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(0,212,255,0.2)', borderRadius: 10, padding: '1px 6px' }}>Kişisel</span>
              )}
            </button>
          ))}
        </div>

        {/* Content Type Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: 13 }}>Filtrele:</span>
          {[['all', 'Tümü', '🌐'], ['article', 'Makale', '📄'], ['video', 'Video', '🎬'], ['book', 'Kitap', '📖'], ['tool', 'Araç', '🛠️'], ['exercise', 'Egzersiz', '⚡']].map(([v, l, icon]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ background: filter === v ? 'rgba(124,58,237,0.15)' : 'transparent', border: `1px solid ${filter === v ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`, color: filter === v ? '#a78bfa' : '#64748b', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
              {icon} {l}
            </button>
          ))}
        </div>

        {/* Active brain label */}
        {activeTab === 'mine' && (
          <div style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 10, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', fontSize: 13, color: '#94a3b8' }}>
            🧠 Beyin tipine göre seçilen içerikler: <strong style={{ color: '#00d4ff' }}>{myBrain.charAt(0).toUpperCase() + myBrain.slice(1)}</strong>
          </div>
        )}

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
          {filtered.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default', borderTop: `3px solid ${item.color}` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${item.color}22`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 36 }}>{item.emoji}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#64748b' }}>
                    {TYPE_ICONS[item.type]} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <button onClick={() => toggleSave(item.id)} title={saved.includes(item.id) ? 'Kaldır' : 'Kaydet'}
                    style={{ background: saved.includes(item.id) ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, padding: '3px 7px', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' }}>
                    {saved.includes(item.id) ? '⭐' : '☆'}
                  </button>
                </div>
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.4 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ background: `${item.color}22`, border: `1px solid ${item.color}44`, color: item.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  {item.tag}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>⏱ {item.read}</span>
              </div>
              <button onClick={() => setSelected(item)} style={{ background: `linear-gradient(90deg, ${item.color}22, transparent)`, border: `1px solid ${item.color}33`, color: item.color, borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${item.color}22`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(90deg, ${item.color}22, transparent)`; }}>
                Okumaya Başla →
              </button>
            </div>
          ))}
        </div>

        {/* Content Detail Modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
            onClick={() => setSelected(null)}>
            <div className="card" style={{ maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto', borderTop: `4px solid ${selected.color}`, position: 'relative' }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: 42 }}>{selected.emoji}</span>
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ background: `${selected.color}22`, border: `1px solid ${selected.color}44`, color: selected.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{selected.tag}</span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#64748b' }}>{TYPE_ICONS[selected.type]} {selected.type}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>⏱ {selected.read}</span>
                    </div>
                    <h2 style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.3, margin: 0 }}>{selected.title}</h2>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#94a3b8', fontSize: 18, flexShrink: 0 }}>✕</button>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{selected.desc}</p>
              <div>
                {(CONTENT_BODIES[selected.id] || selected.desc).split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={i} style={{ color: selected.color, fontWeight: 700, fontSize: 15, margin: '18px 0 8px' }}>{line.replace(/\*\*/g, '')}</h4>;
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.8, paddingLeft: 12, marginBottom: 2 }}>• {line.slice(2)}</div>;
                  }
                  if (/^\d+\./.test(line)) {
                    return <div key={i} style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.8, paddingLeft: 12, marginBottom: 2 }}>{line}</div>;
                  }
                  if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
                  return <p key={i} style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.8, margin: '0 0 4px' }}>{line}</p>;
                })}
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <button onClick={() => toggleSave(selected.id)}
                  style={{ background: saved.includes(selected.id) ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${saved.includes(selected.id) ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '8px 16px', fontSize: 13, color: saved.includes(selected.id) ? '#f59e0b' : '#94a3b8', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  {saved.includes(selected.id) ? '⭐ Kaydedildi' : '☆ Kaydet'}
                </button>
                <button onClick={() => setSelected(null)}
                  style={{ background: `linear-gradient(135deg, ${selected.color}, #7c3aed)`, border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>Bu kategoride henüz içerik yok.</p>
          </div>
        )}

        {/* Saved */}
        {saved.length > 0 && (
          <div style={{ marginTop: 40, padding: '20px 24px', borderRadius: 16, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#f59e0b' }}>⭐ Kaydedilenler ({saved.length})</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.values(CONTENT_LIBRARY).flat().filter((c) => saved.includes(c.id)).map((c) => (
                <span key={c.id} style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '5px 14px', fontSize: 13 }}>
                  {c.emoji} {c.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
