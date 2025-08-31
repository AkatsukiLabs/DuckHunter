// Network configuration
export const network = import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'mainnet' ? 'mainnet' : 'sepolia';

// Organization secret from environment (backend only)
export const orgSecret = import.meta.env.VITE_CAVOS_ORG_SECRET;

// App ID from environment (frontend)
export const appId = import.meta.env.VITE_CAVOS_APP_ID;

// Debug environment variables
console.log('🔧 Cavos Config Debug:', {
  network,
  orgSecret: orgSecret ? 'LOADED' : 'MISSING',
  appId: import.meta.env.VITE_CAVOS_APP_ID ? 'LOADED' : 'MISSING',
  networkRaw: import.meta.env.VITE_CAVOS_DEFAULT_NETWORK
});

// Contract addresses per network
export const CONTRACT_ADDRESSES = {
  mainnet: {
    game: import.meta.env.VITE_PUBLIC_GAME_CONTRACT,
  },
  sepolia: {
    game: '0x8efc9411c660ef584995d8f582a13cac41aeddb6b9245b4715aa1e9e6a201e', // placeholder
  }
};

// Get contract addresses for current network
export const getContractAddresses = () => {
  return CONTRACT_ADDRESSES[network];
};