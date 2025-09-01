import { useState, useEffect, useMemo } from 'react';
import { addAddressPadding } from 'starknet';

// Store import
import useGameStore from '../store/gameStore';

// Types import
import { Player } from '../dojo/models.gen';

// Dojo config import
import { dojoConfig } from '../dojo/dojoConfig';

// Types
interface UsePlayerReturn {
  player: Player | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isPlayerVerified: boolean;
}

// Constants
const TORII_URL = (dojoConfig.toriiUrl || 'https://api.cartridge.gg/x/duckhunter/torii') + "/graphql";
const PLAYER_QUERY = `
  query GetPlayer($playerAddress: ContractAddress!) {
    duckhunterPlayerModels(where: { owner: $playerAddress }) {
      edges {
        node {
          owner
          name
          kills
          points
          creation_day
        }
      }
      totalCount
    }
  }
`;

// Helper to convert hex strings to numbers
const hexToNumber = (hexValue: string | number): number => {
  // If it's already a number, return it
  if (typeof hexValue === 'number') return hexValue;
  
  // If it's a hex string, convert it
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  
  // If it's a string but not hex, try to parse it as number
  if (typeof hexValue === 'string') {
    return parseInt(hexValue, 10);
  }
  
  // Fallback
  return 0;
};

// Helper to convert hex to string (for player name)
const hexToString = (hexValue: string | number): string => {
  // If it's already a string and doesn't start with 0x, return it
  if (typeof hexValue === 'string' && !hexValue.startsWith('0x')) {
    return hexValue;
  }
  
  // If it's a number, convert to hex then to string
  if (typeof hexValue === 'number') {
    hexValue = '0x' + hexValue.toString(16);
  }
  
  // Convert hex to string
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    try {
      const hexString = hexValue.slice(2);
      const bytes = hexString.match(/.{1,2}/g) || [];
      return bytes
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('')
        .replace(/\0/g, ''); // Remove null bytes
    } catch (e) {
      console.warn('Could not decode hex to string:', e);
      return '';
    }
  }
  
  return '';
};

// API Functions
const fetchPlayerData = async (playerAddress: string): Promise<Player | null> => {
  try {
    console.log('🌐 fetchPlayerData: Querying Torii for address:', playerAddress);
    console.log('🌐 fetchPlayerData: Torii URL:', TORII_URL);
    
    const response = await fetch(TORII_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: PLAYER_QUERY,
        variables: { playerAddress }
      }),
    });

    const result = await response.json();
    
    console.log('🌐 fetchPlayerData: Torii response:', {
      hasData: !!result.data,
      hasPlayerModels: !!result.data?.duckhunterPlayerModels,
      edgesCount: result.data?.duckhunterPlayerModels?.edges?.length || 0,
      totalCount: result.data?.duckhunterPlayerModels?.totalCount || 0
    });
    
    if (!result.data?.duckhunterPlayerModels?.edges?.length) {
      console.log('❌ fetchPlayerData: No player found in Torii for address:', playerAddress);
      return null; // Player not found
    }

    // Extract player data
    const rawPlayerData = result.data.duckhunterPlayerModels.edges[0].node;
    
    // Convert hex values to proper types
    const playerData: Player = {
      owner: rawPlayerData.owner,
      name: hexToNumber(rawPlayerData.name), // name is stored as felt252 (number)
      kills: hexToNumber(rawPlayerData.kills),
      points: hexToNumber(rawPlayerData.points),
      creation_day: hexToNumber(rawPlayerData.creation_day)
    };
    
    console.log('✅ fetchPlayerData: Player found:', playerData);
    
    return playerData;
  } catch (error) {
    console.error("Error fetching player:", error);
    throw error;
  }
};

/**
 * Hook for managing player data from Dojo/Torii
 * Handles fetching, caching, and updating player information
 */
export const usePlayer = (): UsePlayerReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [player, setLocalPlayer] = useState<Player | null>(null);
  
  // Get Cavos wallet address
  const cavosWallet = useGameStore(state => state.cavos.wallet);

  // Memoize the formatted user address from Cavos wallet
  const userAddress = useMemo(() => 
    cavosWallet?.address ? addAddressPadding(cavosWallet.address).toLowerCase() : '', 
    [cavosWallet?.address]
  );

  // Function to fetch and update player data
  const refetch = async () => {
    if (!userAddress) {
      console.log('⚠️ usePlayer: No user address available for fetching');
      setIsLoading(false);
      return;
    }

    // Check if we already have player data in store (from recent spawn)
    const store = useGameStore.getState();
    if (store.isPlayerVerified && store.player) {
      console.log('📊 usePlayer: Using cached player data from store');
      setLocalPlayer(store.player);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 usePlayer: Fetching player data for address:', userAddress);
      const playerData = await fetchPlayerData(userAddress);
      
      console.log('📊 usePlayer: Player data fetched:', playerData ? 'FOUND' : 'NOT FOUND', playerData);
      
      // Update local state with player data
      setLocalPlayer(playerData);
      
      // Also update the game store if needed
      if (playerData) {
        store.setPlayer(playerData);
        store.setPlayerVerified(true);
      } else {
        store.setPlayer(null);
        store.setPlayerVerified(false);
      }
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Error in refetch:", error);
      setError(error);
      setLocalPlayer(null);
      
      // Update store on error
      const store = useGameStore.getState();
      store.setPlayer(null);
      store.setPlayerVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch player data when address changes
  useEffect(() => {
    if (userAddress) {
      refetch();
    } else {
      // Clear player data if no address
      setLocalPlayer(null);
      setError(null);
      setIsLoading(false);
      
      const store = useGameStore.getState();
      store.setPlayer(null);
      store.setPlayerVerified(false);
    }
  }, [userAddress]);

  return {
    player,
    isLoading,
    error,
    refetch,
    isPlayerVerified: !!player
  };
};