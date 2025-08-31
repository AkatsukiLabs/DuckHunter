import React, { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

export function GameScreen() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);
  const { playerName, cavos } = useGameStore();
  
  useEffect(() => {
    // Initialize the KaPlay game
    const initializeGame = async () => {
      if (gameContainerRef.current && !gameInstanceRef.current) {
        try {
          const { startGame } = await import('../game/main');
          
          gameInstanceRef.current = startGame(gameContainerRef.current, {
            playerName: playerName,
            walletAddress: cavos.wallet?.address
          });
          
          console.log('🎮 Game initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize game:', error);
        }
      }
    };

    initializeGame();
    
    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up game:', error);
        }
      }
    };
  }, []); // Remove dependencies to prevent re-initialization

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