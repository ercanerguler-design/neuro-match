import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';

const translations = {
  tr: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      analysis: 'Analiz',
      match: 'Eşleştirme',
      coach: 'AI Koç',
      reports: 'Raporlar',
      profile: 'Profil',
      enterprise: 'Kurumsal',
      pricing: 'Fiyatlar',
      login: 'Giriş Yap',
      register: 'Ücretsiz Başla',
      logout: 'Çıkış Yap',
      enterpriseLogin: 'Kurumsal Giriş',
    },
    // Common
    common: {
      loading: 'Yükleniyor...',
      save: 'Kaydet',
      cancel: 'İptal',
      close: 'Kapat',
      confirm: 'Onayla',
      delete: 'Sil',
      edit: 'Düzenle',
      share: 'Paylaş',
      download: 'İndir',
      back: 'Geri',
      next: 'İleri',
      submit: 'Gönder',
      search: 'Ara',
      filter: 'Filtrele',
      all: 'Tümü',
      yes: 'Evet',
      no: 'Hayır',
      plan: 'Plan',
      free: 'Ücretsiz',
    },
    // Landing Page
    landing: {
      badge: '🚀 Dünyanın İlk Nörolojik Uyumluluk Platformu',
      heroLine1: 'Beynini Keşfet.',
      heroLine2: 'Potansiyelini Aç.',
      heroLine3: 'Hayatını Optimize Et.',
      heroDesc: 'Yapay zeka ve nörobilim ile kişilik profilinizi keşfedin. İş ortakları, romantik eşler ve kariyer yolunuzu bilimsel olarak belirleyin.',
      ctaStart: '🧠 Ücretsiz Analiz Başlat',
      ctaPlans: '📊 Planları Gör',
      featuresTitle: 'Neden NEURO-MATCH?',
      statsTitle: 'Rakamlarla NEURO-MATCH',
      brainTypesTitle: 'Beyin Tipini Keşfet',
      enterpriseCTA: 'Kurumsal çözümler için',
      enterpriseCTALink: 'Kurumsal sayfayı ziyaret edin →',
      footer: '© 2024 NEURO-MATCH. Tüm hakları saklıdır.',
    },
    // Dashboard
    dashboard: {
      welcome: 'Hoş geldin',
      subtitle: 'Nörolojik yolculuğuna devam et',
      startAnalysis: '🧠 Analizi Başlat',
      profileBanner: '🧠 Nörolojik Profilini Oluştur',
      profileBannerSub: '25 soruluk analizi tamamla ve beyin tipini keşfet. Sadece 10 dakika!',
      brainTypeLabel: 'Beyin Tipi',
      neuroScore: 'Nöro Skoru',
      avgMood: 'Ortalama Ruh Hali',
      avgSleep: 'Ort. Uyku',
      notDetermined: 'Belirlenmedi',
      neuroMap: '🧠 Nörolojik Harita',
      dailyCoach: '🤖 Günlük AI Koç Mesajı',
      coachWait: 'Kişiselleştirilmiş koç mesajı için önce analizini tamamla.',
      weeklyMood: '📈 Haftalık Ruh Hali & Enerji',
      quickActions: 'Hızlı Erişim',
      newAnalysis: 'Yeni Analiz',
      findMatch: 'Eşleşme Bul',
      talkCoach: 'Koçla Konuş',
      myReports: 'Raporlarım',
      checkin: 'Günlük Check-in',
      checkinTitle: '📊 Bugünkü Durumun',
      mood: 'Ruh Hali',
      energy: 'Enerji',
      stress: 'Stres',
      focus: 'Odak',
      checkinSaved: 'Check-in kaydedildi! ✅',
      notSet: '—',
      hours: 's',
      outOf: '/10',
    },
    // Brain Types
    brainTypes: {
      analytical: 'Analitik',
      creative: 'Yaratıcı',
      empathetic: 'Empatik',
      strategic: 'Stratejik',
      unknown: 'Bilinmiyor',
    },
    // Analysis Page
    analysis: {
      title: 'Nörolojik Analiz',
      subtitle: 'Beyin tipini keşfet',
      startBtn: 'Analizi Başlat',
      progress: 'soru',
      of: '/',
      submitting: 'Analiz ediliyor...',
    },
    // Match Page
    match: {
      title: 'Eşleştirme',
      subtitle: 'Nörolojik uyumluluğunu keşfet',
      noProfile: 'Önce Analizini Tamamla',
      noProfileSub: 'Eşleşme özelliğini kullanmak için nörolojik analizini tamamlaman gerekiyor.',
      compatible: 'Uyumlu Kişiler',
      compatibility: 'Uyumluluk',
      viewProfile: 'Profili Gör',
      calculate: 'Hesapla',
    },
    // Coach Page
    coach: {
      title: 'AI Koç',
      subtitle: 'Kişisel yapay zeka koçun',
      placeholder: 'Koçuna bir şey sor...',
      send: 'Gönder',
      thinking: 'Düşünüyor...',
    },
    // Reports Page
    reports: {
      title: 'Raporlarım',
      subtitle: 'Nörolojik analiz raporların',
      noReports: 'Henüz rapor yok',
      noReportsSub: 'Analizi tamamla ve ilk raporunu oluştur.',
      viewReport: 'Raporu Gör',
      shareReport: 'Paylaş',
    },
    // Profile Page
    profile: {
      title: 'Profilim',
      subtitle: 'Hesap ayarlarını yönet',
      personalInfo: 'Kişisel Bilgiler',
      name: 'İsim',
      email: 'Email',
      phone: 'Telefon',
      birthDate: 'Doğum Tarihi',
      country: 'Ülke',
      language: 'Dil',
      currentPassword: 'Mevcut Şifre',
      newPassword: 'Yeni Şifre',
      changePassword: 'Şifre Değiştir',
      saveChanges: 'Değişiklikleri Kaydet',
      subscription: 'Abonelik',
      upgradeNow: 'Şimdi Yükselt',
      male: 'Erkek',
      female: 'Kadın',
      other: 'Diğer',
    },
    // Enterprise
    enterprise: {
      title: '🏢 Kurumsal Çözümler',
      loginTitle: '🏢 Kurumsal Panel',
      loginSubtitle: 'Kurumsal hesabınıza giriş yapın',
      loginBtn: 'Kurumsal Giriş Yap',
      noAccount: 'Hesabınız yok mu?',
      contactSales: 'Satış ekibiyle iletişime geçin',
      teamMembers: 'Ekip Üyesi',
      teamCompatibility: 'Ekip Uyumu',
      burnoutRisk: 'Burnout Riski',
      productivity: 'Üretkenlik',
      brainDistribution: '🧠 Ekip Beyin Tipi Dağılımı',
      highRisk: 'Yüksek Risk',
      features: [
        { title: 'Ekip Uyum Analizi', desc: 'Tüm ekibinizin nörolojik profillerini ve team dinamiklerini analiz edin.' },
        { title: 'Burnout Tespiti', desc: 'Erken uyarı sistemi ile çalışan tükenmişliğini önleyin.' },
        { title: 'İşe Alım Desteği', desc: 'Beyin tipi uyumuna göre ideal adayları belirleyin.' },
        { title: 'HR Dashboard', desc: 'Gerçek zamanlı ekip performans ve uyum metrikleri.' },
        { title: 'API Entegrasyonu', desc: 'Mevcut HR sistemlerinizle tam entegrasyon.' },
        { title: 'KVKK Uyumlu', desc: 'Tüm veriler KVKK ve GDPR uyumlu şekilde işlenir.' },
      ],
    },
    // Auth
    auth: {
      email: 'Email',
      password: 'Şifre',
      name: 'İsim Soyisim',
      forgotPassword: 'Şifremi unuttum',
      loginTitle: 'Hesabına giriş yap',
      registerTitle: 'Ücretsiz hesap oluştur',
      loginBtn: '🚀 Giriş Yap',
      registerBtn: '🧠 Ücretsiz Başla',
      noAccount: 'Hesabın yok mu?',
      hasAccount: 'Zaten hesabın var mı?',
      registerLink: 'Kayıt Ol',
      loginLink: 'Giriş Yap',
      agreeTerms: 'Kullanım şartlarını kabul ediyorum',
      emailPlaceholder: 'ornek@mail.com',
      passwordPlaceholder: '••••••••',
      namePlaceholder: 'Adınız Soyadınız',
    },
    // Pricing
    pricing: {
      title: 'Planlar & Fiyatlar',
      subtitle: 'Beyin tipine uygun planı seç',
      monthly: 'Aylık',
      yearly: 'Yıllık',
      save: '%20 Tasarruf',
      mostPopular: 'En Popüler',
      getStarted: 'Başla',
      currentPlan: 'Mevcut Plan',
      mo: '/ay',
    },
  },

  // ─── ENGLISH ────────────────────────────────────────────────────────────────
  en: {
    nav: {
      dashboard: 'Dashboard',
      analysis: 'Analysis',
      match: 'Matching',
      coach: 'AI Coach',
      reports: 'Reports',
      profile: 'Profile',
      enterprise: 'Enterprise',
      pricing: 'Pricing',
      login: 'Sign In',
      register: 'Get Started Free',
      logout: 'Sign Out',
      enterpriseLogin: 'Enterprise Login',
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      share: 'Share',
      download: 'Download',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      plan: 'Plan',
      free: 'Free',
    },
    landing: {
      badge: '🚀 World\'s First Neurological Compatibility Platform',
      heroLine1: 'Discover Your Brain.',
      heroLine2: 'Unlock Your Potential.',
      heroLine3: 'Optimize Your Life.',
      heroDesc: 'Discover your personality profile through AI and neuroscience. Scientifically identify business partners, romantic matches, and career paths.',
      ctaStart: '🧠 Start Free Analysis',
      ctaPlans: '📊 View Plans',
      featuresTitle: 'Why NEURO-MATCH?',
      statsTitle: 'NEURO-MATCH by the Numbers',
      brainTypesTitle: 'Discover Your Brain Type',
      enterpriseCTA: 'For enterprise solutions',
      enterpriseCTALink: 'Visit Enterprise page →',
      footer: '© 2024 NEURO-MATCH. All rights reserved.',
    },
    dashboard: {
      welcome: 'Welcome',
      subtitle: 'Continue your neurological journey',
      startAnalysis: '🧠 Start Analysis',
      profileBanner: '🧠 Create Your Neurological Profile',
      profileBannerSub: 'Complete the 25-question analysis and discover your brain type. Only 10 minutes!',
      brainTypeLabel: 'Brain Type',
      neuroScore: 'Neuro Score',
      avgMood: 'Avg. Mood',
      avgSleep: 'Avg. Sleep',
      notDetermined: 'Not Set',
      neuroMap: '🧠 Neurological Map',
      dailyCoach: '🤖 Daily AI Coach Message',
      coachWait: 'Complete your analysis first for a personalized coach message.',
      weeklyMood: '📈 Weekly Mood & Energy',
      quickActions: 'Quick Actions',
      newAnalysis: 'New Analysis',
      findMatch: 'Find Match',
      talkCoach: 'Talk to Coach',
      myReports: 'My Reports',
      checkin: 'Daily Check-in',
      checkinTitle: '📊 How Are You Today?',
      mood: 'Mood',
      energy: 'Energy',
      stress: 'Stress',
      focus: 'Focus',
      checkinSaved: 'Check-in saved! ✅',
      notSet: '—',
      hours: 'h',
      outOf: '/10',
    },
    brainTypes: {
      analytical: 'Analytical',
      creative: 'Creative',
      empathetic: 'Empathetic',
      strategic: 'Strategic',
      unknown: 'Unknown',
    },
    analysis: {
      title: 'Neurological Analysis',
      subtitle: 'Discover your brain type',
      startBtn: 'Start Analysis',
      progress: 'question',
      of: '/',
      submitting: 'Analyzing...',
    },
    match: {
      title: 'Matching',
      subtitle: 'Discover your neurological compatibility',
      noProfile: 'Complete Your Analysis First',
      noProfileSub: 'You need to complete the neurological analysis to use the matching feature.',
      compatible: 'Compatible People',
      compatibility: 'Compatibility',
      viewProfile: 'View Profile',
      calculate: 'Calculate',
    },
    coach: {
      title: 'AI Coach',
      subtitle: 'Your personal AI coach',
      placeholder: 'Ask your coach anything...',
      send: 'Send',
      thinking: 'Thinking...',
    },
    reports: {
      title: 'My Reports',
      subtitle: 'Your neurological analysis reports',
      noReports: 'No reports yet',
      noReportsSub: 'Complete an analysis and generate your first report.',
      viewReport: 'View Report',
      shareReport: 'Share',
    },
    profile: {
      title: 'My Profile',
      subtitle: 'Manage your account settings',
      personalInfo: 'Personal Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      birthDate: 'Birth Date',
      country: 'Country',
      language: 'Language',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      changePassword: 'Change Password',
      saveChanges: 'Save Changes',
      subscription: 'Subscription',
      upgradeNow: 'Upgrade Now',
      male: 'Male',
      female: 'Female',
      other: 'Other',
    },
    enterprise: {
      title: '🏢 Enterprise Solutions',
      loginTitle: '🏢 Enterprise Panel',
      loginSubtitle: 'Sign in to your enterprise account',
      loginBtn: 'Enterprise Sign In',
      noAccount: "Don't have an account?",
      contactSales: 'Contact our sales team',
      teamMembers: 'Team Members',
      teamCompatibility: 'Team Compatibility',
      burnoutRisk: 'Burnout Risk',
      productivity: 'Productivity',
      brainDistribution: '🧠 Team Brain Type Distribution',
      highRisk: 'High Risk',
      features: [
        { title: 'Team Compatibility Analysis', desc: 'Analyze the neurological profiles and team dynamics of your entire team.' },
        { title: 'Burnout Detection', desc: 'Prevent employee burnout with an early warning system.' },
        { title: 'Recruitment Support', desc: 'Identify ideal candidates based on brain type compatibility.' },
        { title: 'HR Dashboard', desc: 'Real-time team performance and compatibility metrics.' },
        { title: 'API Integration', desc: 'Full integration with your existing HR systems.' },
        { title: 'GDPR Compliant', desc: 'All data is processed in compliance with GDPR.' },
      ],
    },
    auth: {
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      forgotPassword: 'Forgot password',
      loginTitle: 'Sign in to your account',
      registerTitle: 'Create a free account',
      loginBtn: '🚀 Sign In',
      registerBtn: '🧠 Get Started Free',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      registerLink: 'Register',
      loginLink: 'Sign In',
      agreeTerms: 'I agree to the terms of service',
      emailPlaceholder: 'example@mail.com',
      passwordPlaceholder: '••••••••',
      namePlaceholder: 'Your Full Name',
    },
    pricing: {
      title: 'Plans & Pricing',
      subtitle: 'Choose the plan for your brain type',
      monthly: 'Monthly',
      yearly: 'Yearly',
      save: '20% Off',
      mostPopular: 'Most Popular',
      getStarted: 'Get Started',
      currentPlan: 'Current Plan',
      mo: '/mo',
    },
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { user } = useAuthStore();
  // Initialize from user preference → localStorage → default 'tr'
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('neuro-lang') || user?.language || 'tr';
  });

  // Sync when user's stored language changes
  useEffect(() => {
    if (user?.language && user.language !== lang) {
      setLangState(user.language);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.language]);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('neuro-lang', l);
  };

  const t = translations[lang] || translations.tr;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export default LanguageContext;
