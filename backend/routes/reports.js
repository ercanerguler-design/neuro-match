const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const reports = await Report.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: reports.length, data: reports });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  let report = await Report.findById(req.params.id);
  if (!report) return next(new ErrorResponse('Rapor bulunamadı', 404));
  if (report.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Bu rapora erişim yetkiniz yok', 403));
  }
  res.status(200).json({ success: true, data: report });
}));

// Generate share link
router.post('/:id/share', asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);
  if (!report) return next(new ErrorResponse('Rapor bulunamadı', 404));
  report.shareToken = uuidv4();
  await report.save();
  res.status(200).json({
    success: true,
    shareUrl: `${process.env.CLIENT_URL}/shared-report/${report.shareToken}`,
  });
}));

// Public shared report
router.get('/shared/:token', asyncHandler(async (req, res, next) => {
  const report = await Report.findOne({ shareToken: req.params.token });
  if (!report) return next(new ErrorResponse('Rapor bulunamadı veya linkin süresi dolmuş', 404));
  report.downloadCount += 1;
  await report.save();
  res.status(200).json({ success: true, data: report });
}));

module.exports = router;
