export const dojoConfig = {
  toriiUrl: (import.meta as any).env.VITE_PUBLIC_TORII || 'https://api.cartridge.gg/x/duckhunter/torii',
  gameContract: (import.meta as any).env.VITE_PUBLIC_GAME_CONTRACT
};

// Debug environment variables
console.log('🏗️ Dojo Config Debug:', {
  toriiUrl: dojoConfig.toriiUrl,
  gameContract: dojoConfig.gameContract ? 'LOADED' : 'MISSING'
});