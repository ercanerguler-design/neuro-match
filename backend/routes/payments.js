const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
//  PLAN DEFINITIONS
// ─────────────────────────────────────────────────────────────
const PLANS = {
  basic:      { amount: 99,   amountStr: '99.00',   name: 'Basic',      currency: 'TRY', stripe_price_id: process.env.STRIPE_PRICE_BASIC      || '' },
  premium:    { amount: 299,  amountStr: '299.00',  name: 'Premium',    currency: 'TRY', stripe_price_id: process.env.STRIPE_PRICE_PREMIUM    || '' },
  enterprise: { amount: 1999, amountStr: '1999.00', name: 'Enterprise', currency: 'TRY', stripe_price_id: process.env.STRIPE_PRICE_ENTERPRISE || '' },
};

// ─────────────────────────────────────────────────────────────
//  PROVIDER DETECTION
//  PAYMENT_PROVIDER env: 'stripe' | 'iyzico' | 'none' (default)
// ─────────────────────────────────────────────────────────────
const getActiveProvider = () => {
  const p = (process.env.PAYMENT_PROVIDER || 'none').toLowerCase();
  if (p === 'stripe' && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_YOUR')) return 'stripe';
  if (p === 'iyzico' && process.env.IYZICO_API_KEY   && !process.env.IYZICO_API_KEY.startsWith('YOUR_'))            return 'iyzico';
  return 'none';
};

// ─────────────────────────────────────────────────────────────
//  STRIPE — lazy init
// ─────────────────────────────────────────────────────────────
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_YOUR')) {
    throw new ErrorResponse('Stripe yapılandırılmadı. STRIPE_SECRET_KEY env değişkenini ayarlayın.', 503);
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

// ─────────────────────────────────────────────────────────────
//  IYZICO — lazy init
//  Env vars needed:
//    IYZICO_API_KEY       = your iyzico api key
//    IYZICO_SECRET_KEY    = your iyzico secret key
//    IYZICO_BASE_URL      = https://api.iyzipay.com  (prod)
//                          https://sandbox-api.iyzipay.com  (test)
// ─────────────────────────────────────────────────────────────
const getIyzico = () => {
  if (!process.env.IYZICO_API_KEY || process.env.IYZICO_API_KEY.startsWith('YOUR_')) {
    throw new ErrorResponse('iyzico yapılandırılmadı. IYZICO_API_KEY env değişkenini ayarlayın.', 503);
  }
  const Iyzipay = require('iyzipay');
  return new Iyzipay({
    apiKey:    process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri:       process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  });
};

// ─────────────────────────────────────────────────────────────
//  GET /plans  — plan bilgilerini döndür
// ─────────────────────────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.status(200).json({
    success: true,
    provider: getActiveProvider(),
    data: PLANS,
  });
});

