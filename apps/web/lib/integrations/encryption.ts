/**
 * AES-256-GCM Encryption Utilities for Integration Credentials
 *
 * SECURITY NOTES:
 * - Uses AES-256-GCM for authenticated encryption
 * - Generates random IV for each encryption
 * - Stores IV with ciphertext (IV:AuthTag:Ciphertext format)
 * - Encryption key must be 32 bytes (256 bits)
 * - Key should be stored in environment variable
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment variable
 * Key must be 32 bytes (64 hex characters)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY;

  if (!key) {
    throw new Error('INTEGRATION_ENCRYPTION_KEY environment variable is not set');
  }

  // Convert hex string to buffer
  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
  }

  return keyBuffer;
}

/**
 * Generate a new encryption key (for setup)
 * Run this once and store in environment variable
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt credentials object
 *
 * @param credentials - Plain object with credential fields
 * @returns Encrypted string in format: IV:AuthTag:Ciphertext (all hex)
 */
export function encryptCredentials(credentials: Record<string, any>): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    // Convert credentials to JSON string
    const plaintext = JSON.stringify(credentials);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine IV:AuthTag:Ciphertext
    const result = [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted
    ].join(':');

    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt credentials');
  }
}

/**
 * Decrypt credentials string
 *
 * @param encryptedData - Encrypted string in format: IV:AuthTag:Ciphertext
 * @returns Decrypted credentials object
 */
export function decryptCredentials(encryptedData: string): Record<string, any> {
  try {
    const key = getEncryptionKey();

    // Split IV:AuthTag:Ciphertext
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, ciphertext] = parts;

    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Parse JSON
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt credentials');
  }
}

/**
 * Validate that credentials can be encrypted and decrypted
 * Useful for testing encryption setup
 */
export function testEncryption(): boolean {
  try {
    const testData = { test: 'value', foo: 'bar' };
    const encrypted = encryptCredentials(testData);
    const decrypted = decryptCredentials(encrypted);

    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}
