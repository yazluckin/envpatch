import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;
const ITERATIONS = 100_000;

export function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, "sha256");
}

export function encryptValue(value: string, passphrase: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(passphrase, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const result = Buffer.concat([salt, iv, tag, encrypted]);
  return "enc:" + result.toString("base64");
}

export function decryptValue(encoded: string, passphrase: string): string {
  if (!encoded.startsWith("enc:")) {
    throw new Error("Value is not encrypted (missing 'enc:' prefix)");
  }

  const data = Buffer.from(encoded.slice(4), "base64");
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final("utf8");
}

export function isEncryptedValue(value: string): boolean {
  return value.startsWith("enc:");
}

export function encryptEnv(
  env: Record<string, string>,
  passphrase: string,
  keys?: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if ((!keys || keys.includes(k)) && !isEncryptedValue(v)) {
      result[k] = encryptValue(v, passphrase);
    } else {
      result[k] = v;
    }
  }
  return result;
}

export function decryptEnv(
  env: Record<string, string>,
  passphrase: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    result[k] = isEncryptedValue(v) ? decryptValue(v, passphrase) : v;
  }
  return result;
}
