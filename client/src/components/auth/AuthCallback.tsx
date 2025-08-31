import { useEffect, useState } from 'react';
import { useCavosAuth } from '../../hooks/useCavosAuth';

interface AuthCallbackProps {
  onAuthComplete: (success: boolean, data?: any) => void;
}

export function AuthCallback({ onAuthComplete }: AuthCallbackProps) {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing authentication...");
  const { handleGoogleCallback } = useCavosAuth();

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
          
          // Process with the hook
          await handleGoogleCallback(parsedUserData);
          
          // Show success and redirect
          setStatus("success");
          setMessage("Authentication successful! Redirecting...");
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
  }, [onAuthComplete, handleGoogleCallback]);

  // Simple loading screen
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        {/* Simple spinner */}
        {status === "processing" && (
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
        )}
        
        {status === "success" && (
          <div style={{
            fontSize: '48px',
            color: '#10b981',
            margin: '0 auto 16px'
          }}>✅</div>
        )}
        
        {status === "error" && (
          <div style={{
            fontSize: '48px',
            color: '#ef4444',
            margin: '0 auto 16px'
          }}>❌</div>
        )}
        
        <p style={{ margin: 0, color: '#374151' }}>{message}</p>
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