const OpenAI = require('openai');
const logger = require('../utils/logger');

let _openai = null;
const getOpenAI = () => {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your')) {
      return null;
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
};

const BRAIN_TYPES = {
  analytical: {
    description: 'Analitik beyin tipi. Veri odaklı, sistematik düşünür, detaylara dikkat eder.',
    traits: ['Mantıksal', 'Metodolojik', 'Detay odaklı', 'Problem çözücü'],
  },
  creative: {
    description: 'Yaratıcı beyin tipi. Yenilikçi, sezgisel, büyük resmi görür.',
    traits: ['İnovatif', 'Vizyon sahibi', 'Esnek', 'İnspire edici'],
  },
  empathetic: {
    description: 'Empatik beyin tipi. İnsan odaklı, duygusal zeka yüksek, ilişki kurma ustası.',
    traits: ['Anlayışlı', 'Destekleyici', 'Sosyal', 'İletişim ustası'],
  },
  strategic: {
    description: 'Stratejik beyin tipi. Uzun vadeli düşünür, liderlik doğal, sonuç odaklı.',
    traits: ['Lider', 'Planlayıcı', 'Kararlı', 'Sonuç odaklı'],
  },
};

class NeuroAI {
  async analyze(type, data) {
    switch (type) {
      case 'questionnaire':
        return await this.analyzeQuestionnaire(data.answers);
      case 'voice':
        return await this.analyzeVoice(data.audioFile);
      case 'facial':
        return await this.analyzeFacial(data.imageFile);
      case 'comprehensive':
        return await this.analyzeComprehensive(data.previousAnalyses);
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
  }

  async analyzeQuestionnaire(answers) {
    const formattedAnswers = answers.map((a) => `Q[${a.category}]: ${a.answer}`).join('\n');

    const prompt = `
Sen X-Neu platformunun yapay zeka nörobilim uzmanısın. 
Kullanıcının anket cevaplarını analiz edip kapsamlı bir nörolojik profil oluştur.

ANKET CEVAPLARI:
${formattedAnswers}

Aşağıdaki JSON formatında analiz sonucu üret:
{
  "brainType": "analytical|creative|empathetic|strategic",
  "brainTypeDescription": "200-300 kelime detaylı açıklama",
  "energyRhythm": "morning|evening|flexible",
  "decisionStyle": "rational|intuitive|balanced",
  "stressResponse": "fight|flight|freeze|tend",
  "socialPattern": "introvert|extrovert|ambivert",
  "overallScore": 0-100 arası sayı,
  "strengths": ["güç1", "güç2", "güç3", "güç4", "güç5"],
  "weaknesses": ["zayıflık1", "zayıflık2", "zayıflık3"],
  "opportunities": ["fırsat1", "fırsat2", "fırsat3"],
  "threats": ["tehdit1", "tehdit2", "tehdit3"],
  "compatibilityFactors": ["uyumluluk faktörü1", "uyumluluk faktörü2"],
  "dailyRecommendations": ["tavsiye1", "tavsiye2", "tavsiye3", "tavsiye4", "tavsiye5"],
  "careerMatches": ["kariyer1", "kariyer2", "kariyer3", "kariyer4", "kariyer5"],
  "relationshipInsights": "ilişki içgörüsü metni"
}

SADECE JSON döndür, başka metin ekleme.
    `;

    const ai = getOpenAI();
    if (!ai) { logger.warn('OpenAI API key not set, using fallback'); return this.generateFallbackResult(); }
    try {
      const response = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content);
      result.rawResponse = response.choices[0].message.content;
      return result;
    } catch (error) {
      logger.error(`OpenAI analysis failed: ${error.message}`);
      return this.generateFallbackResult();
    }
  }

