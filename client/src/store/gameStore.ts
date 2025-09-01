import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player } from '../dojo/models.gen';

// Types
interface CavosUser {
  email: string;
  user_id: string;
  username: string;
  [key: string]: any;
}

interface CavosWallet {
  address: string;
  network: string;
  [key: string]: any;
}

interface CavosAuthState {
  user: CavosUser | null;
  wallet: CavosWallet | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface GameStats {
  currentScore: number;
  totalKills: number;
  totalShots: number;
  accuracy: number;
  highScore: number;
}

interface GameStore {
  // Cavos Auth
  cavos: CavosAuthState;
  setCavosAuth: (user: CavosUser | null, wallet: CavosWallet | null, accessToken: string | null, refreshToken: string | null) => void;
  setCavosTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setCavosLoading: (loading: boolean) => void;
  setCavosError: (error: string | null) => void;
  clearCavosAuth: () => void;
  
  // Player
  playerName: string;
  player: Player | null;
  isPlayerVerified: boolean;
  isSpawning: boolean;
  setPlayerName: (name: string) => void;
  setPlayer: (player: Player | null) => void;
  setPlayerVerified: (verified: boolean) => void;
  setIsSpawning: (spawning: boolean) => void;
  
  // Game Stats (UI optimista)
  gameStats: GameStats;
  updateGameStats: (stats: Partial<GameStats>) => void;
  resetGameStats: () => void;
  
  // Background transaction queue
  pendingTransactions: string[];
  addPendingTransaction: (txHash: string) => void;
  removePendingTransaction: (txHash: string) => void;
  
  // Leaderboard
  leaderboard: Player[];
  setLeaderboard: (players: Player[]) => void;
}

const initialGameStats: GameStats = {
  currentScore: 0,
  totalKills: 0,
  totalShots: 0,
  accuracy: 0,
  highScore: 0
};

const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // Initial Cavos state
      cavos: {
        user: null,
        wallet: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      },
      
      // Player state
      playerName: '',
      player: null,
      isPlayerVerified: false,
      isSpawning: false,
      
      // Game stats
      gameStats: initialGameStats,
      
      // Pending transactions for background processing
      pendingTransactions: [],
      
      // Leaderboard
      leaderboard: [],
      
      // Cavos Auth Actions
      setCavosAuth: (user, wallet, accessToken, refreshToken) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            user,
            wallet,
            accessToken,
            refreshToken,
            isAuthenticated: !!(user && wallet && accessToken),
            error: null
          }
        }));
      },
      
      setCavosTokens: (accessToken, refreshToken) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            accessToken,
            refreshToken
          }
        }));
      },
      
      setCavosLoading: (loading) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            loading
          }
        }));
      },
      
      setCavosError: (error) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            error,
            loading: false
          }
        }));
      },
      
      clearCavosAuth: () => {
        // Destroy game instance when user logs out
        import('../game/main').then(({ destroyGame }) => {
          destroyGame();
        });
        
        set(() => ({
          cavos: {
            user: null,
            wallet: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null
          },
          playerName: '',
          player: null,
          isPlayerVerified: false,
          isSpawning: false,
          gameStats: initialGameStats
        }));
      },
      
      // Player Actions
      setPlayerName: (name) => set({ playerName: name }),
      setPlayer: (player) => set({ player }),
      setPlayerVerified: (verified) => set({ isPlayerVerified: verified }),
      setIsSpawning: (spawning) => set({ isSpawning: spawning }),
      
      // Game Stats Actions (optimistas para UI)
      updateGameStats: (stats) => {
        set((state) => ({
          gameStats: {
            ...state.gameStats,
            ...stats
          }
        }));
      },
      
      resetGameStats: () => {
        set((state) => ({
          gameStats: {
            ...initialGameStats,
            highScore: state.gameStats.highScore // Mantener high score
          }
        }));
      },
      
      // Background Transaction Management
      addPendingTransaction: (txHash) => {
        set((state) => ({
          pendingTransactions: [...state.pendingTransactions, txHash]
        }));
      },
      
      removePendingTransaction: (txHash) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter(tx => tx !== txHash)
        }));
      },
      
      // Leaderboard Actions
      setLeaderboard: (players) => set({ leaderboard: players })
    }),
    {
      name: 'duck-hunt-storage',
      partialize: (state) => ({
        cavos: state.cavos,
        playerName: state.playerName,
        player: state.player,
        isPlayerVerified: state.isPlayerVerified,
        gameStats: {
          highScore: state.gameStats.highScore // Solo persistir high score
        }
      })
    }
  )
);

export default useGameStore;