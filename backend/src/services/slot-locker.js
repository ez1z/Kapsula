const LOCK_TTL_SECONDS = 300;

export async function lockSlot(redis, slotId, sessionId) {
  const key = `slot:${slotId}:lock`;
  const result = await redis.set(key, sessionId, 'EX', LOCK_TTL_SECONDS, 'NX');
  return result === 'OK';
}

export async function unlockSlot(redis, slotId, sessionId) {
  const key = `slot:${slotId}:lock`;
  const currentHolder = await redis.get(key);
  if (currentHolder === sessionId) {
    await redis.del(key);
    return true;
  }
  return false;
}

export async function isSlotLocked(redis, slotId) {
  const key = `slot:${slotId}:lock`;
  const holder = await redis.get(key);
  return holder !== null;
}

export async function getSlotLockHolder(redis, slotId) {
  const key = `slot:${slotId}:lock`;
  return redis.get(key);
}