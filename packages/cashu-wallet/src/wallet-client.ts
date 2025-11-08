import { MintConfig, WalletConfig } from "./types";
import { CashuMint, CashuWallet, getDecodedToken, Token } from '@cashu/cashu-ts';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export interface MintInstance {
  mint: CashuMint;
  wallet: CashuWallet;
  info: any;
}

export interface ReceiveResult {
  proofs: any[];
  amount: number;
}

/**
 * Wallet client that handles real Cashu operations
 */
export class WalletClient {
  private readonly mintsById: Map<string, MintConfig>;
  private activeMintId?: string;
  private mintInstances: Map<string, MintInstance> = new Map();
  private mnemonic: string;

  constructor(private readonly config: WalletConfig, mnemonic?: string) {
    // Set default mint to MiniBits
    const defaultMints = [
      {
        id: 'minibits',
        url: 'https://mint.minibits.cash/Bitcoin',
        label: 'MiniBits',
      }
    ];

    const allMints = [...defaultMints, ...(config.mints ?? [])];
    this.mintsById = new Map(
      allMints.map((mint) => [mint.id, { ...mint }]),
    );

    // Generate or use provided mnemonic
    this.mnemonic = mnemonic || this.generateMnemonic();
    this.activeMintId = 'minibits'; // Default to MiniBits
  }

  private generateMnemonic(): string {
    return generateMnemonic(wordlist);
  }

  getMnemonic(): string {
    return this.mnemonic;
  }

  validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic, wordlist);
  }

  /**
   * Initialize a mint connection
   */
  async initializeMint(mintId: string): Promise<MintInstance> {
    const mintConfig = this.mintsById.get(mintId);
    if (!mintConfig) {
      throw new Error(`Mint ${mintId} not found`);
    }

    if (this.mintInstances.has(mintId)) {
      return this.mintInstances.get(mintId)!;
    }

    const mint = new CashuMint(mintConfig.url);
    const info = await mint.getInfo();
    const keysets = await mint.getKeySets();

    // Find active sat keyset
    const activeKeyset = keysets.keysets.find(k => k.active && k.unit === 'sat');
    if (!activeKeyset) {
      throw new Error(`No active sat keyset found for mint ${mintId}`);
    }

    // Get keys for the keyset
    const keys = await mint.getKeys(activeKeyset.id);

    // Create wallet instance
    const seed = mnemonicToSeedSync(this.mnemonic);
    const wallet = new CashuWallet(mint, {
      keys: keys.keysets[0],
      unit: 'sat',
      seed,
    });

    const instance: MintInstance = { mint, wallet, info };
    this.mintInstances.set(mintId, instance);
    return instance;
  }

  /**
   * Receive tokens from a Cashu token string
   */
  async receiveTokens(tokenStr: string): Promise<ReceiveResult> {
    const token: Token = getDecodedToken(tokenStr);
    const mintUrl = token.mint || token.token[0].mint;

    // Find mint config by URL
    const mintConfig = Array.from(this.mintsById.values()).find(m => m.url === mintUrl);
    if (!mintConfig) {
      throw new Error(`Unknown mint: ${mintUrl}`);
    }

    const instance = await this.initializeMint(mintConfig.id);
    const proofs = token.token[0].proofs;

    // Receive the proofs
    const receivedProofs = await instance.wallet.receive(proofs);
    const amount = proofs.reduce((sum, p) => sum + p.amount, 0);

    return { proofs: receivedProofs, amount };
  }

  /**
   * Returns the list of configured mints.
   */
  getMints(): MintConfig[] {
    return Array.from(this.mintsById.values());
  }

  /**
   * Fetches a mint by ID.
   */
  getMint(id: string): MintConfig | undefined {
    return this.mintsById.get(id);
  }

  /**
   * Returns the default mint (MiniBits).
   */
  getDefaultMint(): MintConfig | undefined {
    return this.mintsById.get('minibits');
  }

  /**
   * Sets the active mint by id. Returns true if the mint exists.
   */
  setActiveMint(mintId: string): boolean {
    if (!this.mintsById.has(mintId)) {
      return false;
    }
    this.activeMintId = mintId;
    return true;
  }

  /**
   * Returns the current active mint id.
   */
  getActiveMintId(): string | undefined {
    return this.activeMintId;
  }

  /**
   * Generates a deterministic hash for a participant identifier.
   * This will be used later to derive local storage keys and references.
   */
  deriveParticipantKey(participantId: string): string {
    return `${participantId}`.trim();
  }

  /**
   * Placeholder for the default currency configured in the wallet.
   */
  getDefaultCurrency(): string | undefined {
    return this.config.defaultCurrency || 'sat';
  }
}

