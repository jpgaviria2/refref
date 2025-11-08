import type { z } from "zod";

export interface MintConfig {
  /**
   * Unique identifier for the mint within the project scope.
   */
  id: string;
  /**
   * Base URL for the Cashu mint.
   */
  url: string;
  /**
   * Optional label shown in UI.
   */
  label?: string;
}

export interface WalletConfig {
  /**
   * Set of mints that can be used by the wallet.
   */
  mints: MintConfig[];
  /**
   * Optional reward currency that should be considered the default.
   */
  defaultCurrency?: string;
}

export type Schema<T extends z.ZodTypeAny> = z.infer<T>;

