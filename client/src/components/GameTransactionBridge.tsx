import { useEffect } from 'react';
import { useGameTransactions, setGlobalDuckHitHandler } from '../hooks/useGameTransactions';
import useGameStore from '../store/gameStore';

/**
 * Invisible component that bridges KaPlay game with blockchain transactions
 * Sets up the global handler for duck hit transactions
 * Does not render anything, just provides the bridge
 */
export function GameTransactionBridge() {
  const { sendDuckHitTransaction } = useGameTransactions();
  const isPlayerVerified = useGameStore(state => state.isPlayerVerified);

  useEffect(() => {
    if (isPlayerVerified) {
      // Set up the global handler that KaPlay can call
      setGlobalDuckHitHandler(sendDuckHitTransaction);
      console.log('🔗 Game transaction bridge connected');
    } else {
      // Clear the handler if user is not verified
      setGlobalDuckHitHandler(async () => {
        console.log('🦆 User not verified, skipping blockchain transaction');
      });
      console.log('🔗 Game transaction bridge disconnected');
    }

    // Cleanup on unmount
    return () => {
      setGlobalDuckHitHandler(async () => {});
    };
  }, [sendDuckHitTransaction, isPlayerVerified]);

  // This component renders nothing
  return null;
}