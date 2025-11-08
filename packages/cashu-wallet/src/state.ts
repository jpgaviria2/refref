import { InMemoryWalletStorage, WalletStorageAdapter } from "./storage";
import type { WalletProof } from "./storage";

type Listener<T> = (value: T) => void;

export interface WalletState {
  proofs: WalletProof[];
}

export class WalletStore {
  private listeners = new Set<Listener<WalletState>>();
  private currentState: WalletState = { proofs: [] };
  private unsubscribeStorage?: { unsubscribe(): void };

  constructor(private readonly storage: WalletStorageAdapter) {
    this.subscribeToStorage();
  }

  private subscribeToStorage() {
    this.unsubscribeStorage?.unsubscribe();
    this.unsubscribeStorage = this.storage.observeProofs((proofs) => {
      this.setState({ proofs });
    });
  }

  getState(): WalletState {
    return this.currentState;
  }

  subscribe(listener: Listener<WalletState>) {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async addProofs(proofs: WalletProof[]) {
    await this.storage.addProofs(proofs);
  }

  async removeProofs(secretIds: string[]) {
    await this.storage.removeProofs(secretIds);
  }

  private setState(state: WalletState) {
    this.currentState = state;
    this.listeners.forEach((listener) => listener(state));
  }
}

export function createWalletStore(storage?: WalletStorageAdapter) {
  return new WalletStore(storage ?? new InMemoryWalletStorage());
}

