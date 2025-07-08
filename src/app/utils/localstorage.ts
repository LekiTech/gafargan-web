const UID_STORAGE_KEY = 'uid';

export function getUid(): string | undefined {
  return localStorage.getItem(UID_STORAGE_KEY) ?? undefined;
}

export function createUid(): string {
  const uuid = generateUuidSafe(); //self.crypto.randomUUID();
  localStorage.setItem(UID_STORAGE_KEY, uuid);
  return uuid;
}

function generateUuidSafe(): string {
  if (!('randomUUID' in self.crypto)) {
    return '[1e7]+-1e3+-4e3+-8e3+-1e11'.replace(/[018]/g, (c) =>
      ((c as any) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
    );
  }
  return self.crypto.randomUUID();
}
