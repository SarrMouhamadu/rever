const webpush = require('web-push');
const db = require('../database');
const { hasActiveConnection } = require('./notificationHub');

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@annonyme.pro';
const APP_URL = (process.env.APP_URL || 'https://annonyme.pro').replace(/\/$/, '');

let vapidReady = false;

if (PUBLIC_KEY && PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
    vapidReady = true;
  } catch (err) {
    console.error('[Push] Configuration VAPID invalide:', err.message);
  }
} else if (process.env.NODE_ENV === 'production') {
  console.warn('[Push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY manquants — Web Push désactivé.');
}

const isPushEnabled = () => vapidReady;

const getPublicKey = () => PUBLIC_KEY || null;

const sendPushToSubscription = async (subscription, payload) => {
  if (!vapidReady) return false;
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await db.deletePushSubscription(subscription.endpoint);
    }
    return false;
  }
};

const sendPushToUser = async (userId, { title, body, url, tag }) => {
  if (!vapidReady || !userId) return;
  // App ouverte : SSE + bannière navigateur suffisent, évite le doublon push
  if (hasActiveConnection(userId)) return;
  const hideContent = false;
  const payload = {
    title: title || 'Anonyme Pro',
    body: hideContent ? 'Nouvelle activité sur Anonyme Pro' : (body || ''),
    url: url || `${APP_URL}/`,
    tag: tag || 'rever',
  };
  try {
    const subs = await db.getPushSubscriptionsForUser(userId);
    await Promise.allSettled(subs.map((sub) => sendPushToSubscription(sub, payload)));
  } catch (err) {
    console.error('[Push] sendPushToUser error:', err);
  }
};

module.exports = {
  isPushEnabled,
  getPublicKey,
  sendPushToUser,
  APP_URL,
};
