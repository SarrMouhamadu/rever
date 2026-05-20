const idempotencyCache = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of idempotencyCache.entries()) {
    if (now - val.timestamp > 10 * 60 * 1000) {
      idempotencyCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

const idempotency = (req, res, next) => {
  const key = req.headers['x-idempotency-key'];
  if (!key || req.method !== 'POST') {
    return next();
  }

  const userId = req.user ? req.user.id : 'anonymous';
  const cacheKey = `${userId}:${key}`;

  if (idempotencyCache.has(cacheKey)) {
    const cached = idempotencyCache.get(cacheKey);
    if (cached.status === 'pending') {
      return cached.promise
        .then(({ statusCode, data }) => {
          res.status(statusCode).json(data);
        })
        .catch(() => {
          res.status(500).json({ error: 'Erreur lors du traitement de la requête idempotente.' });
        });
    }
    return res.status(cached.statusCode).json(cached.data);
  }

  let resolvePromise;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  idempotencyCache.set(cacheKey, {
    status: 'pending',
    promise,
    timestamp: Date.now(),
  });

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    idempotencyCache.set(cacheKey, {
      status: 'completed',
      statusCode: res.statusCode || 200,
      data: body,
      timestamp: Date.now(),
    });
    resolvePromise({ statusCode: res.statusCode || 200, data: body });
    return originalJson(body);
  };

  next();
};

module.exports = { idempotency };
