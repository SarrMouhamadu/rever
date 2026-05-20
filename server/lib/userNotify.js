const db = require('../database');
const { sendDirectNotification } = require('./notificationHub');
const { sendPushToUser, APP_URL } = require('./pushService');

/**
 * Notifie un utilisateur : base de données + SSE (app ouverte) + Web Push (app fermée).
 */
const notifyUser = async (userId, options) => {
  const {
    type,
    sourceId,
    actorId,
    message,
    pushTitle = 'Anonyme Pro',
    pushBody,
    url = `${APP_URL}/`,
    sseEvent,
    ssePayload,
  } = options;

  const uid = parseInt(userId, 10);
  const aid = actorId != null ? parseInt(actorId, 10) : null;
  if (!uid || (aid != null && uid === aid)) return;

  await db.createNotificationForUser(uid, type, sourceId, aid, message);

  if (ssePayload && sseEvent) {
    sendDirectNotification(uid, ssePayload, sseEvent);
  }

  await sendPushToUser(uid, {
    title: pushTitle,
    body: pushBody || message,
    url,
    tag: `${type}-${sourceId || 'n'}`,
  });
};

/**
 * Notifie tous les utilisateurs sauf l'acteur (posts publics, publications coach).
 */
const notifyAllExcept = async (actorId, options) => {
  const {
    type,
    sourceId,
    message,
    pushTitle = 'Anonyme Pro',
    pushBody,
    url = `${APP_URL}/`,
    sseBroadcast,
  } = options;

  const aid = parseInt(actorId, 10);
  await db.createNotificationForAll(type, sourceId, aid, message);

  if (sseBroadcast) {
    const { broadcastNotification } = require('./notificationHub');
    broadcastNotification(sseBroadcast.payload, aid, sseBroadcast.eventName);
  }

  try {
    const { rows: users } = await db.query('SELECT id FROM users WHERE id != $1', [aid]);
    await Promise.allSettled(
      users.map((u) =>
        sendPushToUser(u.id, {
          title: pushTitle,
          body: pushBody || message,
          url,
          tag: `${type}-${sourceId || 'n'}`,
        })
      )
    );
  } catch (err) {
    console.error('[Notify] notifyAllExcept push error:', err);
  }
};

module.exports = { notifyUser, notifyAllExcept };
