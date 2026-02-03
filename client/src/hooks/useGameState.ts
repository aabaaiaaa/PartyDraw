import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';

/**
 * Room status representing the current state of the game
 */
export type RoomStatus =
  | 'lobby'
  | 'countdown'
  | 'drawing'
  | 'voting'
  | 'results'
  | 'final';

/**
 * Player information
 */
export interface Player {
  id: string;
  name: string;
  color: string;
  socketId: string;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  isSpectator: boolean;
}

/**
 * Drawing entry with player info and image data
 */
export interface Drawing {
  playerId: string;
  drawingData: string;
}

/**
 * Vote result for a player
 */
export interface VoteResult {
  playerId: string;
  playerName: string;
  votes: number;
  pointsEarned: number;
}

/**
 * Score entry for leaderboard
 */
export interface ScoreEntry {
  playerId: string;
  playerName: string;
  score: number;
}

/**
 * Winner information
 */
export interface Winner {
  playerId: string;
  playerName: string;
  votes: number;
}

/**
 * Room settings
 */
export interface RoomSettings {
  maxPlayers: number;
  rounds: number;
  drawingTime: number;
  votingTime: number;
}

/**
 * Serialized game state from server
 */
export interface SerializedGameState {
  currentRound: number;
  question: string | null;
  drawings: Array<[string, string]>;
  votes: Array<[string, string]>;
  phaseStartTime: number | null;
  phaseEndTime: number | null;
  skipVotes?: string[];
}

/**
 * Serialized room data from server
 */
export interface SerializedRoom {
  id: string;
  code: string;
  hostSocketId: string;
  players: Player[];
  status: RoomStatus;
  gameState: SerializedGameState;
  settings: RoomSettings;
  createdAt: number;
}

/**
 * Local game state maintained by the hook
 */
export interface GameState {
  /** Whether we are currently in a room */
  inRoom: boolean;
  /** Room ID */
  roomId: string | null;
  /** Room code for joining */
  roomCode: string | null;
  /** Current room status */
  status: RoomStatus;
  /** Whether current socket is the host */
  isHost: boolean;
  /** Current player info (for player screens) */
  currentPlayer: Player | null;
  /** All players in the room */
  players: Player[];
  /** Room settings */
  settings: RoomSettings | null;
  /** Current round number */
  currentRound: number;
  /** Total rounds in the game */
  totalRounds: number;
  /** Current question/prompt for drawing */
  question: string | null;
  /** Duration for current phase in seconds */
  phaseDuration: number;
  /** Countdown value (3, 2, 1) */
  countdownValue: number | null;
  /** Timer seconds remaining */
  timerSeconds: number | null;
  /** Drawings submitted this round */
  drawings: Drawing[];
  /** Number of drawings submitted */
  submittedCount: number;
  /** Votes recorded this round */
  votedCount: number;
  /** Whether current player has submitted drawing */
  hasSubmittedDrawing: boolean;
  /** Whether the drawing phase has ended (timer expired) - triggers auto-submit */
  drawingPhaseEnded: boolean;
  /** Whether current player has voted */
  hasVoted: boolean;
  /** Vote results for current round */
  voteResults: VoteResult[];
  /** Round winners */
  winners: Winner[];
  /** Current scores sorted by score */
  scores: ScoreEntry[];
  /** Final standings (at game end) */
  finalStandings: ScoreEntry[];
  /** Final winner */
  finalWinner: ScoreEntry | null;
  /** Last error message */
  error: string | null;
  /** Number of players who have voted to skip the current question */
  skipVoteCount: number;
  /** Number of votes needed to skip the question (majority threshold) */
  skipVoteThreshold: number;
  /** Whether the current player has voted to skip */
  hasVotedToSkip: boolean;
}

/**
 * Initial game state values
 */
const initialGameState: GameState = {
  inRoom: false,
  roomId: null,
  roomCode: null,
  status: 'lobby',
  isHost: false,
  currentPlayer: null,
  players: [],
  settings: null,
  currentRound: 0,
  totalRounds: 3,
  question: null,
  phaseDuration: 0,
  countdownValue: null,
  timerSeconds: null,
  drawings: [],
  submittedCount: 0,
  votedCount: 0,
  hasSubmittedDrawing: false,
  drawingPhaseEnded: false,
  hasVoted: false,
  voteResults: [],
  winners: [],
  scores: [],
  finalStandings: [],
  finalWinner: null,
  error: null,
  skipVoteCount: 0,
  skipVoteThreshold: 0,
  hasVotedToSkip: false,
};

