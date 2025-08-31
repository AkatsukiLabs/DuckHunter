import { useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, appId } from '../config/cavosConfig';
import useGameStore from '../store/gameStore';
/**
 * Custom hook for Cavos authentication.
 * Handles Google OAuth flow, user and wallet state, and logout.
 */
interface UseCavosAuthReturn {
  user: any;
  wallet: any;
  loading: boolean;
  error: string | null;
  address?: string;
  handleGoogleAuth: () => void;
  handleGoogleCallback: (callbackData: any) => Promise<void>;
  handleLogout: () => void;
  isConnected: boolean;
}
/**
 * Custom hook for Cavos authentication.
 * Handles Google OAuth flow, user and wallet state, and logout.
 */
export function useCavosAuth(): UseCavosAuthReturn {
  const {
    cavos,
    setCavosAuth,
    setCavosLoading,
    setCavosError,
    clearCavosAuth
  } = useGameStore();

  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  /**
   * Start authentication flow with Google
   * The SignInWithGoogle component from cavos-service-sdk handles the redirection
   */
  const handleGoogleAuth = () => {
    console.log('🎯 Initiating Google OAuth flow...');
    setCavosLoading(true);
    // The SignInWithGoogle component handles the rest
  };

  /**
   * Process Google OAuth callback
   * Called from /auth/callback with user data
   */
  const handleGoogleCallback = async (callbackData: any) => {
    setCavosLoading(false);
    setCavosError(null);
    
    try {
      console.log('📦 Processing Google OAuth callback:', callbackData);
      
      // Extract data from callback
      const userData = {
        email: callbackData.email || callbackData.user?.email,
        user_id: callbackData.user_id || callbackData.id,
        username: '', // Will be filled later with the modal
        organization: callbackData.organization,
        created_at: callbackData.created_at || new Date().toISOString()
      };
      
      const walletData = callbackData.wallet || {
        address: callbackData.wallet_address,
        network: callbackData.network || network
      };
      
      const accessToken = callbackData.authData?.accessToken || callbackData.access_token;
      const refreshToken = callbackData.authData?.refreshToken || callbackData.refresh_token;
      
      console.log('✅ Google auth successful:', {
        email: userData.email,
        wallet: walletData.address
      });
      
      // Update store with auth data
      setCavosAuth(userData, walletData, accessToken, refreshToken);
      
      // The username will be requested later in a separate modal
      // We do not extract username from email here
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Google auth failed';
      setCavosError(errorMsg);
      console.error('❌ Google auth callback failed:', error);
    }
  };

  const handleLogout = () => {
    clearCavosAuth();
    console.log('🚪 User disconnected');
  };

  return {
    user: cavos.user,
    wallet: cavos.wallet,
    loading: cavos.loading,
    error: cavos.error,
    address: cavos.wallet?.address,
    handleGoogleAuth,
    handleGoogleCallback,
    handleLogout,
    isConnected: cavos.isAuthenticated
  };
}