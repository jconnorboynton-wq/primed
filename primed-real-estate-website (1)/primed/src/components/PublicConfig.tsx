"use client";

import { createContext, useContext } from "react";

/** Non-sensitive settings needed by client components (never underwriting data). */
export interface PublicConfig {
  marketingEmailProgram: boolean;
  marketingSmsProgram: boolean;
  smsProgramTerms: string;
  stateDisclosures: Record<string, string>;
}

const Ctx = createContext<PublicConfig>({ marketingEmailProgram: false, marketingSmsProgram: false, smsProgramTerms: "", stateDisclosures: {} });

export function PublicConfigProvider({ value, children }: { value: PublicConfig; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePublicConfig = () => useContext(Ctx);
