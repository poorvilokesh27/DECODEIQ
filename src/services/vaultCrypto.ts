const PBKDF2_ITERATIONS = 310000;

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    256
  );
  return JSON.stringify({ version: 2, salt: Array.from(salt), verifier: Array.from(new Uint8Array(bits)) });
}

export async function verifyPinHash(pin: string, storedHash: string): Promise<boolean> {
  const payload = JSON.parse(storedHash) as { version?: number; salt?: number[]; verifier?: number[] };
  if (payload.version !== 2 || !Array.isArray(payload.salt) || !Array.isArray(payload.verifier)) return false;
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new Uint8Array(payload.salt) as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    256
  );
  const actual = new Uint8Array(bits);
  const expected = new Uint8Array(payload.verifier);
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

export async function encryptVaultContent(plainText: string, pin: string): Promise<string> {
  if (!crypto?.subtle) throw new Error('Web Crypto is unavailable; vault encryption cannot continue.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plainText));
  return JSON.stringify({
    version: 2,
    salt: Array.from(salt),
    iv: Array.from(iv),
    cipher: Array.from(new Uint8Array(encrypted)),
  });
}

export async function decryptVaultContent(encryptedPayload: string, pin: string): Promise<string> {
  if (!crypto?.subtle) throw new Error('Web Crypto is unavailable; vault decryption cannot continue.');
  const payload = JSON.parse(encryptedPayload) as { version?: number; salt?: number[]; iv?: number[]; cipher?: number[] };
  if (payload.version !== 2 || !Array.isArray(payload.salt) || !Array.isArray(payload.iv) || !Array.isArray(payload.cipher)) {
    throw new Error('Unsupported or corrupted vault data.');
  }
  const key = await deriveKey(pin, new Uint8Array(payload.salt));
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(payload.iv) },
    key,
    new Uint8Array(payload.cipher)
  );
  return new TextDecoder().decode(decrypted);
}
