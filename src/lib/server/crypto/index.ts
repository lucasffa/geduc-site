import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, createHash } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = 'sha512';
const AUTH_TAG_LENGTH = 16;

/**
 * Derive a 256-bit key from a password using PBKDF2.
 */
function deriveKey(password: string, salt: Buffer): Buffer {
	return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
}

/**
 * Encrypt plaintext using AES-256-GCM with a password-derived key.
 * Returns base64-encoded ciphertext, iv, and salt.
 */
export function encrypt(
	plaintext: string,
	password: string
): { ciphertext: string; iv: string; salt: string } {
	const salt = randomBytes(SALT_LENGTH);
	const key = deriveKey(password, salt);
	const iv = randomBytes(IV_LENGTH);

	const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();

	// Concatenate encrypted data + auth tag
	const combined = Buffer.concat([encrypted, authTag]);

	return {
		ciphertext: combined.toString('base64'),
		iv: iv.toString('base64'),
		salt: salt.toString('base64')
	};
}

/**
 * Decrypt ciphertext using AES-256-GCM with a password-derived key.
 */
export function decrypt(
	ciphertextB64: string,
	ivB64: string,
	saltB64: string,
	password: string
): string {
	const salt = Buffer.from(saltB64, 'base64');
	const key = deriveKey(password, salt);
	const iv = Buffer.from(ivB64, 'base64');
	const combined = Buffer.from(ciphertextB64, 'base64');

	// Split encrypted data and auth tag
	const encrypted = combined.subarray(0, combined.length - AUTH_TAG_LENGTH);
	const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);

	const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
	return decrypted.toString('utf8');
}

/**
 * Compute SHA-256 hex digest of arbitrary data.
 * Used for audit log integrity and API key fingerprinting.
 */
export function hashDigest(data: string): string {
	return createHash('sha256').update(data, 'utf8').digest('hex');
}
