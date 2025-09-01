import { useEffect, useState } from 'react';
import { useCavosAuth } from '../../hooks/useCavosAuth';
import { usePlayer } from '../../hooks/usePlayer';
import useGameStore from '../../store/gameStore';
import { COLORS } from '../../constant';

interface AuthCallbackProps {
  onAuthComplete: (success: boolean, data?: any) => void;
}

export function AuthCallback({ onAuthComplete }: AuthCallbackProps) {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing authentication...");
  const { handleGoogleCallback } = useCavosAuth();
  const { refetch: checkPlayer } = usePlayer();
  const setPlayerVerified = useGameStore(state => state.setPlayerVerified);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userData = urlParams.get("user_data");
        const error = urlParams.get("error");

        // Handle errors
        if (error) {
          setStatus("error");
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => onAuthComplete(false), 3000);
          return;
        }

        // Process user data
        if (userData) {
          const decodedUserData = decodeURIComponent(userData);
          const parsedUserData = JSON.parse(decodedUserData);
          
          // Process with the hook - this sets up Cavos auth
          await handleGoogleCallback(parsedUserData);
          
          // Keep the same message while verifying
          setMessage("Setting up your account...");
          
          // Wait a bit for the wallet to be set in store
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if player exists (silently in background)
          await checkPlayer();
          
          // The usePlayer hook will automatically update isPlayerVerified in the store
          // We'll let the main app logic handle navigation based on that state
          
          // Show success and redirect
          setStatus("success");
          setMessage("Welcome to Duck Hunter!");
          setTimeout(() => onAuthComplete(true, parsedUserData), 1500);
          
        } else {
          setStatus("error");
          setMessage("No authentication data received");
          setTimeout(() => onAuthComplete(false), 3000);
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus("error");
        setMessage("An error occurred during authentication");
        setTimeout(() => onAuthComplete(false), 3000);
      }
    };

    setTimeout(handleCallback, 100);
  }, [onAuthComplete, handleGoogleCallback, checkPlayer, setPlayerVerified]);

  const pixelBoxStyle: React.CSSProperties = {
    background: COLORS.BEIGE,
    border: `4px solid ${COLORS.RED}`,
    borderRadius: '0',
    boxShadow: `inset -4px -4px 0 rgba(0,0,0,0.3), inset 4px 4px 0 rgba(255,255,255,0.3), 8px 8px 0 rgba(0,0,0,0.5)`,
    imageRendering: 'pixelated' as const,
    fontFamily: '"NES", "Courier New", monospace',
    fontWeight: 'normal',
    textAlign: 'center' as const
  };

  // Retro loading screen
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      imageRendering: 'pixelated'
    }}>
      <div style={{
        ...pixelBoxStyle,
        padding: '32px',
        maxWidth: '400px',
        width: '90%'
      }}>
        {/* Pixel-style status indicators */}
        {status === "processing" && (
          <>
            <div style={{
              fontSize: '32px',
              margin: '0 auto 16px',
              color: COLORS.BLUE,
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
            }}>⏳</div>
            <div style={{
              width: '32px',
              height: '32px',
              border: `4px solid ${COLORS.RED}`,
              borderTop: `4px solid ${COLORS.BLUE}`,
              borderRadius: '0',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
              imageRendering: 'pixelated'
            }} />
          </>
        )}
        
        {status === "success" && (
          <div style={{
            fontSize: '48px',
            color: COLORS.RED,
            margin: '0 auto 16px',
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
          }}></div>
        )}
        
        {status === "error" && (
          <div style={{
            fontSize: '48px',
            color: COLORS.RED,
            margin: '0 auto 16px',
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
          }}>❌</div>
        )}
        
        <div style={{ 
          margin: 0, 
          color: '#333',
          fontSize: '12px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          lineHeight: '1.4'
        }}>
          {message}
        </div>
      </div>
      
      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}