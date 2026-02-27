const User = require('../models/User');
const logger = require('./logger');

const BADGE_DEFS = [
  { id: 'first_analysis',   name: 'İlk Analiz',     emoji: '🧠', xp: 100, desc: 'İlk nörolojik analizini tamamladın' },
  { id: 'first_match',      name: 'İlk Eşleşme',    emoji: '💑', xp: 50,  desc: 'İlk nörolojik eşleşmeni yaptın' },
  { id: 'first_coach',      name: 'AI Koç',         emoji: '🤖', xp: 30,  desc: 'AI koçunla ilk seansını yaptın' },
  { id: 'streak_3',         name: '3 Gün Streak',   emoji: '🔥', xp: 75,  desc: '3 gün üst üste check-in yaptın' },
  { id: 'streak_7',         name: '7 Gün Streak',   emoji: '🌟', xp: 150, desc: '7 gün üst üste check-in yaptın' },
  { id: 'streak_30',        name: 'Aylık Streak',   emoji: '🏆', xp: 500, desc: '30 gün üst üste check-in yaptın' },
  { id: 'full_profile',     name: 'Tam Profil',     emoji: '✅', xp: 80,  desc: 'Profilini tamamen doldurdun' },
  { id: 'five_reports',     name: 'Rapor Ustası',   emoji: '📊', xp: 200, desc: '5 rapor oluşturdun' },
  { id: 'perfect_score',    name: 'Nöro Master',    emoji: '⚡', xp: 300, desc: '90+ nöro skoru elde ettin' },
  { id: 'level_5',          name: 'Seviye 5',       emoji: '🎯', xp: 0,   desc: 'Seviye 5\'e ulaştın' },
  { id: 'level_10',         name: 'Nöro Legend',    emoji: '👑', xp: 0,   desc: 'Seviye 10\'a ulaştın' },
];

// XP thresholds per level
function xpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function getLevelFromXP(xp) {
  let level = 1;
  let totalXP = 0;
  while (totalXP + xpForLevel(level) <= xp) {
    totalXP += xpForLevel(level);
    level++;
  }
  return { level, currentXP: xp - totalXP, neededXP: xpForLevel(level) };
}

async function awardXP(userId, amount, reason) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const prevXP = user.gamification?.xp || 0;
    const newXP = prevXP + amount;
    const prevLevel = user.gamification?.level || 1;
    const { level: newLevel } = getLevelFromXP(newXP);

    user.gamification = user.gamification || {};
    user.gamification.xp = newXP;
    user.gamification.level = newLevel;

    // Level badges
    if (newLevel >= 5 && prevLevel < 5) await _awardBadge(user, 'level_5');
    if (newLevel >= 10 && prevLevel < 10) await _awardBadge(user, 'level_10');

    await user.save();
    logger.info(`XP +${amount} → ${user.name} (${reason}). Total: ${newXP} [Lv${newLevel}]`);
    return { newXP, newLevel, levelUp: newLevel > prevLevel };
  } catch (err) {
    logger.error(`awardXP error: ${err.message}`);
  }
}

async function _awardBadge(user, badgeId) {
  const alreadyHas = (user.gamification?.badges || []).some(b => b.id === badgeId);
  if (alreadyHas) return;
  const def = BADGE_DEFS.find(b => b.id === badgeId);
  if (!def) return;
  user.gamification.badges = user.gamification.badges || [];
  user.gamification.badges.push({ id: def.id, name: def.name, emoji: def.emoji, earnedAt: new Date() });
  if (def.xp > 0) {
    user.gamification.xp = (user.gamification.xp || 0) + def.xp;
    const { level } = getLevelFromXP(user.gamification.xp);
    user.gamification.level = level;
  }
}

async function awardBadge(userId, badgeId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    await _awardBadge(user, badgeId);
    await user.save();
    logger.info(`Badge [${badgeId}] → ${user.name}`);
  } catch (err) {
    logger.error(`awardBadge error: ${err.message}`);
  }
}

async function updateStreak(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date().toDateString();
    const lastDate = user.gamification?.lastCheckinDate
      ? new Date(user.gamification.lastCheckinDate).toDateString()
      : null;

    if (lastDate === today) return; // already checked in today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastDate === yesterday.toDateString();

    user.gamification = user.gamification || {};
    user.gamification.streak = isConsecutive ? (user.gamification.streak || 0) + 1 : 1;
    user.gamification.lastCheckinDate = new Date();

    const streak = user.gamification.streak;
    if (streak >= 3  && !(user.gamification.badges||[]).some(b=>b.id==='streak_3'))  await _awardBadge(user, 'streak_3');
    if (streak >= 7  && !(user.gamification.badges||[]).some(b=>b.id==='streak_7'))  await _awardBadge(user, 'streak_7');
    if (streak >= 30 && !(user.gamification.badges||[]).some(b=>b.id==='streak_30')) await _awardBadge(user, 'streak_30');

    await user.save();
    await awardXP(userId, 20, 'daily-checkin');
    return streak;
  } catch (err) {
    logger.error(`updateStreak error: ${err.message}`);
  }
}

module.exports = { awardXP, awardBadge, updateStreak, getLevelFromXP, xpForLevel, BADGE_DEFS };
