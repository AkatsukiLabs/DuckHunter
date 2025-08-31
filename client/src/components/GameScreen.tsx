import React, { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

export function GameScreen() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { playerName, cavos } = useGameStore();
  
  useEffect(() => {
    // Initialize the KaPlay game
    const initializeGame = async () => {
      // Import and start the existing KaPlay game
      // We'll modify main.ts to be importable and start the game
      const { startGame } = await import('../game/main');
      
      if (gameContainerRef.current) {
        // Set the player name in KaPlay's data
        startGame(gameContainerRef.current, {
          playerName: playerName,
          walletAddress: cavos.wallet?.address
        });
      }
    };

    initializeGame();
    
    // Cleanup function
    return () => {
      // Clean up KaPlay instance if needed
      if (gameContainerRef.current) {
        gameContainerRef.current.innerHTML = '';
      }
    };
  }, [playerName, cavos.wallet?.address]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000'
    }}>
      <div 
        ref={gameContainerRef}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}