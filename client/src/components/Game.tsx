import { useEffect, useRef } from 'react';
import '../game/main';

export const Game = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // El juego se inicializa automáticamente al importar main.ts
    // Kaplay se encarga de crear su propio canvas
    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000'
      }}
    />
  );
};