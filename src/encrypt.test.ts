import {
  encryptValue,
  decryptValue,
  isEncryptedValue,
  encryptEnv,
  decryptEnv,
} from "./encrypt";

const PASSPHRASE = "super-secret-passphrase";

describe("isEncryptedValue", () => {
  it("returns true for enc:-prefixed values", () => {
    expect(isEncryptedValue("enc:abc123")).toBe(true);
  });

  it("returns false for plain values", () => {
    expect(isEncryptedValue("plaintext")).toBe(false);
    expect(isEncryptedValue("")).toBe(false);
  });
});

describe("encryptValue / decryptValue", () => {
  it("round-trips a plain string", () => {
    const encrypted = encryptValue("my-secret", PASSPHRASE);
    expect(isEncryptedValue(encrypted)).toBe(true);
    expect(decryptValue(encrypted, PASSPHRASE)).toBe("my-secret");
  });

  it("produces different ciphertext each call (random IV/salt)", () => {
    const a = encryptValue("same", PASSPHRASE);
    const b = encryptValue("same", PASSPHRASE);
    expect(a).not.toBe(b);
  });

  it("throws on wrong passphrase", () => {
    const encrypted = encryptValue("secret", PASSPHRASE);
    expect(() => decryptValue(encrypted, "wrong-passphrase")).toThrow();
  });

  it("throws when value lacks enc: prefix", () => {
    expect(() => decryptValue("notencrypted", PASSPHRASE)).toThrow(
      "enc:"
    );
  });
});

describe("encryptEnv", () => {
  const env = { DB_PASS: "secret", PORT: "3000", API_KEY: "key123" };

  it("encrypts all keys when no key filter given", () => {
    const result = encryptEnv(env, PASSPHRASE);
    expect(isEncryptedValue(result.DB_PASS)).toBe(true);
    expect(isEncryptedValue(result.PORT)).toBe(true);
    expect(isEncryptedValue(result.API_KEY)).toBe(true);
  });

  it("encrypts only specified keys", () => {
    const result = encryptEnv(env, PASSPHRASE, ["DB_PASS"]);
    expect(isEncryptedValue(result.DB_PASS)).toBe(true);
    expect(result.PORT).toBe("3000");
    expect(result.API_KEY).toBe("key123");
  });

  it("skips already-encrypted values", () => {
    const alreadyEncrypted = encryptValue("secret", PASSPHRASE);
    const result = encryptEnv({ DB_PASS: alreadyEncrypted }, PASSPHRASE);
    expect(result.DB_PASS).toBe(alreadyEncrypted);
  });
});

describe("decryptEnv", () => {
  it("decrypts all encrypted values and leaves plain values intact", () => {
    const encrypted = encryptEnv(
      { DB_PASS: "secret", PORT: "3000" },
      PASSPHRASE,
      ["DB_PASS"]
    );
    const result = decryptEnv(encrypted, PASSPHRASE);
    expect(result.DB_PASS).toBe("secret");
    expect(result.PORT).toBe("3000");
  });
});