/**
 * Return type for useGameState hook
 */
export interface UseGameStateReturn {
  /** Current game state */
  gameState: GameState;
  /** Create a new room (becomes host) */
  createRoom: () => void;
  /** Join an existing room */
  joinRoom: (roomCode: string, playerName?: string) => void;
  /** Leave the current room */
  leaveRoom: () => void;
  /** Set player ready status */
  setReady: (isReady: boolean) => void;
  /** Update player name */
  updateName: (name: string) => void;
  /** Start the game (host only) */
  startGame: () => void;
  /** Submit a drawing */
  submitDrawing: (drawingData: string) => void;
  /** Cast a vote for a player */
  castVote: (votedForId: string) => void;
  /** Clear any error */
  clearError: () => void;
  /** Reset game state (for returning to lobby) */
  resetState: () => void;
  /** Reset game for "Play Again" while keeping same room */
  resetGame: () => void;
  /** Vote to skip/replace the current question */
  voteToSkipQuestion: () => void;
}

/**
 * React hook that listens to all game-related socket events and maintains
 * current game state (status, players, round, question, drawings, votes, scores).
 *
 * @example
 * ```tsx
 * function GameScreen() {
 *   const { gameState, createRoom, joinRoom, startGame, submitDrawing, castVote } = useGameState();
 *
 *   if (!gameState.inRoom) {
 *     return <JoinScreen onJoin={(code) => joinRoom(code)} />;
 *   }
 *
 *   switch (gameState.status) {
 *     case 'lobby':
 *       return <Lobby players={gameState.players} />;
 *     case 'drawing':
 *       return <DrawingCanvas question={gameState.question} onSubmit={submitDrawing} />;
 *     case 'voting':
 *       return <VotingScreen drawings={gameState.drawings} onVote={castVote} />;
 *     // ...
 *   }
 * }
 * ```
 */