// ─────────────────────────────────────────────────────────────
//  POST /checkout  — ödeme başlat (Stripe veya iyzico)
// ─────────────────────────────────────────────────────────────
router.post('/checkout', protect, asyncHandler(async (req, res, next) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return next(new ErrorResponse('Geçersiz plan', 400));

  const provider = getActiveProvider();

  // ── Ödeme sistemi henüz aktif değil ──────────────────────
  if (provider === 'none') {
    return res.status(503).json({
      success: false,
      paymentDisabled: true,
      message: 'Ödeme sistemi henüz aktif değil. Lütfen daha sonra tekrar deneyin.',
    });
  }

  const user = await User.findById(req.user.id);
  const planData = PLANS[plan];

  // ── STRIPE ───────────────────────────────────────────────
  if (provider === 'stripe') {
    const stripe = getStripe();

    // Stripe müşteri oluştur (bir kez)
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      user.subscription = user.subscription || {};
      user.subscription.stripeCustomerId = customerId;
      await user.save({ validateBeforeSave: false });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planData.stripe_price_id, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url:  `${process.env.CLIENT_URL}/pricing`,
      metadata:    { userId: req.user.id, plan },
    });

    return res.status(200).json({ success: true, provider: 'stripe', checkoutUrl: session.url });
  }

  // ── IYZICO ───────────────────────────────────────────────
  if (provider === 'iyzico') {
    const iyzipay = getIyzico();
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '85.34.78.112';
    const nameParts = (user.name || 'X Neu').split(' ');
    const firstName = nameParts[0];
    const lastName  = nameParts.slice(1).join(' ') || 'User';
    const basketId  = `${plan}-${user._id}-${Date.now()}`;
    const convId    = `xneu-${user._id.toString().slice(-8)}-${Date.now()}`;

    const request = {
      locale:       'tr',
      conversationId: convId,
      price:        planData.amountStr,
      paidPrice:    planData.amountStr,
      currency:     'TRY',
      basketId,
      paymentGroup: 'SUBSCRIPTION',
      callbackUrl:  `${process.env.BACKEND_URL || process.env.CLIENT_URL}/api/v1/payments/iyzico/callback`,
      enabledInstallments: ['1', '2', '3', '6', '9'],
      buyer: {
        id:             user._id.toString(),
        name:           firstName,
        surname:        lastName,
        identityNumber: '11111111111', // iyzico zorunlu kılar — gerçek entegrasyonda kullanıcıdan alın
        email:          user.email,
        gsmNumber:      user.phone || '+905350000000',
        registrationDate: user.createdAt?.toISOString().slice(0, 10) || '2024-01-01',
        lastLoginDate:    new Date().toISOString().slice(0, 10),
        registrationAddress: 'Türkiye',
        ip,
        city:    'Istanbul',
        country: 'Turkey',
        zipCode: '34000',
      },
      shippingAddress: {
        contactName: `${firstName} ${lastName}`,
        city:    'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
        zipCode: '34000',
      },
      billingAddress: {
        contactName: `${firstName} ${lastName}`,
        city:    'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
        zipCode: '34000',
      },
      basketItems: [{
        id:        plan,
        name:      `X-Neu ${planData.name} Abonelik`,
        category1: 'SaaS',
        category2: 'Subscription',
        itemType:  'VIRTUAL',
        price:     planData.amountStr,
      }],
    };

    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    if (result.status !== 'success') {
      return next(new ErrorResponse(`iyzico hatası: ${result.errorMessage || 'Bilinmeyen hata'}`, 400));
    }

    // Token'ı geçici olarak user'a kaydet (callback'te plan güncellemek için)
    user.subscription = user.subscription || {};
    user.subscription.iyzicoToken = result.token;
    user.subscription.iyzicoTokenPlan = plan;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      provider: 'iyzico',
      iyzicoFormContent: result.checkoutFormContent,
      iyzicoToken: result.token,
    });
  }
}));

// ─────────────────────────────────────────────────────────────
//  POST /iyzico/callback  — iyzico 3D callback (server-side)
//  iyzico bu URL'e form POST eder, sonuç doğrulanır
// ─────────────────────────────────────────────────────────────
router.post('/iyzico/callback', express.urlencoded({ extended: true }), asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);

  try {
    const iyzipay = getIyzico();

    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormResult.retrieve({ locale: 'tr', token }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?reason=${encodeURIComponent(result.errorMessage || 'Ödeme başarısız')}`);
    }

    // Kullanıcıyı token'dan bul ve planı güncelle
    const user = await User.findOne({ 'subscription.iyzicoToken': token });
    if (user) {
      const plan = user.subscription.iyzicoTokenPlan || 'basic';
      await User.findByIdAndUpdate(user._id, {
        'subscription.plan':              plan,
        'subscription.status':            'active',
        'subscription.iyzicoPaymentId':   result.paymentId,
        'subscription.startDate':         new Date(),
        'subscription.endDate':           new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        $unset: { 'subscription.iyzicoToken': '', 'subscription.iyzicoTokenPlan': '' },
      });
    }

    res.redirect(`${process.env.CLIENT_URL}/payment/success?plan=${user?.subscription?.iyzicoTokenPlan || ''}`);
  } catch (err) {
    console.error('iyzico callback error:', err);
    res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
  }
}));

// ─────────────────────────────────────────────────────────────
//  POST /webhook  — Stripe webhook
// ─────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await User.findByIdAndUpdate(session.metadata.userId, {
        'subscription.plan':                   session.metadata.plan,
        'subscription.status':                 'active',
        'subscription.stripeSubscriptionId':   session.subscription,
        'subscription.startDate':              new Date(),
        'subscription.endDate':                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await User.findOneAndUpdate(
        { 'subscription.stripeSubscriptionId': sub.id },
        { 'subscription.status': 'cancelled', 'subscription.plan': 'free' }
      );
      break;
    }
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────────
//  GET /subscription  — mevcut abonelik bilgisi
// ─────────────────────────────────────────────────────────────
router.get('/subscription', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('subscription');
  res.status(200).json({
    success: true,
    provider: getActiveProvider(),
    data: user.subscription,
  });
}));

module.exports = router;

