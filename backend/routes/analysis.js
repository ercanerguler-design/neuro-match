const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  submitQuestionnaire,
  getAnalysis,
  getUserAnalyses,
  submitVoiceAnalysis,
  submitFacialAnalysis,
  getComprehensiveAnalysis,
} = require('../controllers/analysisController');
const { protect, checkSubscription } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|mp3|wav|ogg|webm/;
    const ext = allowed.test(require('path').extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Desteklenmeyen dosya formatı'));
  },
});

router.use(protect);

router.post('/questionnaire', submitQuestionnaire);
router.post('/voice', upload.single('audio'), submitVoiceAnalysis);
router.post('/facial', upload.single('image'), submitFacialAnalysis);
router.post('/comprehensive', getComprehensiveAnalysis);
router.get('/', getUserAnalyses);
router.get('/:id', getAnalysis);

module.exports = router;