export function useGameState(): UseGameStateReturn {
  const { socket, connected, emit } = useSocket();
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Helper to update state partially
  const updateState = useCallback((updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // ============ Room Events ============

    // Room created (host)
    const handleRoomCreated = (data: { room: SerializedRoom }) => {
      const { room } = data;
      updateState({
        inRoom: true,
        roomId: room.id,
        roomCode: room.code,
        status: room.status,
        isHost: true,
        players: room.players,
        settings: room.settings,
        totalRounds: room.settings.rounds,
        currentRound: room.gameState.currentRound,
        error: null,
      });
    };

    // Room joined (player)
    const handleRoomJoined = (data: { room: SerializedRoom; player: Player; isSpectator?: boolean }) => {
      const { room, player, isSpectator } = data;
      updateState({
        inRoom: true,
        roomId: room.id,
        roomCode: room.code,
        status: room.status,
        isHost: room.hostSocketId === socket.id,
        currentPlayer: player,
        players: room.players,
        settings: room.settings,
        totalRounds: room.settings.rounds,
        currentRound: room.gameState.currentRound,
        question: room.gameState.question,
        error: null,
      });
      // Log if joining as spectator
      if (isSpectator) {
        console.log('[useGameState] Joined as spectator, will participate next round');
      }
    };

    // Player joined the room
    const handlePlayerJoined = (data: { player: Player; playerCount: number }) => {
      const { player } = data;
      setGameState((prev) => ({
        ...prev,
        players: [...prev.players.filter((p) => p.id !== player.id), player],
      }));
    };

    // Player left the room
    const handlePlayerLeft = (data: { playerId: string; playerCount: number }) => {
      const { playerId } = data;
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== playerId),
      }));
    };

    // Room closed
    const handleRoomClosed = (data: { reason: string }) => {
      updateState({
        ...initialGameState,
        error: `Room closed: ${data.reason}`,
      });
    };

    // Room error
    const handleRoomError = (data: { error: string; message: string }) => {
      updateState({ error: data.message });
    };

    // ============ Player Events ============

    // Player updated (ready status, name change)
    const handlePlayerUpdated = (data: { player: Player }) => {
      const { player } = data;
      setGameState((prev) => {
        const updatedPlayers = prev.players.map((p) =>
          p.id === player.id ? player : p
        );
        const updatedCurrentPlayer =
          prev.currentPlayer?.id === player.id ? player : prev.currentPlayer;
        return {
          ...prev,
          players: updatedPlayers,
          currentPlayer: updatedCurrentPlayer,
        };
      });
    };

    // All players ready
    const handleAllReady = (data: { playerCount: number }) => {
      // This event informs us all players are ready
      // The host can now start the game
    };

    // Player promoted from spectator to active player
    const handlePlayerPromoted = (data: { player: Player }) => {
      const { player } = data;
      setGameState((prev) => {
        const updatedPlayers = prev.players.map((p) =>
          p.id === player.id ? player : p
        );
        const updatedCurrentPlayer =
          prev.currentPlayer?.id === player.id ? player : prev.currentPlayer;
        return {
          ...prev,
          players: updatedPlayers,
          currentPlayer: updatedCurrentPlayer,
        };
      });
    };

    // ============ Game Events ============

    // Game countdown started (3, 2, 1)
    const handleGameCountdown = (data: { count: number }) => {
      updateState({
        status: 'countdown',
        countdownValue: data.count,
      });
    };


    // Round started
    const handleRoundStart = (data: {
      round: number;
      totalRounds: number;
      question: string;
      duration: number;
    }) => {
      updateState({
        status: 'drawing',
        currentRound: data.round,
        totalRounds: data.totalRounds,
        question: data.question,
        phaseDuration: data.duration,
        timerSeconds: data.duration,
        countdownValue: null,
        drawings: [],
        submittedCount: 0,
        hasSubmittedDrawing: false,
        drawingPhaseEnded: false,
        hasVoted: false,
        votedCount: 0,
        voteResults: [],
        winners: [],
        skipVoteCount: 0,
        skipVoteThreshold: 0,
        hasVotedToSkip: false,
      });
    };

    // Timer tick
    const handleTimerTick = (data: { type: string; secondsRemaining: number; roomId: string }) => {
      // Update countdownValue for countdown timers, timerSeconds for drawing/voting timers
      if (data.type === 'countdown') {
        updateState({ countdownValue: data.secondsRemaining });
      } else {
        updateState({ timerSeconds: data.secondsRemaining });
      }
    };

    // ============ Drawing Events ============

    // Drawing submitted
    const handleDrawingSubmitted = (data: {
      playerId: string;
      submittedCount: number;
      totalPlayers: number;
    }) => {
      setGameState((prev) => ({
        ...prev,
        submittedCount: data.submittedCount,
        hasSubmittedDrawing:
          prev.hasSubmittedDrawing || data.playerId === prev.currentPlayer?.id,
      }));
    };

    // All drawings submitted
    const handleAllDrawingsSubmitted = (data: { submittedCount: number }) => {
      updateState({ submittedCount: data.submittedCount });
    };

    // Drawing phase ended (timer expired)
    const handleDrawingPhaseEnded = (_data: { reason: string }) => {
      // Signal that the drawing phase has ended - client should auto-submit
      // The drawingPhaseEnded flag will trigger auto-submit in DrawingCanvas
      updateState({ drawingPhaseEnded: true });
    };

    // ============ Skip Question Events ============

    // Skip vote received
    const handleSkipVoteReceived = (data: {
      playerId: string;
      skipVoteCount: number;
      totalActivePlayers: number;
      threshold: number;
    }) => {
      setGameState((prev) => ({
        ...prev,
        skipVoteCount: data.skipVoteCount,
        skipVoteThreshold: data.threshold,
        hasVotedToSkip: prev.hasVotedToSkip || data.playerId === prev.currentPlayer?.id,
      }));
    };

    // Question skipped - reset drawing state with new question
    const handleQuestionSkipped = (data: {
      newQuestion: string;
      round: number;
      duration: number;
    }) => {
      console.log('[useGameState] Question skipped, new question:', data.newQuestion);
      updateState({
        question: data.newQuestion,
        phaseDuration: data.duration,
        timerSeconds: data.duration,
        drawings: [],
        submittedCount: 0,
        hasSubmittedDrawing: false,
        drawingPhaseEnded: false,
        skipVoteCount: 0,
        skipVoteThreshold: 0,
        hasVotedToSkip: false,
      });
    };

    // ============ Voting Events ============

    // Voting phase started
    const handleVotingStart = (data: { drawings: Drawing[]; duration: number }) => {
      updateState({
        status: 'voting',
        drawings: data.drawings,
        phaseDuration: data.duration,
        timerSeconds: data.duration,
        votedCount: 0,
        hasVoted: false,
      });
    };

    // Vote received
    const handleVoteReceived = (data: {
      voterId: string;
      votedCount: number;
      totalPlayers: number;
    }) => {
      setGameState((prev) => ({
        ...prev,
        votedCount: data.votedCount,
        hasVoted: prev.hasVoted || data.voterId === prev.currentPlayer?.id,
      }));
    };

    // All players voted
    const handleAllVoted = (data: { votedCount: number }) => {
      updateState({ votedCount: data.votedCount });
    };

    // Voting phase ended (timer expired)
    const handleVotingPhaseEnded = (data: { reason: string }) => {
      // The server will calculate results and emit round:results
    };

    // ============ Results Events ============

    // Round results
    const handleRoundResults = (data: {
      round: number;
      winners: Winner[];
      voteResults: VoteResult[];
      scores: ScoreEntry[];
    }) => {
      // Update player scores in our players array
      setGameState((prev) => {
        const updatedPlayers = prev.players.map((player) => {
          const scoreEntry = data.scores.find((s) => s.playerId === player.id);
          return scoreEntry ? { ...player, score: scoreEntry.score } : player;
        });
        return {
          ...prev,
          status: 'results',
          winners: data.winners,
          voteResults: data.voteResults,
          scores: data.scores,
          players: updatedPlayers,
          timerSeconds: null,
        };
      });
    };

    // Game ended
    const handleGameEnd = (data: {
      standings: ScoreEntry[];
      winner: ScoreEntry | null;
      totalRounds: number;
    }) => {
      // Update player scores in our players array
      setGameState((prev) => {
        const updatedPlayers = prev.players.map((player) => {
          const scoreEntry = data.standings.find((s) => s.playerId === player.id);
          return scoreEntry ? { ...player, score: scoreEntry.score } : player;
        });
        return {
          ...prev,
          status: 'final',
          finalStandings: data.standings,
          finalWinner: data.winner,
          scores: data.standings,
          players: updatedPlayers,
          timerSeconds: null,
        };
      });
    };

    // Game reset (Play Again)
    const handleGameReset = (data: { room: SerializedRoom }) => {
      const { room } = data;
      setGameState((prev) => ({
        ...prev,
        status: room.status,
        players: room.players,
        currentRound: room.gameState.currentRound,
        question: null,
        drawings: [],
        submittedCount: 0,
        votedCount: 0,
        hasSubmittedDrawing: false,
        drawingPhaseEnded: false,
        hasVoted: false,
        voteResults: [],
        winners: [],
        scores: [],
        finalStandings: [],
        finalWinner: null,
        timerSeconds: null,
        countdownValue: null,
        phaseDuration: 0,
        // Update current player from the room data
        currentPlayer: prev.currentPlayer
          ? room.players.find((p) => p.id === prev.currentPlayer?.id) || prev.currentPlayer
          : null,
      }));
    };

    // Register all event listeners
    socket.on('room:created', handleRoomCreated);
    socket.on('room:joined', handleRoomJoined);
    socket.on('room:player-joined', handlePlayerJoined);
    socket.on('room:player-left', handlePlayerLeft);
    socket.on('room:closed', handleRoomClosed);
    socket.on('room:error', handleRoomError);
    socket.on('player:updated', handlePlayerUpdated);
    socket.on('ready:all-ready', handleAllReady);
    socket.on('player:promoted', handlePlayerPromoted);
    socket.on('game:countdown', handleGameCountdown);
    socket.on('round:start', handleRoundStart);
    socket.on('timer:tick', handleTimerTick);
    socket.on('drawing:submitted', handleDrawingSubmitted);
    socket.on('drawing:all-submitted', handleAllDrawingsSubmitted);
    socket.on('round:drawing-phase-ended', handleDrawingPhaseEnded);
    socket.on('question:skip-vote-received', handleSkipVoteReceived);
    socket.on('question:skipped', handleQuestionSkipped);
    socket.on('round:voting-start', handleVotingStart);
    socket.on('vote:received', handleVoteReceived);
    socket.on('voting:all-voted', handleAllVoted);
    socket.on('round:voting-phase-ended', handleVotingPhaseEnded);
    socket.on('round:results', handleRoundResults);
    socket.on('game:end', handleGameEnd);
    socket.on('game:reset', handleGameReset);

    // Cleanup listeners on unmount
    return () => {
      socket.off('room:created', handleRoomCreated);
      socket.off('room:joined', handleRoomJoined);
      socket.off('room:player-joined', handlePlayerJoined);
      socket.off('room:player-left', handlePlayerLeft);
      socket.off('room:closed', handleRoomClosed);
      socket.off('room:error', handleRoomError);
      socket.off('player:updated', handlePlayerUpdated);
      socket.off('ready:all-ready', handleAllReady);
      socket.off('player:promoted', handlePlayerPromoted);
      socket.off('game:countdown', handleGameCountdown);
      socket.off('round:start', handleRoundStart);
      socket.off('timer:tick', handleTimerTick);
      socket.off('drawing:submitted', handleDrawingSubmitted);
      socket.off('drawing:all-submitted', handleAllDrawingsSubmitted);
      socket.off('round:drawing-phase-ended', handleDrawingPhaseEnded);
      socket.off('question:skip-vote-received', handleSkipVoteReceived);
      socket.off('question:skipped', handleQuestionSkipped);
      socket.off('round:voting-start', handleVotingStart);
      socket.off('vote:received', handleVoteReceived);
      socket.off('voting:all-voted', handleAllVoted);
      socket.off('round:voting-phase-ended', handleVotingPhaseEnded);
      socket.off('round:results', handleRoundResults);
      socket.off('game:end', handleGameEnd);
      socket.off('game:reset', handleGameReset);
    };
  }, [socket, updateState]);

  // ============ Actions ============

  const createRoom = useCallback(() => {
    if (!connected) {
      updateState({ error: 'Not connected to server' });
      return;
    }
    emit('room:create');
  }, [connected, emit, updateState]);

  const joinRoom = useCallback(
    (roomCode: string, playerName?: string) => {
      if (!connected) {
        updateState({ error: 'Not connected to server' });
        return;
      }
      emit('room:join', { roomCode: roomCode.toUpperCase(), playerName });
    },
    [connected, emit, updateState]
  );

  const leaveRoom = useCallback(() => {
    if (!connected || !gameState.inRoom) return;
    emit('room:leave');
    setGameState(initialGameState);
  }, [connected, emit, gameState.inRoom]);

  const setReady = useCallback(
    (isReady: boolean) => {
      if (!connected || !gameState.inRoom) return;
      emit('player:ready', { isReady });
    },
    [connected, emit, gameState.inRoom]
  );

  const updateName = useCallback(
    (name: string) => {
      if (!connected || !gameState.inRoom) return;
      emit('player:update-name', { name });
    },
    [connected, emit, gameState.inRoom]
  );

  const startGame = useCallback(() => {
    if (!connected || !gameState.inRoom) return;
    emit('game:start');
  }, [connected, emit, gameState.inRoom]);

  const submitDrawing = useCallback(
    (drawingData: string) => {
      if (!connected || !gameState.inRoom || gameState.status !== 'drawing') return;
      if (gameState.hasSubmittedDrawing) return;
      emit('drawing:submit', { drawingData });
      updateState({ hasSubmittedDrawing: true });
    },
    [connected, emit, gameState.inRoom, gameState.status, gameState.hasSubmittedDrawing, updateState]
  );

  const castVote = useCallback(
    (votedForId: string) => {
      if (!connected || !gameState.inRoom || gameState.status !== 'voting') return;
      if (gameState.hasVoted) return;
      // Prevent voting for self
      if (votedForId === gameState.currentPlayer?.id) return;
      emit('vote:cast', { votedForId });
      updateState({ hasVoted: true });
    },
    [connected, emit, gameState.inRoom, gameState.status, gameState.hasVoted, gameState.currentPlayer, updateState]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const resetState = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  const resetGame = useCallback(() => {
    if (!connected || !gameState.inRoom || gameState.status !== 'final') return;
    emit('game:reset');
  }, [connected, emit, gameState.inRoom, gameState.status]);

  const voteToSkipQuestion = useCallback(() => {
    if (!connected || !gameState.inRoom || gameState.status !== 'drawing') return;
    if (gameState.hasVotedToSkip) return;
    emit('question:vote-skip');
    updateState({ hasVotedToSkip: true });
  }, [connected, emit, gameState.inRoom, gameState.status, gameState.hasVotedToSkip, updateState]);

  return {
    gameState,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    updateName,
    startGame,
    submitDrawing,
    castVote,
    clearError,
    resetState,
    resetGame,
    voteToSkipQuestion,
  };
}

export default useGameState;
