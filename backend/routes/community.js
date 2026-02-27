const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');

router.use(protect);

// Seed posts (shown when room is empty)
const SEED_POSTS = {
  analytical: [
    { authorName: 'Ayşe K.', authorBrain: 'analytical', content: 'Karar almada Bayesian istatistiğinin rolü üzerine bir makale buldum — yargısal önyargıyı azaltmak için harika bir çerçeve. Bilen var mı?', likes: 28 },
    { authorName: 'Burak T.', authorBrain: 'analytical', content: 'SQL optimizasyon problemini çözdüm! 3 saniyelik bir query\'yi 80ms\'ye indirdim. İndeks stratejisi harikaydı.', likes: 45 },
    { authorName: 'Zeynep M.', authorBrain: 'creative', content: 'Analitik düşüncenin yaratıcılıkla nasıl birleştiğini anlatan bir şey deneyimledim bugün — "sol-sağ beyin" teorisi gerçekten çalışıyor mu?', likes: 33 },
  ],
  creative: [
    { authorName: 'Can R.', authorBrain: 'creative', content: 'Yeni proje: Nörobilim verilerini interaktif sanat eserine dönüştürmek. Beyin dalgalarını görsel ritme çevirmek istiyorum. İşbirliği?', likes: 52 },
    { authorName: 'Selin B.', authorBrain: 'creative', content: 'Morning pages rutinini 30 gündür uyguluyorum. İlk 2 hafta çok zorlandım ama şimdi her sabah 3 sayfa yazmak beni rahatlatıyor.', likes: 67 },
    { authorName: 'Mehmet A.', authorBrain: 'analytical', content: 'Tasarım düşüncesi ve veri arasındaki köprü: user story\'lerden KPI\'ya nasıl gidilir?', likes: 41 },
  ],
  empathetic: [
    { authorName: 'Fatma Y.', authorBrain: 'empathetic', content: 'Bugün bir iş görüşmesinde karşımdaki kişinin gerçekten ihtiyacını dinledim ve pozisyon için aslında yanlış yer olduğunu söyledim. Dürüstlük kazanır.', likes: 89 },
    { authorName: 'Ali C.', authorBrain: 'empathetic', content: 'Nonviolent Communication kitabını okuyorum. "Gözlem → Duygu → İhtiyaç → Rica" çerçevesi gerçekten hayatımı değiştiriyor.', likes: 75 },
    { authorName: 'Naz D.', authorBrain: 'strategic', content: 'Empatinin iş dünyasında avantaj mı yoksa açık mı yarattığını tartışmak istiyorum. Bence stratejik üstünlük.', likes: 58 },
  ],
  strategic: [
    { authorName: 'Hakan S.', authorBrain: 'strategic', content: '2025 Q1 OKR\'larımı belirledim. Ana hedef: 3 yeni B2B partnerlik. Key result\'ların ölçülebilir olması gerekiyor.', likes: 63 },
    { authorName: 'İrem T.', authorBrain: 'strategic', content: 'Şirket kurarken beyin tipinin önemi: stratejik kurucular genellikle iyi problem tanımlar ama kötü "ilk müşteri" bulur. Siz nasıl aştınız?', likes: 44 },
    { authorName: 'Oğuz E.', authorBrain: 'analytical', content: 'Portföy çeşitlendirme stratejisi için beyin tipi analizi yaptım. Analitik ve stratejik beyin tipleri farklı risk profili — ilginç.', likes: 37 },
  ],
};

const BRAIN_AVATARS = { analytical: '🔢', creative: '🎨', empathetic: '💙', strategic: '♟️' };

function formatTime(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return new Date(date).toLocaleDateString('tr-TR');
}

// GET /community/:room — fetch posts
router.get('/:room', asyncHandler(async (req, res) => {
  const { room } = req.params;
  const valid = ['analytical', 'creative', 'empathetic', 'strategic'];
  if (!valid.includes(room)) return res.status(400).json({ success: false, message: 'Geçersiz oda' });

  const realPosts = await CommunityPost.find({ room }).sort({ createdAt: -1 }).limit(50).lean();
  const uid = String(req.user.id);

  const formatted = realPosts.map((p) => ({
    _id: p._id,
    author: p.authorName,
    brain: p.authorBrain,
    avatar: BRAIN_AVATARS[p.authorBrain] || '🧠',
    time: formatTime(p.createdAt),
    content: p.content,
    likes: p.likes.length,
    liked: p.likes.map(String).includes(uid),
    comments: p.commentCount,
    isReal: true,
  }));

  // Append seed posts when room is relatively empty
  const seeds = realPosts.length < 3
    ? (SEED_POSTS[room] || []).map((s, i) => ({
        _id: `seed_${room}_${i}`,
        author: s.authorName,
        brain: s.authorBrain,
        avatar: BRAIN_AVATARS[s.authorBrain] || '🧠',
        time: `${i * 3 + 2} saat önce`,
        content: s.content,
        likes: s.likes,
        liked: false,
        comments: Math.floor(s.likes / 4),
        isReal: false,
      }))
    : [];

  res.json({ success: true, data: [...formatted, ...seeds] });
}));

// POST /community — create post
router.post('/', asyncHandler(async (req, res) => {
  const { room, content } = req.body;
  const valid = ['analytical', 'creative', 'empathetic', 'strategic'];
  if (!valid.includes(room)) return res.status(400).json({ success: false, message: 'Geçersiz oda' });
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'İçerik boş olamaz' });

  const post = await CommunityPost.create({
    room,
    author: req.user.id,
    authorName: req.user.name || 'Anonim',
    authorBrain: req.user.neuroProfile?.brainType || 'analytical',
    content: content.trim(),
  });

  res.status(201).json({
    success: true,
    data: {
      _id: post._id,
      author: post.authorName,
      brain: post.authorBrain,
      avatar: BRAIN_AVATARS[post.authorBrain] || '🧠',
      time: 'Az önce',
      content: post.content,
      likes: 0,
      liked: false,
      comments: 0,
      isReal: true,
    },
  });
}));

// POST /community/:id/like — toggle like (skip for seed posts)
router.post('/:id/like', asyncHandler(async (req, res) => {
  if (req.params.id.startsWith('seed_')) {
    return res.json({ success: true, data: { likes: 0, liked: false } });
  }

  const post = await CommunityPost.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post bulunamadı' });

  const uid = String(req.user.id);
  const idx = post.likes.map(String).indexOf(uid);
  let liked;
  if (idx === -1) {
    post.likes.push(req.user.id);
    liked = true;
  } else {
    post.likes.splice(idx, 1);
    liked = false;
  }
  await post.save();

  res.json({ success: true, data: { likes: post.likes.length, liked } });
}));

module.exports = router;
