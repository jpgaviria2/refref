import { randomBytes } from "crypto";
import {
  generateMnemonic as generateMnemonicInternal,
  mnemonicToSeedSync,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

/**
 * Generates a BIP-39 mnemonic using the English word list.
 * Default entropy is 128 bits (12 words).
 */
export function generateMnemonic(entropyBytes = 16): string {
  const entropy = randomBytes(entropyBytes);
  return generateMnemonicInternal(wordlist, entropy);
}

/**
 * Validates a mnemonic against the English word list.
 */
export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic.trim(), wordlist);
}

/**
 * Converts a mnemonic to a seed (Uint8Array).
 */
export function mnemonicToSeed(mnemonic: string): Uint8Array {
  if (!isValidMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic");
  }
  return mnemonicToSeedSync(mnemonic.trim(), "");
}

/**
 * Returns the mnemonic seed encoded as a hex string.
 */
export function mnemonicToSeedHex(mnemonic: string): string {
  return Buffer.from(mnemonicToSeed(mnemonic)).toString("hex");
}

