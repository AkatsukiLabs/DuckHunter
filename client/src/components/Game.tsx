import { useEffect } from 'react';
import '../game/main';

export const Game = () => {
  useEffect(() => {
    // El juego se inicializa automáticamente al importar main.ts
    // Kaplay se encarga de crear su propio canvas
    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return (
    <div 
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        imageRendering: 'pixelated'
      }}
    />
  );
};