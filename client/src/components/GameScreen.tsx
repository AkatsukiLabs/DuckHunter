import React, { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import { GameTransactionBridge } from './GameTransactionBridge';

export function GameScreen() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const { playerName, cavos } = useGameStore();
  
  useEffect(() => {
    const initializeGame = async () => {
      // Prevent double initialization
      if (initializingRef.current || gameInstanceRef.current) {
        console.log('🎮 Game initialization already in progress or completed, skipping');
        return;
      }

      if (gameContainerRef.current) {
        try {
          initializingRef.current = true;
          console.log('🎮 Initializing game...');
          
          // Use static import to prevent timing issues
          const { startGame } = await import('../game/main');
          
          const gameInstance = startGame(gameContainerRef.current, {
            playerName: playerName,
            walletAddress: cavos.wallet?.address
          });
          
          if (gameInstance) {
            gameInstanceRef.current = gameInstance;
            console.log('🎮 Game initialized successfully');
          } else {
            console.log('🎮 Game initialization skipped (already exists)');
          }
        } catch (error) {
          console.error('❌ Failed to initialize game:', error);
        } finally {
          initializingRef.current = false;
        }
      }
    };

    initializeGame();
    
    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        try {
          console.log('🧹 Cleaning up game instance');
          import('../game/main').then(({ destroyGame }) => {
            destroyGame();
          });
          gameInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up game:', error);
        }
      }
      initializingRef.current = false;
    };
  }, []); // Empty dependency array - only run once

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Invisible bridge for blockchain transactions */}
      <GameTransactionBridge />
      
      <div 
        ref={gameContainerRef}
        style={{
          width: '1024px',
          height: '896px',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />
    </div>
  );
}