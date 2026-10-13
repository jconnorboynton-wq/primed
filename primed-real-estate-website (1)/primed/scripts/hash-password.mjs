// Usage: node scripts/hash-password.mjs "your long passphrase"
// Prints an ADMIN_PASSWORD_HASH value for your .env file.
import { scryptSync, randomBytes } from "node:crypto";
const pw = process.argv[2];
if (!pw || pw.length < 12) {
  console.error("Provide a passphrase of at least 12 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(pw, salt, 64);
console.log(`scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
