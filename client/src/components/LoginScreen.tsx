import React, { useRef, useState, useEffect } from 'react';
import { SignInWithGoogle } from 'cavos-service-sdk';
import { useCavosAuth } from '../hooks/useCavosAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useGameStore from '../store/gameStore';

export function LoginScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleAuth, loading, isConnected } = useCavosAuth();
  const { setPlayerName, playerName } = useGameStore();
  
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [showUsernameStep, setShowUsernameStep] = useState(false);

  // Check URL params to see if we should show username step
  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'username' && isConnected) {
      setShowUsernameStep(true);
    }
  }, [searchParams, isConnected]);

  // If already connected and has username, redirect to game
  useEffect(() => {
    if (isConnected && playerName) {
      navigate('/game');
    }
  }, [isConnected, playerName, navigate]);

  const handleGoogleClick = () => {
    // Trigger the hidden Cavos button
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

  // Username step (after Google OAuth)
  if (showUsernameStep || (isConnected && !playerName)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '8px',
            color: '#1f2937'
          }}>🦆 Duck Hunter</h1>
          
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '24px'
          }}>Choose your hunter name</p>

          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={localPlayerName}
              onChange={(e) => setLocalPlayerName(e.target.value)}
              placeholder="Enter your name (max 31 chars)"
              maxLength={31}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setShowUsernameStep(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={!localPlayerName.trim()}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: localPlayerName.trim() ? '#10b981' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: localPlayerName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Start Hunting!
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Google OAuth step
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '8px',
          color: '#1f2937'
        }}>🦆 Duck Hunter</h1>
        
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '32px'
        }}>Sign in to start your hunting adventure</p>

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

        {/* Custom Google button */}
        <button
          onClick={handleGoogleClick}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#9ca3af' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Connecting...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '16px'
        }}>
          We'll create a secure wallet for you automatically
        </p>
      </div>
      
      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}