/**
 * Generate Encryption Key
 *
 * Generates a secure 256-bit encryption key for AES-256-GCM encryption.
 * Run this once and add the output to your .env.local file.
 *
 * Usage:
 *   node generate-key.js
 */

const crypto = require('crypto');

function generateEncryptionKey() {
  const key = crypto.randomBytes(32).toString('hex');
  return key;
}

console.log('\n=== Integration Encryption Key Generator ===\n');
console.log('Generated encryption key:');
console.log('\n' + generateEncryptionKey() + '\n');
console.log('Add this to your .env.local file:');
console.log('\nINTEGRATION_ENCRYPTION_KEY=<paste_key_above>\n');
console.log('⚠️  IMPORTANT:');
console.log('- Keep this key secret');
console.log('- Never commit it to version control');
console.log('- Use different keys for dev/staging/production');
console.log('- Store backups in a secure location\n');
