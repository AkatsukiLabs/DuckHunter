import { useState, useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import useGameStore from '../store/gameStore';
import { gameContract } from '../dojo/dojoConfig';

interface CavosTransactionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

interface UseCavosTransactionReturn {
  executeTransaction: (calls: CavosTransactionCall[]) => Promise<string>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for executing transactions using Cavos SDK
 */
export function useCavosTransaction(): UseCavosTransactionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCavosTokens } = useGameStore();

  // Get network and app ID from environment
  const network = import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'sepolia' ? 'sepolia' : 'mainnet';
  const appId = import.meta.env.VITE_CAVOS_APP_ID || '';

  // Create CavosAuth instance for executeCalls
  const cavosAuth = useMemo(() => {
    console.log('🔧 Creating CavosAuth instance with:', { network, appId });
    return new CavosAuth(network, appId);
  }, [network, appId]);

  const executeTransaction = async (calls: CavosTransactionCall[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Get the latest state from the store
      const currentState = useGameStore.getState();
      const currentCavos = currentState.cavos;
      
      if (!currentCavos.isAuthenticated || !currentCavos.accessToken || !currentCavos.wallet) {
        throw new Error('Not authenticated. Please login first.');
      }

      console.log('📝 Executing Cavos transaction with SDK:', {
        network,
        appId,
        walletAddress: currentCavos.wallet.address,
        callsCount: calls.length,
        hasAccessToken: !!currentCavos.accessToken,
        hasRefreshToken: !!currentCavos.refreshToken,
        calls: calls.map(call => ({
          contract: call.contractAddress.slice(0, 10) + '...',
          entrypoint: call.entrypoint,
          calldataLength: call.calldata.length
        }))
      });

      let accessToken = currentCavos.accessToken;

      // Execute transaction using SDK instance method
      const result = await cavosAuth.executeCalls(
        currentCavos.wallet.address,
        calls,
        accessToken
      );

      console.log('📦 Cavos transaction result:', result);
      
      // Check if result contains an error first
      if (result && typeof result === 'object' && result.error) {
        console.error('❌ Cavos transaction failed with error:', result.error);
        throw new Error(`Transaction failed: ${result.error}`);
      }

      // Extract transaction hash (SDK now returns it as 'txHash')
      const transactionHash = result?.txHash || result?.transaction_hash || result;
      
      if (!transactionHash || typeof transactionHash !== 'string') {
        console.error('❌ No valid transaction hash returned:', result);
        throw new Error('No valid transaction hash returned');
      }

      // The server handles token refresh automatically and returns a new access token if needed
      if (result?.accessToken) {
        console.log('🔑 Access token received in response, updating store');
        setCavosTokens(result.accessToken, currentCavos.refreshToken);
      }

      console.log('✅ Cavos transaction successful:', transactionHash);
      return transactionHash;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMsg);
      console.error('❌ Cavos transaction failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    executeTransaction,
    loading,
    error
  };
}

/**
 * Helper function to spawn a player on the blockchain
 * This is called after successful authentication if the player doesn't exist
 */
export async function spawnPlayer(username: string): Promise<string | null> {
  try {
    const store = useGameStore.getState();
    const { cavos } = store;
    
    if (!cavos.isAuthenticated || !cavos.accessToken || !cavos.wallet) {
      console.error('Cannot spawn player: Not authenticated');
      return null;
    }

    // Get network and app ID
    const network = import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'sepolia' ? 'sepolia' : 'mainnet';
    const appId = import.meta.env.VITE_CAVOS_APP_ID || '';
    
    // Create CavosAuth instance
    const cavosAuth = new CavosAuth(network, appId);

    // Ensure username is within felt252 limits (31 characters max)
    const playerName = username.slice(0, 31);
    
    console.log('🎮 Spawning player:', playerName);
    
    // Mark as spawning in progress
    store.setIsSpawning(true);
    
    // Call spawn_player on the game contract
    const calls: CavosTransactionCall[] = [{
      contractAddress: gameContract,
      entrypoint: 'spawn_player',
      calldata: [playerName] // Send string directly as felt252
    }];

    const result = await cavosAuth.executeCalls(
      cavos.wallet.address,
      calls,
      cavos.accessToken
    );

    if (result?.error) {
      throw new Error(result.error);
    }

    const txHash = result?.txHash || result?.transaction_hash;
    
    if (!txHash) {
      throw new Error('No transaction hash received');
    }
    
    console.log('✅ Player spawned successfully! TX:', txHash);
    
    // Update tokens if needed
    if (result?.accessToken && result.accessToken !== cavos.accessToken) {
      store.setCavosTokens(result.accessToken, cavos.refreshToken);
    }
    
    // Create a player object and set it in the store
    const newPlayer = {
      owner: cavos.wallet.address,
      name: parseInt(playerName), // Convert to felt252 format
      kills: 0,
      points: 0,
      creation_day: Math.floor(Date.now() / 1000 / 86400) // Current day as timestamp
    };
    
    // Mark player as verified and spawning complete
    store.setPlayer(newPlayer);
    store.setPlayerVerified(true);
    store.setIsSpawning(false);
    
    return txHash;
    
  } catch (error) {
    console.error('⚠️ Error spawning player:', error);
    const store = useGameStore.getState();
    store.setIsSpawning(false);
    // Don't throw - spawning failure is not critical
    return null;
  }
}