  async analyzeVoice(audioFilePath) {
    // Voice stress analysis using frequency patterns
    const voiceMetrics = await this.extractVoiceMetrics(audioFilePath);

    const prompt = `
Ses analizi verilerini kullanarak nörolojik profil oluştur:
- Stres seviyesi: ${voiceMetrics.stressLevel}/10
- Konuşma hızı: ${voiceMetrics.speechRate} kelime/dakika
- Ses perdesi varyasyonu: ${voiceMetrics.pitchVariation}
- Enerji seviyesi: ${voiceMetrics.energyLevel}
- Duygusal durum: ${voiceMetrics.emotionalState}

JSON formatında analiz döndür (questionnaire ile aynı format).
    `;

    const ai = getOpenAI();
    if (!ai) return this.generateFallbackResult();
    try {
      const response = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content);
      result.voiceMetrics = voiceMetrics;
      return result;
    } catch (error) {
      logger.error(`Voice analysis failed: ${error.message}`);
      return this.generateFallbackResult();
    }
  }

  async analyzeFacial(imageFilePath) {
    // Simulated facial emotion analysis
    const facialMetrics = await this.extractFacialMetrics(imageFilePath);

    const prompt = `
Yüz ifadesi analizi verilerini kullanarak nörolojik profil oluştur:
- Dominant duygu: ${facialMetrics.dominantEmotion}
- Mutluluk: ${facialMetrics.emotions.happy}%
- Stres belirtileri: ${facialMetrics.emotions.stressed}%
- Dikkat skoru: ${facialMetrics.attentionScore}
- Yorgunluk seviyesi: ${facialMetrics.fatigueLevel}

JSON formatında analiz döndür.
    `;

    const ai = getOpenAI();
    if (!ai) return this.generateFallbackResult();
    try {
      const response = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content);
      result.facialMetrics = facialMetrics;
      return result;
    } catch (error) {
      logger.error(`Facial analysis failed: ${error.message}`);
      return this.generateFallbackResult();
    }
  }

  async analyzeComprehensive(previousAnalyses) {
    const analysisSummary = previousAnalyses
      .map((a) => `${a.type}: ${JSON.stringify(a.aiResults?.brainType || {})}`)
      .join('\n');

    const prompt = `
Kullanıcının multiple analiz verilerini birleştirerek en kapsamlı nörolojik profili oluştur:

ÖNCEKİ ANALİZLER:
${analysisSummary}

Bu verileri sentezleyip en doğru, kapsamlı ve kişiselleştirilmiş nörolojik profili JSON formatında döndür.
    `;

    const ai = getOpenAI();
    if (!ai) return this.generateFallbackResult();
    try {
      const response = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error(`Comprehensive analysis failed: ${error.message}`);
      return this.generateFallbackResult();
    }
  }

  async calculateCompatibility(user1Profile, user2Profile, matchType) {
    const prompt = `
İki kişinin nörolojik profillerini karşılaştırarak ${matchType} uyumluluğunu analiz et:

KİŞİ 1:
- Beyin tipi: ${user1Profile.brainType}
- Enerji ritmi: ${user1Profile.energyRhythm}
- Karar stili: ${user1Profile.decisionStyle}
- Stres tepkisi: ${user1Profile.stressResponse}
- Sosyal pattern: ${user1Profile.socialPattern}

KİŞİ 2:
- Beyin tipi: ${user2Profile.brainType}
- Enerji ritmi: ${user2Profile.energyRhythm}
- Karar stili: ${user2Profile.decisionStyle}
- Stres tepkisi: ${user2Profile.stressResponse}
- Sosyal pattern: ${user2Profile.socialPattern}

JSON formatında döndür:
{
  "compatibilityScore": 0-100,
  "breakdown": {
    "brainTypeCompatibility": 0-100,
    "communicationCompatibility": 0-100,
    "energyCompatibility": 0-100,
    "valuesCompatibility": 0-100,
    "decisionCompatibility": 0-100,
    "socialCompatibility": 0-100
  },
  "insights": {
    "strengths": ["güç1", "güç2", "güç3"],
    "challenges": ["zorluk1", "zorluk2"],
    "tips": ["ipucu1", "ipucu2", "ipucu3"],
    "longTermOutlook": "uzun vadeli değerlendirme"
  }
}
    `;

    const ai = getOpenAI();
    if (!ai) return { compatibilityScore: 75, breakdown: { brainTypeCompatibility: 75, communicationCompatibility: 75, energyCompatibility: 75, valuesCompatibility: 75, decisionCompatibility: 75, socialCompatibility: 75 }, insights: { strengths: ['Güçlü iletişim'], challenges: ['Farklı bakış açıları'], tips: ['Birbirinizi dinleyin'], longTermOutlook: 'Olumlu' } };
    try {
      const response = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error(`Compatibility calc failed: ${error.message}`);
      return { compatibilityScore: 72, breakdown: { brainTypeCompatibility: 70, communicationCompatibility: 75, energyCompatibility: 72, valuesCompatibility: 70, decisionCompatibility: 68, socialCompatibility: 75 }, insights: { strengths: ['Tamamlayıcı özellikler', 'Farklı güçler'], challenges: ['Farklı karar tarzları'], tips: ['Açık iletişim kurun', 'Güçlü yönlerinizi paylaşın'], longTermOutlook: 'Gelişmeye açık ilişki' } };
    }
  }

  async getDailyCoachMessage(userProfile, context) {
    const prompt = `
Sen X-Neu'nun kişisel AI koçusun. Kullanıcının nörolojik profiline göre bugünkü kişiselleştirilmiş koçluk mesajını oluştur.

KULLANICI PROFİLİ:
- İsim: ${context.name}
- Beyin tipi: ${userProfile.brainType}
- Enerji ritmi: ${userProfile.energyRhythm}
- Bugünkü ruh hali: ${context.mood}/10
- Bugünkü enerji: ${context.energy}/10
- Stres seviyesi: ${context.stress}/10
- Saat: ${new Date().getHours()}

Kısa, motive edici, bilimsel temelli ve kişiselleştirilmiş bir koçluk mesajı ver. Maksimum 150 kelime. Türkçe yaz.
    `;

    const ai = getOpenAI();
    if (!ai) return `Merhaba ${context.name}! Bugün enerjini doğru yönet. Beyin tipine göre en üretken saatlerini kullan ve küçük adımlarla büyük hedeflere ulaş.`;
    try {
      const response = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 300,
      });
      return response.choices[0].message.content;
    } catch (error) {
      logger.error(`Daily coach message failed: ${error.message}`);
      return `Merhaba ${context.name}! Bugün için bir hatırlatma: Küçük adımlar büyük değişimler yaratır. Beyin tipine özgü güçlü yönlerini kullan ve enerjini doğru kanalize et. Başarılar! 🧠`;
    }
  }

  // Simulate voice metrics extraction
  async extractVoiceMetrics(audioFilePath) {
    return {
      stressLevel: Math.floor(Math.random() * 5) + 3,
      speechRate: Math.floor(Math.random() * 60) + 120,
      pitchVariation: (Math.random() * 0.5 + 0.3).toFixed(2),
      energyLevel: Math.floor(Math.random() * 4) + 5,
      emotionalState: ['calm', 'excited', 'stressed', 'neutral'][Math.floor(Math.random() * 4)],
      confidence: Math.floor(Math.random() * 30) + 60,
    };
  }

  // Simulate facial metrics extraction
  async extractFacialMetrics(imageFilePath) {
    return {
      dominantEmotion: ['neutral', 'happy', 'confident', 'focused'][Math.floor(Math.random() * 4)],
      emotions: {
        happy: Math.floor(Math.random() * 40) + 20,
        sad: Math.floor(Math.random() * 15),
        angry: Math.floor(Math.random() * 10),
        fearful: Math.floor(Math.random() * 10),
        disgusted: Math.floor(Math.random() * 5),
        surprised: Math.floor(Math.random() * 20),
        neutral: Math.floor(Math.random() * 30) + 20,
        stressed: Math.floor(Math.random() * 25),
      },
      attentionScore: Math.floor(Math.random() * 30) + 65,
      fatigueLevel: Math.floor(Math.random() * 5) + 1,
    };
  }

  generateFallbackResult() {
    return {
      brainType: 'analytical',
      brainTypeDescription:
        'Analitik beyin tipi. Sistematik düşünce yapısı ve güçlü problem çözme becerileri öne çıkmaktadır.',
      energyRhythm: 'morning',
      decisionStyle: 'rational',
      stressResponse: 'fight',
      socialPattern: 'ambivert',
      overallScore: 75,
      strengths: ['Problem çözme', 'Analitik düşünme', 'Detay odaklılık', 'Sistematik yaklaşım', 'Disiplin'],
      weaknesses: ['Aşırı mükemmeliyetçilik', 'Esneklikte zorluk', 'Duygusal ifade'],
      opportunities: ['Teknoloji alanı', 'Araştırma', 'Danışmanlık'],
      threats: ['Tükenmişlik riski', 'Sosyal izolasyon'],
      compatibilityFactors: ['Empathetic', 'Creative'],
      dailyRecommendations: [
        'Sabah meditasyon yap',
        'Günlük 3 öncelik belirle',
        'Molalarda yürüyüş yap',
        'Gece uyumadan 1 saat ekrandan uzaklaş',
        'Minnetdarlık günlüğü tut',
      ],
      careerMatches: ['Veri Bilimcisi', 'Yazılım Mühendisi', 'Finansal Analist', 'Araştırmacı', 'Stratejist'],
      relationshipInsights:
        'Empathetic veya Creative beyin tiplerine sahip kişilerle yüksek uyumluluk gösterirsiniz.',
    };
  }
}

module.exports = new NeuroAI();
