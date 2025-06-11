const UID_STORAGE_KEY = 'uid';

export function getUid(): string | undefined {
  return localStorage.getItem(UID_STORAGE_KEY) ?? undefined;
}

export function createUid(): string {
  const uuid = self.crypto.randomUUID();
  localStorage.setItem(UID_STORAGE_KEY, uuid);
  return uuid;
}
