export interface EncryptedEnvelope {
  version: number;
  ciphertext: string; // Base64
  iv: string;         // Base64 (12 bytes)
  salt: string;       // Base64 (16 bytes)
  checksum: string;   // SHA-256 of plaintext
  timestamp: string;
}

const PBKDF2_ITERATIONS = 100000;

function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  // Node.js environment
  const cryptoModule = (globalThis as any).crypto;
  if (cryptoModule) return cryptoModule;
  throw new Error('Web Crypto API is not available in this environment');
}

export async function encryptPayload(plaintext: string, passphrase: string): Promise<EncryptedEnvelope> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  // 1. Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 2. Import passphrase as key material
  const passKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // 3. Derive AES-GCM key via PBKDF2
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // 4. Calculate SHA-256 checksum of plaintext
  const plaintextBytes = encoder.encode(plaintext);
  const hashBuffer = await crypto.subtle.digest('SHA-256', plaintextBytes);
  const checksum = bufferToHex(hashBuffer);

  // 5. Encrypt with AES-GCM
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    aesKey,
    plaintextBytes
  );

  return {
    version: 1,
    ciphertext: bufferToBase64(new Uint8Array(ciphertextBuffer)),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    checksum,
    timestamp: new Date().toISOString(),
  };
}

export async function decryptPayload(envelope: EncryptedEnvelope, passphrase: string): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const salt = base64ToBuffer(envelope.salt);
  const iv = base64ToBuffer(envelope.iv);
  const ciphertext = base64ToBuffer(envelope.ciphertext);

  // 1. Import passphrase
  const passKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // 2. Derive AES-GCM key
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 3. Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    aesKey,
    ciphertext as any
  );

  const plaintext = decoder.decode(decryptedBuffer);

  // 4. Verify checksum
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(plaintext));
  const calcChecksum = bufferToHex(hashBuffer);
  if (calcChecksum !== envelope.checksum) {
    throw new Error('Integrity check failed: Checksum mismatch');
  }

  return plaintext;
}

function bufferToBase64(buf: Uint8Array): string {
  let binary = '';
  const len = buf.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
