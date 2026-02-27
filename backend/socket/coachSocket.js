const jwt = require('jsonwebtoken');
const User = require('../models/User');
const neuroAI = require('../ai/neuroAI');
const logger = require('../utils/logger');

module.exports = (io) => {
  // Authenticate socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.user.name}`);
    socket.join(`user_${socket.user._id}`);

    // Real-time coach chat
    socket.on('coach:message', async ({ message }) => {
      try {
        socket.emit('coach:typing', { isTyping: true });

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.startsWith('sk-your')) {
          socket.emit('coach:complete', { fullResponse: 'Merhaba! AI koç şu an demo modunda. Gerçek cevaplar için OpenAI API anahtarı ekleyin.' });
          return;
        }
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey });

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sen X-Neu AI koçusun. Kullanıcı: ${socket.user.name}, Beyin tipi: ${socket.user.neuroProfile?.brainType || 'belirlenmedi'}. Kısa, kişiselleştirilmiş, motive edici cevaplar ver. Türkçe yaz.`,
            },
            { role: 'user', content: message },
          ],
          temperature: 0.8,
          max_tokens: 400,
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            socket.emit('coach:stream', { content });
          }
        }

        socket.emit('coach:typing', { isTyping: false });
        socket.emit('coach:complete', { fullResponse });
      } catch (error) {
        socket.emit('coach:error', { message: 'AI koç şu an meşgul, lütfen tekrar deneyin.' });
        logger.error(`Coach socket error: ${error.message}`);
      }
    });

    // Real-time mood tracking
    socket.on('mood:update', async ({ mood, energy, stress }) => {
      try {
        const user = await User.findById(socket.user._id);
        const lastCheckin = user.dailyCheckin[user.dailyCheckin.length - 1];
        const today = new Date().toDateString();

        if (lastCheckin && new Date(lastCheckin.date).toDateString() === today) {
          lastCheckin.mood = mood;
          lastCheckin.energy = energy;
          lastCheckin.stress = stress;
        } else {
          user.dailyCheckin.push({ date: new Date(), mood, energy, stress });
        }

        await user.save({ validateBeforeSave: false });

        // Send quick AI insight
        const insight = stress > 7
          ? `Stres seviyeniz yüksek. ${user.neuroProfile?.brainType === 'analytical' ? '5 dakika derin nefes egzersizi yapın.' : 'Sevdiğiniz biriyle konuşun.'}`
          : energy < 4
          ? 'Enerji düşük. Kısa bir yürüyüş veya 10 dakika uyku yardımcı olabilir.'
          : 'Harika! Bu enerji seviyenizde en zorlu görevlerinizi yapabilirsiniz.';

        socket.emit('mood:insight', { insight });
      } catch (error) {
        logger.error(`Mood update error: ${error.message}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.user?.name}`);
    });
  });
};
