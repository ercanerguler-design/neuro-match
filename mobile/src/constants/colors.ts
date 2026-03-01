// Proje renk paleti - Web ile aynı!
export const Colors = {
  bg: '#06061a',
  bg2: '#0a0a1f',
  bgCard: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  cyan: '#00d4ff',
  purple: '#7c3aed',
  purpleLight: '#c084fc',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  white: '#ffffff',
  gray: '#94a3b8',
  grayDark: '#64748b',
  grayDarker: '#475569',
};

export const BrainTypes = {
  analytical: {
    label: { tr: 'Analitik', en: 'Analytical' },
    color: Colors.cyan,
    icon: '🔢',
    bg: 'rgba(0,212,255,0.1)',
    border: 'rgba(0,212,255,0.3)',
    desc: { tr: 'Veri odaklı, sistematik düşünür', en: 'Data-driven, systematic thinker' },
  },
  creative: {
    label: { tr: 'Yaratıcı', en: 'Creative' },
    color: Colors.purple,
    icon: '🎨',
    bg: 'rgba(124,58,237,0.1)',
    border: 'rgba(124,58,237,0.3)',
    desc: { tr: 'Yenilikçi, sezgisel, vizyoner', en: 'Innovative, intuitive, visionary' },
  },
  empathetic: {
    label: { tr: 'Empatik', en: 'Empathetic' },
    color: Colors.green,
    icon: '💙',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    desc: { tr: 'İnsan odaklı, duygusal zeka ustası', en: 'People-centered, emotional intelligence master' },
  },
  strategic: {
    label: { tr: 'Stratejik', en: 'Strategic' },
    color: Colors.amber,
    icon: '♟️',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    desc: { tr: 'Doğuştan lider, sonuç odaklı', en: 'Born leader, results-oriented' },
  },
};

export const API_URL = 'https://x-neu.com/api/v1';
