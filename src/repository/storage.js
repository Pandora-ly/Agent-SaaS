const STORAGE_PREFIX = 'agent_saas_';

export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    // 可能因配额超限或隐私模式失败
    console.error('localStorage 写入失败:', e);
    return false;
  }
}

export function removeItem(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
