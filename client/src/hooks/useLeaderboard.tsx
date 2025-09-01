import { useState, useEffect, useCallback } from 'react';
import { addAddressPadding, shortString } from 'starknet';
import { dojoConfig } from '../dojo/dojoConfig';
import useGameStore from '../store/gameStore';

// Types
export interface LeaderboardPlayer {
  address: string;
  name: string;
  points: number;
  kills: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface UseLeaderboardReturn {
  topPlayers: LeaderboardPlayer[];
  currentUserRanking: LeaderboardPlayer | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Constants
const TORII_URL = dojoConfig.toriiUrl + "/graphql";

// Query 1: Top 10 leaderboard ordered by points
const TOP_LEADERBOARD_QUERY = `
  query GetTopLeaderboard {
    duckhunterPlayerModels(
      order: { field: POINTS, direction: DESC }
      limit: 10
    ) {
      edges {
        node {
          owner
          name
          points
          kills
          creation_day
        }
      }
    }
  }
`;

// Query 2: Current user position
const USER_RANKING_QUERY = `
  query GetUserRanking($playerAddress: ContractAddress!) {
    duckhunterPlayerModels(
      where: { owner: $playerAddress }
    ) {
      edges {
        node {
          owner
          name
          points
          kills
          creation_day
        }
      }
    }
  }
`;

// Query 3: Count all players with higher score to calculate ranking
const COUNT_HIGHER_SCORE_QUERY = `
  query CountHigherScore($userPoints: Int!) {
    duckhunterPlayerModels(
      where: { pointsGT: $userPoints }
    ) {
      totalCount
    }
  }
`;

// Helper to convert hex strings to numbers
const hexToNumber = (hexValue: string | number): number => {
  if (typeof hexValue === 'number') return hexValue;
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  if (typeof hexValue === 'string') {
    return parseInt(hexValue, 10);
  }
  return 0;
};

// Helper to decode player name from felt252
const decodePlayerName = (rawName: string | number): string => {
  if (!rawName || rawName === '0x0' || rawName === 0) {
    return 'Unknown';
  }
  
  try {
    const nameStr = rawName.toString();
    if (nameStr.startsWith('0x')) {
      return shortString.decodeShortString(nameStr);
    } else {
      // Convert number to hex first
      const hexName = '0x' + parseInt(nameStr, 10).toString(16);
      return shortString.decodeShortString(hexName);
    }
  } catch (error) {
    console.warn('⚠️ Error decoding player name:', rawName, error);
    return 'Unknown';
  }
};

// Main hook
export function useLeaderboard(): UseLeaderboardReturn {
  const [topPlayers, setTopPlayers] = useState<LeaderboardPlayer[]>([]);
  const [currentUserRanking, setCurrentUserRanking] = useState<LeaderboardPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { cavos } = useGameStore();

  // Fetch top 10 players
  const fetchTopPlayers = async () => {
    try {
      console.log('🏆 Fetching top 10 Duck Hunter players...');
      
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: TOP_LEADERBOARD_QUERY }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const edges = result.data?.duckhunterPlayerModels?.edges || [];
      
      console.log('🏆 Raw leaderboard data:', edges);
      
      return edges.map((edge: any) => ({
        owner: edge.node.owner,
        name: edge.node.name,
        points: hexToNumber(edge.node.points),
        kills: hexToNumber(edge.node.kills),
        creation_day: hexToNumber(edge.node.creation_day)
      }));
    } catch (error) {
      console.error('❌ Error fetching top players:', error);
      throw error;
    }
  };

  // Fetch current user ranking
  const fetchUserRanking = async (address: string) => {
    try {
      console.log('👤 Fetching user ranking for address:', address);
      
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: USER_RANKING_QUERY,
          variables: { playerAddress: address }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.warn('⚠️ User has no score in Duck Hunter');
        return null;
      }

      const edges = result.data?.duckhunterPlayerModels?.edges || [];
      if (edges.length === 0) return null;

      return {
        owner: edges[0].node.owner,
        name: edges[0].node.name,
        points: hexToNumber(edges[0].node.points),
        kills: hexToNumber(edges[0].node.kills),
        creation_day: hexToNumber(edges[0].node.creation_day)
      };
    } catch (error) {
      console.error('❌ Error fetching user ranking:', error);
      return null;
    }
  };

  // Calculate user's actual rank
  const calculateUserRank = async (userPoints: number): Promise<number> => {
    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: COUNT_HIGHER_SCORE_QUERY,
          variables: { userPoints }
        }),
      });

      const result = await response.json();
      const playersWithHigherScore = result.data?.duckhunterPlayerModels?.totalCount || 0;
      
      return playersWithHigherScore + 1; // User's rank
    } catch (error) {
      console.error('❌ Error calculating user rank:', error);
      return 999; // Default rank if error
    }
  };

  // Main fetch function
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🏆 Starting Duck Hunter leaderboard fetch...');
      
      // 1. Fetch top 10 players
      const topScores = await fetchTopPlayers();
      
      // 2. Fetch current user if authenticated
      let userScore = null;
      const currentUserAddress = cavos.wallet?.address;
      
      if (currentUserAddress) {
        const paddedAddress = addAddressPadding(currentUserAddress);
        userScore = await fetchUserRanking(paddedAddress);
      }

      // 3. Build top players list with ranks and names
      const topPlayersWithNames: LeaderboardPlayer[] = topScores.map((player, index) => {
        // Normalize addresses for comparison
        const normalizedPlayerAddress = player.owner.toLowerCase();
        const normalizedCurrentUser = currentUserAddress?.toLowerCase() || '';
        const paddedCurrentUser = currentUserAddress ? 
          addAddressPadding(currentUserAddress).toLowerCase() : '';
        
        const isCurrentUser = normalizedCurrentUser ? 
          (normalizedPlayerAddress === normalizedCurrentUser || 
           normalizedPlayerAddress === paddedCurrentUser) : 
          false;
        
        return {
          address: player.owner,
          name: decodePlayerName(player.name),
          points: player.points,
          kills: player.kills,
          rank: index + 1,
          isCurrentUser
        };
      });

      // 4. Build current user ranking if exists and not in top 10
      let userRanking: LeaderboardPlayer | null = null;
      if (userScore && currentUserAddress) {
        const isInTop10 = topPlayersWithNames.some(p => p.isCurrentUser);
        
        if (!isInTop10) {
          const userRank = await calculateUserRank(userScore.points);
          userRanking = {
            address: userScore.owner,
            name: decodePlayerName(userScore.name),
            points: userScore.points,
            kills: userScore.kills,
            rank: userRank,
            isCurrentUser: true
          };
        }
      }

      console.log('🏆 Leaderboard data processed:', {
        topPlayersCount: topPlayersWithNames.length,
        hasCurrentUser: !!userRanking,
        topPlayers: topPlayersWithNames
      });

      setTopPlayers(topPlayersWithNames);
      setCurrentUserRanking(userRanking);
    } catch (err) {
      console.error('❌ Error in fetchLeaderboard:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [cavos.wallet?.address]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    topPlayers,
    currentUserRanking,
    isLoading,
    error,
    refetch: fetchLeaderboard
  };
}