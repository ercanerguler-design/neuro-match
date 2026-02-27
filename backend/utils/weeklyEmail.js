const cron = require('node-cron');
const User = require('../models/User');
const sendEmail = require('./sendEmail');
const logger = require('./logger');

const BRAIN_INSIGHTS = {
  analytical: {
    title: '🔢 Analitik Beyin — Haftalık İçgörülerin',
    tips: [
      'Bu hafta bir problemi birden fazla açıdan ele al, kalıpların dışına çık.',
      'Verilerini görselleştir — grafikler yeni bağlantılar kurmanı sağlar.',
      'Odak bloklarını 90 dakika olarak planla, beyinin en verimli süre bu.',
    ],
    challenge: 'Bu hafta bir konuda sezgine güven, verilere dayanma.',
  },
  creative: {
    title: '🎨 Yaratıcı Beyin — Haftalık İçgörülerin',
    tips: [
      'Sabah 20 dakika "akış yazısı" yaz — aklına ne gelirse kağıda dök.',
      'Farklı bir sanat formuyla zaman geçir, hayal gücün güçlenecek.',
      'Görevleri renk kodlarıyla kategorize et, görsel belleğin daha güçlü.',
    ],
    challenge: 'Bu hafta bir fikrinden küçük bir prototip çıkar.',
  },
  empathetic: {
    title: '💙 Empatik Beyin — Haftalık İçgörülerin',
    tips: [
      'Sabah 5 dakika "şükran günlüğü" yaz, duygusal zekanı güçlendirir.',
      'Zor bir sohbeti sonuca değil, anlamaya odaklanarak yönet.',
      'Kendi sınırlarını netleştir — başkalarına yardım için önce kendin güçlü olmalısın.',
    ],
    challenge: 'Bu hafta bir kişiye "nasılsın?" sorusunu sahici şekilde sor ve gerçekten dinle.',
  },
  strategic: {
    title: '♟️ Stratejik Beyin — Haftalık İçgörülerin',
    tips: [
      'Bu haftaki 3 ana önceliğini Pazar akşamı belirle, Pazartesi sabahı sadece uygula.',
      'Her büyük kararın önce "en kötü senaryo"sunu yaz — risk toleransın artar.',
      'Uzun vadeli hedeflerini aylık minik kazanımlara böl.',
    ],
    challenge: 'Bu hafta bir uzun vadeli planını güncelle veya yeniden değerlendir.',
  },
};

function generateWeeklyHtml(user) {
  const brainType = user.neuroProfile?.brainType || 'analytical';
  const insight = BRAIN_INSIGHTS[brainType] || BRAIN_INSIGHTS.analytical;
  const xp = user.gamification?.xp || 0;
  const level = user.gamification?.level || 1;
  const streak = user.gamification?.streak || 0;
  const score = user.neuroProfile?.overallScore || 0;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#0a0a1a;color:#fff;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:36px;">
      <div style="font-size:42px;margin-bottom:8px;">🧠</div>
      <h1 style="color:#00d4ff;font-size:28px;margin:0;font-weight:900;">X-Neu</h1>
      <p style="color:#64748b;font-size:14px;margin:6px 0 0;">Haftalık Nöro-İçgörü Raporu</p>
    </div>

    <!-- Welcome -->
    <div style="background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(124,58,237,0.1));border:1px solid rgba(0,212,255,0.2);border-radius:16px;padding:24px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">Merhaba, ${user.name.split(' ')[0]}! 👋</h2>
      <p style="color:#94a3b8;margin:0;line-height:1.6;">Bu haftaki kişisel nöro-içgörülerin hazır. Beyin tipine özel tavsiyelerini görmek için aşağıyı oku.</p>
    </div>

    <!-- Stats -->
    <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
      <div style="flex:1;min-width:120px;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:#00d4ff;">${xp} XP</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Toplam XP</div>
      </div>
      <div style="flex:1;min-width:120px;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:#7c3aed;">Lv. ${level}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Nöro Seviyesi</div>
      </div>
      <div style="flex:1;min-width:120px;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:#f59e0b;">${streak} 🔥</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Günlük Seri</div>
      </div>
      <div style="flex:1;min-width:120px;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:#10b981;">${score}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Nöro Skoru</div>
      </div>
    </div>

    <!-- Insights -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#fff;font-size:17px;margin:0 0 16px;">${insight.title}</h3>
      ${insight.tips.map(tip => `
        <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start;">
          <div style="color:#00d4ff;font-size:18px;flex-shrink:0;">💡</div>
          <p style="color:#94a3b8;margin:0;line-height:1.6;font-size:14px;">${tip}</p>
        </div>
      `).join('')}
    </div>

    <!-- Challenge -->
    <div style="background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(0,212,255,0.1));border:1px solid rgba(124,58,237,0.3);border-radius:16px;padding:20px;margin-bottom:28px;">
      <div style="font-size:13px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">⚡ Bu Haftanın Nöro Görevi</div>
      <p style="color:#fff;margin:0;font-size:15px;line-height:1.6;">${insight.challenge}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:#fff;text-decoration:none;font-weight:700;padding:16px 36px;border-radius:12px;font-size:16px;">🚀 Dashboard'ıma Git</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
      <p style="color:#475569;font-size:12px;margin:0;">© 2026 X-Neu · SCE INNOVATION LTD. ŞTİ.</p>
      <p style="color:#334155;font-size:11px;margin-top:6px;">Bu e-postayı almak istemiyorsan <a href="${process.env.CLIENT_URL}/profile" style="color:#64748b;">buradan</a> ayarlarını değiştirebilirsin.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function startWeeklyEmailJob() {
  // Every Monday at 08:00 TR time (UTC+3, so 05:00 UTC)
  cron.schedule('0 5 * * 1', async () => {
    logger.info('Weekly email job started');
    try {
      const users = await User.find({
        isActive: true,
        'neuroProfile.brainType': { $exists: true },
      }).select('name email neuroProfile gamification language');

      let sent = 0;
      for (const user of users) {
        try {
          await sendEmail({
            email: user.email,
            subject: `🧠 Haftalık Nöro-İçgörün Hazır, ${user.name.split(' ')[0]}!`,
            html: generateWeeklyHtml(user),
          });
          sent++;
          // Small delay to avoid SMTP rate limiting
          await new Promise(r => setTimeout(r, 200));
        } catch (err) {
          logger.warn(`Weekly email failed for ${user.email}: ${err.message}`);
        }
      }
      logger.info(`Weekly email job completed: ${sent}/${users.length} sent`);
    } catch (err) {
      logger.error(`Weekly email job error: ${err.message}`);
    }
  }, { timezone: 'Europe/Istanbul' });

  logger.info('Weekly email cron job scheduled (every Monday 08:00 Istanbul)');
}

module.exports = { startWeeklyEmailJob, generateWeeklyHtml };
