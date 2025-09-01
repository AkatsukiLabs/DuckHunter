import { createDojoConfig } from "@dojoengine/core";
import { manifest } from "../config/manifest";

const {
  VITE_PUBLIC_NODE_URL,
  VITE_PUBLIC_TORII,
  VITE_PUBLIC_WORLD_ADDRESS,
  VITE_PUBLIC_GAME_CONTRACT,
} = import.meta.env;

export const dojoConfig = createDojoConfig({
  manifest,
  rpcUrl: VITE_PUBLIC_NODE_URL || '',
  toriiUrl: VITE_PUBLIC_TORII || '',
});

// Export additional contract addresses for convenience
export const worldAddress = VITE_PUBLIC_WORLD_ADDRESS || '';
export const gameContract = VITE_PUBLIC_GAME_CONTRACT || '';