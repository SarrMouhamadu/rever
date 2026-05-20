export function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Merge axios config with X-Idempotency-Key header */
export function withIdempotency(config = {}, key = generateIdempotencyKey()) {
  return {
    ...config,
    idempotencyKey: key,
    headers: {
      ...(config.headers || {}),
      'X-Idempotency-Key': key,
    },
  };
}

export function generateClientId(prefix = 'tmp') {
  return `${prefix}-${generateIdempotencyKey()}`;
}
