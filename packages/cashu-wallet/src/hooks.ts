import { useSyncExternalStore } from "react";
import { WalletStore, createWalletStore } from "./state";

const defaultStore = createWalletStore();

export function useWalletStore(store: WalletStore = defaultStore) {
  const state = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getState(),
    () => store.getState(),
  );

  return state;
}

