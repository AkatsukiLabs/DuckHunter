import { useCallback } from 'react';
import { useCavosTransaction } from './useCavosTransaction';
import { gameContract } from '../dojo/dojoConfig';
import useGameStore from '../store/gameStore';
import { shortString } from 'starknet';

interface UseGameTransactionsReturn {
  sendDuckHitTransaction: (points: number, kills: number) => Promise<void>;
  isTransactionInProgress: boolean;
}

/**
 * Hook for sending individual game transactions to STARKNET
 * Each duck hit = 1 transaction in background
 * Never interrupts gameplay
 */
export function useGameTransactions(): UseGameTransactionsReturn {
  const { executeTransaction, loading } = useCavosTransaction();
  const { isPlayerVerified, cavos } = useGameStore();

  const sendDuckHitTransaction = useCallback(async (points: number, kills: number) => {
    // Only send if user is authenticated and verified
    if (!cavos.isAuthenticated || !isPlayerVerified) {
      console.log('🦆 Skipping transaction - user not verified');
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const gameState = useGameStore.getState();
    
    try {
      console.log(`🔥 [${timestamp}] DUCK HIT STARKNET TRANSACTION INITIATED`);
      console.log(`   📊 Transaction Details:`);
      console.log(`      Points: +${points}`);
      console.log(`      Kills: +${kills}`);
      // Get player name - prioritize the original string, then decode felt252 if needed
      let displayName = gameState.playerName || 'Unknown';
      
      // If we don't have playerName but have player.name, try to decode it
      if (!gameState.playerName && gameState.player?.name) {
        try {
          displayName = shortString.decodeShortString(gameState.player.name.toString());
        } catch (error) {
          console.warn('⚠️ Error decoding player name:', gameState.player.name, error);
          displayName = gameState.player.name.toString(); // Fallback to the number
        }
      }
      
      console.log(`      Player: ${displayName}`);
      console.log(`      Wallet: ${cavos.wallet?.address?.slice(0, 10)}...`);
      console.log(`      Contract: ${gameContract.slice(0, 10)}...`);
      
      // Send transaction in background (fire and forget)
      executeTransaction([{
        contractAddress: gameContract,
        entrypoint: 'update_game',
        calldata: [
          points.toString(),  // u32 points 
          kills.toString()    // u32 kills
        ]
      }]).then((txHash) => {
        const completedTime = new Date().toLocaleTimeString();
        console.log(`✅ [${completedTime}] STARKNET TRANSACTION SUCCESSFUL!`);
        console.log(`   🎯 Transaction Hash: ${txHash}`);
        console.log(`   ⏱️  Time: ${timestamp} → ${completedTime}`);
        console.log(`   📈 Points Updated: +${points} | Kills Updated: +${kills}`);
        console.log(`   🌐 Explorer: https://starkscan.co/tx/${txHash}`);
        
        // Add to pending transactions for UI tracking
        gameState.addPendingTransaction(txHash);
      }).catch((error) => {
        const failedTime = new Date().toLocaleTimeString();
        console.error(`❌ [${failedTime}] STARKNET TRANSACTION FAILED`);
        console.error(`   🚫 Error: ${error.message}`);
        console.error(`   ⏱️  Time: ${timestamp} → ${failedTime}`);
        console.error(`   🔄 Gameplay continues normally (non-critical error)`);
      });

      // Return immediately, don't wait for transaction
      
    } catch (error) {
      console.error(`⚠️ [${timestamp}] Error preparing duck hit transaction:`, error);
      // Don't throw - gameplay must continue
    }
  }, [executeTransaction, cavos.isAuthenticated, isPlayerVerified]);

  return {
    sendDuckHitTransaction,
    isTransactionInProgress: loading
  };
}

/**
 * Global function to be called from KaPlay game
 * This allows the existing game code to trigger STARKNET transactions
 */
let globalDuckHitHandler: ((points: number, kills: number) => Promise<void>) | null = null;

export function setGlobalDuckHitHandler(handler: (points: number, kills: number) => Promise<void>) {
  globalDuckHitHandler = handler;
}

export function triggerDuckHitTransaction(points: number, kills: number = 1) {
  const timestamp = new Date().toLocaleTimeString();
  
  if (globalDuckHitHandler) {
    console.log(`🎯 [${timestamp}] GAME EVENT: Duck Hit - Triggering STARKNET transaction`);
    console.log(`   🦆 Points: ${points} | Kills: ${kills}`);
    globalDuckHitHandler(points, kills);
  } else {
    console.warn(`⚠️ [${timestamp}] GAME EVENT: Duck Hit - No STARKNET handler registered`);
    console.warn(`   🦆 Points: ${points} | Kills: ${kills} (NOT RECORDED ON STARKNET)`);
  }
}