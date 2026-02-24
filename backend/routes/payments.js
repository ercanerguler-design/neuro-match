const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { protect } = require('../middleware/auth');

const PLANS = {
  basic: { priceId: 'price_basic', amount: 9900, name: 'Basic', currency: 'try' },     // 99 TL
  premium: { priceId: 'price_premium', amount: 29900, name: 'Premium', currency: 'try' }, // 299 TL
  enterprise: { priceId: 'price_enterprise', amount: 199900, name: 'Enterprise', currency: 'try' }, // 1999 TL
};

// Get plans
router.get('/plans', (req, res) => {
  res.status(200).json({ success: true, data: PLANS });
});

// Create checkout session
router.post('/checkout', protect, asyncHandler(async (req, res, next) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return next(new ErrorResponse('Geçersiz plan', 400));

  const user = await User.findById(req.user.id);

  let customerId = user.subscription.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name });
    customerId = customer.id;
    user.subscription.stripeCustomerId = customerId;
    await user.save({ validateBeforeSave: false });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/pricing`,
    metadata: { userId: req.user.id, plan },
  });

  res.status(200).json({ success: true, checkoutUrl: session.url });
}));

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await User.findByIdAndUpdate(session.metadata.userId, {
        'subscription.plan': session.metadata.plan,
        'subscription.status': 'active',
        'subscription.stripeSubscriptionId': session.subscription,
        'subscription.startDate': new Date(),
        'subscription.endDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await User.findOneAndUpdate(
        { 'subscription.stripeSubscriptionId': subscription.id },
        { 'subscription.status': 'cancelled', 'subscription.plan': 'free' }
      );
      break;
    }
  }

  res.json({ received: true });
});

// Get subscription info
router.get('/subscription', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('subscription');
  res.status(200).json({ success: true, data: user.subscription });
}));

module.exports = router;
