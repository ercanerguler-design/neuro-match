# 🧠 NEURO-MATCH — World's First Neurological Compatibility Platform

> **Dünya'nın İlk Nörolojik Uyumluluk ve Yaşam Optimizasyon Ekosistemi**

## 🚀 Hızlı Başlangıç (Windows)

### 1. Gereksinimler

| Araç | Versiyon | İndirme |
|------|----------|---------|
| Node.js | 18+ | https://nodejs.org |
| MongoDB | 7+ | https://www.mongodb.com/try/download/community |
| Git | Herhangi | https://git-scm.com |

### 2. MongoDB'yi Başlat

```bash
# MongoDB'yi Windows servis olarak kur (bir kez yap)
mongod --install --dbpath "C:\data\db" --logpath "C:\data\log\mongod.log"
net start MongoDB

# veya manuel başlat:
mongod --dbpath "C:\data\db"
```

### 3. API Anahtarları Ayarla

`backend/.env` dosyasını aç ve doldur:

```env
OPENAI_API_KEY=sk-...     # https://platform.openai.com/api-keys
STRIPE_SECRET_KEY=sk_test_...  # https://dashboard.stripe.com
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Gmail Uygulama Şifresi
```

### 4. Çalıştır

```bash
# Tüm bağımlılıkları kur ve başlat (otomatik)
start.bat

# veya manuel:
cd backend && npm install && npm run dev
cd frontend && npm install && npm start
```

### 5. Aç

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/v1
- **Health Check:** http://localhost:5000/health

---

## 📁 Proje Yapısı

```
neuro-match/
├── backend/                 # Node.js + Express API
│   ├── ai/neuroAI.js       # 🧠 Core AI Engine (GPT-4)
│   ├── models/             # MongoDB Şemaları
│   ├── controllers/        # İş mantığı
│   ├── routes/             # API endpoint'leri
│   ├── middleware/         # Auth, hata yönetimi
│   ├── socket/             # Real-time Socket.io
│   ├── utils/              # Yardımcı araçlar
│   └── server.js           # Giriş noktası
├── frontend/               # React 18 SPA
│   ├── src/pages/          # 13 sayfa
│   ├── src/components/     # Layout bileşeni
│   ├── src/store/          # Zustand state
│   └── src/services/       # API servisleri
├── docker-compose.yml      # Docker geliştirme
└── start.bat               # Windows başlatıcı
```

---

## 💰 Fiyatlandırma Planları

| Plan | Fiyat | Özellikler |
|------|-------|------------|
| Ücretsiz | ₺0 | 1 analiz, temel profil |
| Basic | ₺99/ay | 5 analiz, uyumluluk, raporlar |
| Premium | ₺299/ay | Sınırsız, AI koç, sleep tracker |
| Enterprise | ₺1999/ay | Ekip analizleri, HR dashboard, API |

---

## 🔌 API Endpoint'leri

```
POST /api/v1/auth/register     Kayıt
POST /api/v1/auth/login        Giriş
GET  /api/v1/users/dashboard   Dashboard verileri
POST /api/v1/analysis/submit   Analiz gönder
GET  /api/v1/analysis/:id      Analiz sonucu
GET  /api/v1/matches           Uyumlu kişiler
GET  /api/v1/reports           Raporlar
POST /api/v1/payments/checkout Ödeme başlat
GET  /api/v1/coach/daily       Günlük koç mesajı
POST /api/v1/coach/ask         Koça soru sor
GET  /api/v1/enterprise/team   Ekip analizi
```

---

## 🛠️ Teknoloji Stack

- **Backend:** Node.js 18, Express 4, MongoDB (Mongoose 7), Socket.io 4
- **Frontend:** React 18, React Router v6, Zustand, React Query, Recharts
- **AI:** OpenAI GPT-4 Turbo Preview
- **Ödeme:** Stripe Subscriptions
- **Güvenlik:** JWT, Helmet, Rate Limiting, bcryptjs
- **E-posta:** Nodemailer (SMTP)

---

## 📊 Gelir Modeli

- **Günlük hedef:** 50 Basic + 15 Premium = ₺9.335/gün
- **Aylık hedef:** ₺280.000+ (ilk 6 ay)
- **Enterprise:** 5 müşteri = ₺9.995/ay ek gelir

---

*NEURO-MATCH — Zihnini Anla, Hayatını Optimize Et* 🧠
