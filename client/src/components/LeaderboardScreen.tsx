import React from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { COLORS } from '../constant';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { topPlayers, currentUserRanking, isLoading, error, refetch } = useLeaderboard();

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
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: 'none'
  };

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          ...pixelBoxStyle,
          padding: '32px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '20px',
            color: COLORS.RED,
            marginBottom: '16px',
            letterSpacing: '2px'
          }}>
            LEADERBOARD ERROR
          </div>
          <div style={{
            fontSize: '10px',
            color: '#666',
            marginBottom: '24px'
          }}>
            Failed to load leaderboard data
          </div>
          <button
            onClick={onBack}
            style={pixelButtonStyle}
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

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
      <div 
        className="leaderboard-container"
        style={{
          ...pixelBoxStyle,
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '8px 8px 0 rgba(0,0,0,0.5)'
        }}>
        {/* Title */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'normal',
          marginBottom: '8px',
          color: COLORS.RED,
          textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
          letterSpacing: '2px'
        }}>
          DUCK HUNTER LEADERBOARD
        </div>
        
        <div style={{
          fontSize: '10px',
          color: '#666',
          marginBottom: '32px',
          letterSpacing: '1px'
        }}>
          TOP HUNTERS ON STARKNET
        </div>

        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: `4px solid ${COLORS.RED}`,
              borderTop: `4px solid ${COLORS.BLUE}`,
              borderRadius: '0',
              animation: 'spin 1s linear infinite',
              imageRendering: 'pixelated'
            }} />
            <div style={{
              marginLeft: '16px',
              fontSize: '12px',
              color: '#666'
            }}>
              Loading leaderboard...
            </div>
          </div>
        ) : (
          <>
            {/* Top 10 Players */}
            <div style={{ marginBottom: '24px' }}>
              {topPlayers.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '12px',
                  padding: '40px 0'
                }}>
                  No players found. Be the first to hunt some ducks!
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div 
                    className="leaderboard-header"
                    style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto auto',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '8px 12px',
                    marginBottom: '8px',
                    background: COLORS.RED,
                    border: `2px solid ${COLORS.BLUE}`,
                    color: COLORS.BEIGE,
                    fontSize: '10px',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      RANK
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      PLAYER
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '50px', paddingLeft: '8px' }}>
                      KILLS
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '60px' }}>
                      POINTS
                    </div>
                  </div>

                  {/* Player Rows */}
                  {topPlayers.map((player) => (
                  <div
                    className="leaderboard-row"
                    key={player.address}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr auto auto',
                      gap: '16px',
                      alignItems: 'center',
                      padding: '8px 12px',
                      marginBottom: '8px',
                      background: player.isCurrentUser ? COLORS.BLUE : '#333',
                      border: player.isCurrentUser ? `2px solid ${COLORS.RED}` : '2px solid #555',
                      color: player.isCurrentUser ? COLORS.BEIGE : '#fff',
                      fontSize: '11px',
                      letterSpacing: '1px'
                    }}
                  >
                    <div style={{ 
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: player.isCurrentUser ? '#fff' : (player.rank <= 3 ? COLORS.RED : 'inherit')
                    }}>
                      {player.rank}.
                    </div>
                    <div style={{ 
                      textAlign: 'left',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: player.isCurrentUser ? '#fff' : 'inherit'
                    }}>
                      {player.name}
                      {player.isCurrentUser && ' (YOU)'}
                    </div>
                    <div style={{ 
                      textAlign: 'center', 
                      fontSize: '10px', 
                      color: player.isCurrentUser ? '#fff' : '#999',
                      paddingLeft: '8px'
                    }}>
                      {player.kills}
                    </div>
                    <div style={{ 
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: player.isCurrentUser ? '#fff' : 'inherit'
                    }}>
                      {player.points.toLocaleString()}
                    </div>
                  </div>
                ))}
                </>
              )}
            </div>

            {/* Current User Ranking (if not in top 10) */}
            {currentUserRanking && (
              <>
                <div style={{
                  borderTop: `2px solid ${COLORS.RED}`,
                  paddingTop: '16px',
                  marginTop: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    Your Ranking
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto auto',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: COLORS.BLUE,
                    border: `2px solid ${COLORS.RED}`,
                    color: COLORS.BEIGE,
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    <div style={{ 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      color: '#fff'
                    }}>
                      #{currentUserRanking.rank}
                    </div>
                    <div style={{ 
                      textAlign: 'left',
                      color: '#fff'
                    }}>
                      {currentUserRanking.name} (YOU)
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      fontSize: '10px', 
                      color: '#fff' 
                    }}>
                      {currentUserRanking.kills}
                    </div>
                    <div style={{ 
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}>
                      {currentUserRanking.points.toLocaleString()}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Controls */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                onClick={refetch}
                style={{
                  ...pixelButtonStyle,
                  background: COLORS.RED,
                  fontSize: '10px'
                }}
              >
                REFRESH
              </button>
              <button
                onClick={onBack}
                style={pixelButtonStyle}
              >
                BACK
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* CSS for animations and responsive design */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
          .leaderboard-row {
            font-size: 9px !important;
            padding: 6px 8px !important;
          }
          .leaderboard-header {
            font-size: 8px !important;
            padding: 6px 8px !important;
          }
          .leaderboard-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}