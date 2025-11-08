import { liveQuery } from "dexie";

export interface WalletProof {
  id: string;
  secret: string;
  amount: number;
  mintId: string;
  reserved?: boolean;
}

export interface WalletStorageAdapter {
  addProofs(proofs: WalletProof[]): Promise<void>;
  removeProofs(secretIds: string[]): Promise<void>;
  listProofs(): Promise<WalletProof[]>;
  observeProofs(
    callback: (proofs: WalletProof[]) => void,
  ): { unsubscribe(): void };
}

export class InMemoryWalletStorage implements WalletStorageAdapter {
  private proofs = new Map<string, WalletProof>();
  private listeners = new Set<(proofs: WalletProof[]) => void>();

  async addProofs(proofs: WalletProof[]): Promise<void> {
    proofs.forEach((proof) => this.proofs.set(proof.secret, { ...proof }));
    this.notify();
  }

  async removeProofs(secretIds: string[]): Promise<void> {
    secretIds.forEach((id) => this.proofs.delete(id));
    this.notify();
  }

  async listProofs(): Promise<WalletProof[]> {
    return Array.from(this.proofs.values());
  }

  observeProofs(callback: (proofs: WalletProof[]) => void) {
    this.listeners.add(callback);
    callback(Array.from(this.proofs.values()));
    return {
      unsubscribe: () => this.listeners.delete(callback),
    };
  }

  private notify() {
    const snapshot = Array.from(this.proofs.values());
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export class DexieWalletStorage implements WalletStorageAdapter {
  constructor(private readonly db: Dexie, private readonly tableName = "proofs") {}

  private table() {
    return this.db.table<WalletProof>(this.tableName);
  }

  async addProofs(proofs: WalletProof[]): Promise<void> {
    await this.table().bulkPut(proofs);
  }

  async removeProofs(secretIds: string[]): Promise<void> {
    await this.table().bulkDelete(secretIds);
  }

  async listProofs(): Promise<WalletProof[]> {
    return this.table().toArray();
  }

  observeProofs(callback: (proofs: WalletProof[]) => void) {
    const subscription = liveQuery(() => this.table().toArray()).subscribe({
      next: callback,
      error: (err) => console.error("DexieWalletStorage subscribe error", err),
    });
    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
}

