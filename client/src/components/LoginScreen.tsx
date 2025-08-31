import React, { useRef, useState, useEffect } from 'react';
import { SignInWithGoogle } from 'cavos-service-sdk';
import { useCavosAuth } from '../hooks/useCavosAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import { COLORS } from '../constant';

export function LoginScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleAuth, loading, isConnected } = useCavosAuth();
  const { setPlayerName, playerName } = useGameStore();
  
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [showUsernameStep, setShowUsernameStep] = useState(false);

  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'username' && isConnected) {
      setShowUsernameStep(true);
    }
  }, [searchParams, isConnected]);

  useEffect(() => {
    if (isConnected && playerName) {
      navigate('/game');
    }
  }, [isConnected, playerName, navigate]);

  const handleGoogleClick = () => {
    const cavosButton = googleButtonRef.current?.querySelector('button');
    if (cavosButton) {
      cavosButton.click();
    } else {
      handleGoogleAuth();
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localPlayerName.trim().length > 0 && localPlayerName.trim().length <= 31) {
      setPlayerName(localPlayerName.trim());
      navigate('/game');
    }
  };

  const pixelBoxStyle: React.CSSProperties = {
    background: COLORS.BEIGE,
    border: `4px solid ${COLORS.RED}`,
    borderRadius: '0',
    boxShadow: `inset -4px -4px 0 rgba(0,0,0,0.3), inset 4px 4px 0 rgba(255,255,255,0.3)`,
    imageRendering: 'pixelated' as const,
    fontFamily: '"NES", "Courier New", monospace',
    fontWeight: 'normal',
    textAlign: 'center' as const
  };

  const pixelButtonStyle: React.CSSProperties = {
    ...pixelBoxStyle,
    background: COLORS.BLUE,
    color: COLORS.BEIGE,
    border: `4px solid ${COLORS.RED}`,
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '14px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'none'
  };

  const pixelInputStyle: React.CSSProperties = {
    ...pixelBoxStyle,
    background: COLORS.BEIGE,
    color: '#333',
    padding: '12px',
    fontSize: '14px',
    letterSpacing: '1px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const
  };

  // Username step
  if (showUsernameStep || (isConnected && !playerName)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        imageRendering: 'pixelated'
      }}>
        <div style={{
          ...pixelBoxStyle,
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '8px 8px 0 rgba(0,0,0,0.5)'
        }}>
          {/* Title with pixel styling */}
          <div style={{
            fontSize: '24px',
            fontWeight: 'normal',
            marginBottom: '8px',
            color: COLORS.RED,
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
            letterSpacing: '2px'
          }}>
            DUCK HUNTER
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '24px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Choose your hunter name
          </div>

          <form onSubmit={handleUsernameSubmit}>
            <div style={{
              marginBottom: '16px',
              fontSize: '10px',
              color: '#666',
              textAlign: 'left',
              letterSpacing: '1px'
            }}>
            </div>
            
            <input
              type="text"
              value={localPlayerName}
              onChange={(e) => setLocalPlayerName(e.target.value)}
              placeholder="MAX 31 CHARS"
              maxLength={31}
              style={pixelInputStyle}
              autoFocus
            />
            
            <div style={{
              fontSize: '10px',
              color: '#666',
              margin: '8px 0 16px',
              textAlign: 'right'
            }}>
              {localPlayerName.length}/31
            </div>
            
            <button
              type="submit"
              disabled={!localPlayerName.trim()}
              style={{
                ...pixelButtonStyle,
                width: '120px',
                height: '50px',
                margin: '0 auto',
                display: 'block',
                background: localPlayerName.trim() ? COLORS.BLUE : '#4285f4',
                cursor: localPlayerName.trim() ? 'pointer' : 'not-allowed',
                fontSize: '12px'
              }}
            >
              START
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Google OAuth step
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      imageRendering: 'pixelated'
    }}>
      <div style={{
        ...pixelBoxStyle,
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '8px 8px 0 rgba(0,0,0,0.5)'
      }}>
        {/* Main title with retro styling */}
        <div style={{
          fontSize: '32px',
          fontWeight: 'normal',
          marginBottom: '8px',
          color: COLORS.RED,
          textShadow: '3px 3px 0 rgba(0,0,0,0.5)',
          letterSpacing: '2px'
        }}>
          DUCK HUNTER
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '32px',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          Sign in to start your hunting adventure
        </div>

        {/* Hidden Cavos component */}
        <div 
          ref={googleButtonRef} 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            visibility: 'hidden' 
          }}
        >
          <SignInWithGoogle
            appId={(import.meta as any).env.VITE_CAVOS_APP_ID || ""}
            network={(import.meta as any).env.VITE_CAVOS_DEFAULT_NETWORK || "mainnet"}
            finalRedirectUri={`${window.location.origin}/auth/callback`}
            text="Continue with Google"
          />
        </div>

        {/* Custom retro Google button */}
        <button
          onClick={handleGoogleClick}
          disabled={loading}
          style={{
            ...pixelButtonStyle,
            width: '100%',
            background: loading ? '#666' : '#4285f4',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${COLORS.BEIGE}`,
                borderTop: `2px solid ${COLORS.RED}`,
                borderRadius: '0', // Remove border radius for pixel effect
                animation: 'spin 1s linear infinite'
              }} />
              CONNECTING...
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>G</span>
              SIGN IN WITH GOOGLE
            </>
          )}
        </button>
      </div>
      
      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: inset -6px -6px 0 rgba(0,0,0,0.3), inset 6px 6px 0 rgba(255,255,255,0.3), 2px 2px 0 rgba(0,0,0,0.5) !important;
        }
        
        button:active:not(:disabled) {
          transform: translate(0px, 0px);
          box-shadow: inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.3) !important;
        }
      `}</style>
    </div>
  );
}