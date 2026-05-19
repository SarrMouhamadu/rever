const { verifyToken } = require('./auth');

// Store active SSE connections: userId -> Set of res objects
const clients = new Map();

// Helper to register client connection
const addClient = (userId, res) => {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId).add(res);
};

// Helper to remove client connection
const removeClient = (userId, res) => {
  if (clients.has(userId)) {
    const userClients = clients.get(userId);
    userClients.delete(res);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  }
};

// Send a single SSE payload to a specific response channel
const sendSSE = (res, eventName, data) => {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// Send heartbeat pings to all active connections every 15s to prevent timeouts
setInterval(() => {
  for (const [userId, userClients] of clients.entries()) {
    for (const res of userClients) {
      try {
        res.write(': ping\n\n');
      } catch (err) {
        // Connection is broken, cleanup
        removeClient(userId, res);
      }
    }
  }
}, 15000);

/**
 * Send a direct notification to a specific user
 */
const sendDirectNotification = (receiverId, payload) => {
  const rId = parseInt(receiverId, 10);
  if (clients.has(rId)) {
    for (const res of clients.get(rId)) {
      try {
        sendSSE(res, 'message', payload);
      } catch (err) {
        removeClient(rId, res);
      }
    }
  }
};

/**
 * Broadcast a notification to all active users (except optionally the sender)
 */
const broadcastNotification = (payload, senderId = null) => {
  const sId = senderId ? parseInt(senderId, 10) : null;
  for (const [userId, userClients] of clients.entries()) {
    if (sId && userId === sId) continue; // Skip sender
    for (const res of userClients) {
      try {
        sendSSE(res, 'new-post', payload);
      } catch (err) {
        removeClient(userId, res);
      }
    }
  }
};

module.exports = {
  addClient,
  removeClient,
  sendDirectNotification,
  broadcastNotification
};
