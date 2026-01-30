# PartyDraw - Requirements & Task List

## Overview
A multiplayer party drawing game where a main screen displays questions and results while player devices (phones) are used for drawing and voting. Uses Socket.IO for real-time communication and TestBoardBed harness for development/testing.

---

## Phase 1: Project Setup

### TASK-001: Create monorepo structure
- **Status**: done
- **Priority**: high
- **Dependencies**: none
- **Description**: Create root `package.json` with workspaces for `server/` and `client/` directories.

### TASK-002: Initialize server project
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-001
- **Description**: Set up Node.js + Express + Socket.IO + TypeScript in `server/` directory. Create `package.json` and `tsconfig.json`. Install dependencies: express, socket.io, uuid, cors, typescript, ts-node-dev.

### TASK-003: Initialize client project
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-001
- **Description**: Set up Vite + React + TypeScript in `client/` directory using `npm create vite@latest`. Install dependencies: socket.io-client, react, react-dom, typescript.

### TASK-004: Configure Tailwind CSS
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-003
- **Description**: Install and configure Tailwind CSS in client. Set up party game color theme with vibrant colors (purples, pinks, yellows, teals).

### TASK-005: Install animation and audio libraries
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Install framer-motion for animations, howler for audio, and qrcode.react for QR code generation.

### TASK-006: Configure development ports
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-002, TASK-003
- **Description**: Configure Vite to run client on port 5175, server on port 3001. Set up CORS to allow cross-origin requests between them.

### TASK-007: Create TestBoardBed console integration
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create `ConsoleCapture.ts` that intercepts console.log/warn/error and forwards them to parent window via postMessage for TestBoardBed integration.

---

## Phase 2: Server Core

### TASK-008: Create Express + Socket.IO server
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-002
- **Description**: Create `server/src/index.ts` and `server/src/app.ts` with Express server, Socket.IO integration, and CORS configuration.

### TASK-009: Implement room code generator
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-008
- **Description**: Create `server/src/utils/roomCodeGenerator.ts` that generates 6-character alphanumeric room codes (e.g., "PARTY7").

### TASK-010: Implement name generator
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-008
- **Description**: Create `server/src/utils/nameGenerator.ts` with arrays of verbs (Dancing, Jumping, Sleepy, etc.) and animals (Panda, Fox, Koala, etc.) to generate random player names.

### TASK-011: Create Player model
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-008
- **Description**: Create `server/src/models/Player.ts` with id, name, color, socketId, isReady, isConnected, score, and lastHeartbeat properties.

### TASK-012: Create Room model
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-011
- **Description**: Create `server/src/models/Room.ts` with id, code, hostSocketId, players map, status, game state, and settings (maxPlayers: 8, rounds: 3, drawingTime: 20s, votingTime: 15s).

### TASK-013: Implement RoomService
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-012
- **Description**: Create `server/src/services/RoomService.ts` with methods: createRoom(), joinRoom(), leaveRoom(), getRoom(), removePlayer(), closeRoom().

### TASK-014: Create Game state machine
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-012
- **Description**: Create `server/src/models/Game.ts` with state machine: lobby → countdown → drawing → voting → results → final. Include currentRound, totalRounds, question, drawings, votes.

### TASK-015: Implement TimerService
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-014
- **Description**: Create `server/src/services/TimerService.ts` with server-authoritative timers that broadcast ticks to all clients. Methods: startCountdown(), startDrawingTimer(), startVotingTimer(), clearTimer().

### TASK-016: Create question bank
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-008
- **Description**: Create `server/src/utils/questionBank.ts` with 20+ drawing prompts across categories (animals, actions, scenarios, objects). Include getRandomQuestions() function that avoids repeats.

### TASK-017: Implement ScoringService
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-014
- **Description**: Create `server/src/services/ScoringService.ts` that calculates scores: 100 points per vote received, up to 50 points speed bonus (linear scale from 0-10 seconds), no bonus for auto-submitted drawings.

---

## Phase 3: Socket Event Handlers

### TASK-018: Implement room Socket events
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-013
- **Description**: Create `server/src/socket/index.ts` with handlers for: room:create, room:join, room:leave. Emit: room:created, room:joined, room:player-joined, room:player-left, room:error.

### TASK-019: Implement player Socket events
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-018
- **Description**: Add handlers for: player:ready, player:update-name. Emit: player:updated, ready:all-ready when all players are ready.

### TASK-020: Implement game Socket events
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-014, TASK-015
- **Description**: Add handlers for: game:start (host only). Emit: game:countdown (3,2,1), round:start (question, duration), round:timer-tick (seconds remaining).

### TASK-021: Implement drawing Socket events
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-020
- **Description**: Add handlers for: drawing:submit (base64 image data). Emit: drawing:submitted (count update), drawing:all-submitted. Auto-submit remaining drawings when timer expires.

### TASK-022: Implement voting Socket events
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-021
- **Description**: Add handlers for: vote:cast (playerId). Emit: round:voting-start (all drawings), vote:received, round:results (winner, scores), game:end (final standings). Prevent voting for own drawing.

---

## Phase 4: Client Core

### TASK-023: Create Socket.IO client connection
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-006
- **Description**: Create `client/src/core/socket.ts` with Socket.IO client that connects to server on port 3001. Include reconnection logic and connection state management.

### TASK-024: Create useSocket hook
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-023
- **Description**: Create `client/src/hooks/useSocket.ts` that provides socket instance, connection status, and methods to emit events. Handle disconnection and reconnection.

### TASK-025: Implement URL parameter parsing
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-003
- **Description**: Create `client/src/utils/deviceId.ts` that parses URL params: sharedDeviceId (for host screen) and playerDeviceId (for player screen). Used by TestBoardBed to identify device roles.

### TASK-026: Create useGameState hook
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-024
- **Description**: Create `client/src/hooks/useGameState.ts` that listens to all game-related socket events and maintains current game state (status, players, round, question, drawings, votes, scores).

### TASK-027: Implement App routing
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-025
- **Description**: Update `client/src/App.tsx` to render HostScreen if sharedDeviceId is present, otherwise render PlayerScreen. Initialize ConsoleCapture on mount.

---

## Phase 5: Host Screen Components

### TASK-028: Create HostScreen container
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-027
- **Description**: Create `client/src/screens/HostScreen.tsx` that renders different components based on game status: HostLobby, Countdown, QuestionDisplay, DrawingGallery, VotingResults, or Leaderboard.

### TASK-029: Create HostLobby component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-028
- **Description**: Create `client/src/components/host/HostLobby.tsx` that displays: large QR code with room URL, room code text, player list with avatars and ready indicators, "Waiting for players" message.

### TASK-030: Create QRCodeDisplay component
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-029
- **Description**: Create `client/src/components/host/QRCodeDisplay.tsx` using qrcode.react to render scannable QR code for the room join URL.

### TASK-031: Create Countdown component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-028
- **Description**: Create `client/src/components/host/Countdown.tsx` that displays animated 3-2-1-GO! countdown with large numbers, pulsing animation, and sound effects.

### TASK-032: Create QuestionDisplay component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-028
- **Description**: Create `client/src/components/host/QuestionDisplay.tsx` that shows current question prominently, large countdown timer, and submission progress (e.g., "3/5 players submitted").

### TASK-033: Create DrawingGallery component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-028
- **Description**: Create `client/src/components/host/DrawingGallery.tsx` that displays all submitted drawings in a responsive grid during voting phase. Show player names under each drawing.

### TASK-034: Create VotingResults component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-028
- **Description**: Create `client/src/components/host/VotingResults.tsx` that highlights winning drawing, shows vote counts, displays round score breakdown with animations.

### TASK-035: Create Leaderboard component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-028
- **Description**: Create `client/src/components/host/Leaderboard.tsx` that shows final standings with podium animation (1st, 2nd, 3rd), confetti effect, scores, and "Play Again" button.

---

## Phase 6: Player Screen Components

### TASK-036: Create PlayerScreen container
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-027
- **Description**: Create `client/src/screens/PlayerScreen.tsx` that renders different components based on game status: JoinScreen, NamePicker, WaitingScreen, DrawingCanvas, VotingInterface, or score display.

### TASK-037: Create JoinScreen component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-036
- **Description**: Create `client/src/components/player/JoinScreen.tsx` with room code input field and Join button. Validate code format and show error messages.

### TASK-038: Create NamePicker component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-036
- **Description**: Create `client/src/components/player/NamePicker.tsx` that displays auto-generated name with color avatar, "Generate New Name" button, custom name input field, and large "Ready!" button.

### TASK-039: Create WaitingScreen component
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-036
- **Description**: Create `client/src/components/player/WaitingScreen.tsx` that shows "Waiting for host..." with animated dots, ready status of other players, and "Cancel Ready" option.

### TASK-040: Create DrawingCanvas component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-036
- **Description**: Create `client/src/components/player/DrawingCanvas.tsx` with HTML5 canvas that supports touch and mouse input. Use pointer events for unified handling. Prevent scroll while drawing with touch-action: none.

### TASK-041: Create useCanvas hook
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-040
- **Description**: Create `client/src/hooks/useCanvas.ts` with drawing logic: pointer event handlers, stroke rendering, color/size state, clear function, and captureDrawing() that exports canvas as base64 JPEG.

### TASK-042: Create DrawingControls component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-040
- **Description**: Create `client/src/components/player/DrawingControls.tsx` with color palette (8 colors), brush size selector (3 sizes), eraser toggle, clear button, and Submit button.

### TASK-043: Create VotingInterface component
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-036
- **Description**: Create `client/src/components/player/VotingInterface.tsx` that displays all drawings in scrollable grid. Tap to vote with visual feedback. Disable voting for own drawing. Show confirmation after voting.

---

## Phase 7: Game Flow Integration

### TASK-044: Implement auto-submit on timer expiry
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-021, TASK-040
- **Description**: When drawing timer expires on server, auto-submit any drawings not yet submitted. Client should capture current canvas state and send when receiving round:drawing-phase-ended event.

### TASK-045: Implement player disconnect handling
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-018
- **Description**: On socket disconnect, mark player as disconnected. After 10 seconds without reconnection, remove player from room. Notify other players via room:player-left event.

### TASK-046: Implement mid-game join
- **Status**: pending
- **Priority**: low
- **Dependencies**: TASK-018
- **Description**: Allow players to join during a game. New players spectate until the next round starts, then can participate. Show "Waiting for next round" message.

### TASK-047: Implement localStorage leaderboard
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-035
- **Description**: Create `client/src/utils/leaderboard.ts` that saves high scores to localStorage. Store player name, score, and date. Display top 10 scores on final leaderboard screen.

---

## Phase 8: Polish

### TASK-048: Add Framer Motion animations
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-028, TASK-036
- **Description**: Add animations throughout: player list slide-in, countdown pulse, drawing gallery reveal, score popup floats, winner highlight bounce, leaderboard podium rise.

### TASK-049: Add sound effects
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-005
- **Description**: Create `client/src/hooks/useAudio.ts` using Howler.js. Add sounds for: countdown ticks, round start, drawing submit, vote cast, round winner, game winner. Preload audio files.

### TASK-050: Add confetti celebration
- **Status**: pending
- **Priority**: low
- **Dependencies**: TASK-035
- **Description**: Create `client/src/components/common/Confetti.tsx` that displays confetti particle animation on final leaderboard and round winner screens.

### TASK-051: Implement responsive design
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-028, TASK-036
- **Description**: Ensure host screen works on tablets/TVs and player screen works on phones. Use Tailwind responsive classes. Test with TestBoardBed phone/tablet viewports.

### TASK-052: Add error handling and reconnection UX
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-024
- **Description**: Show connection status indicator. Display friendly error messages for: room not found, room full, connection lost. Add "Reconnecting..." overlay with retry button.

### TASK-053: Create common UI components
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-004
- **Description**: Create reusable components in `client/src/components/common/`: Button (variants: primary, secondary), Timer (circular countdown), PlayerAvatar (colored circle with initial/emoji).

---

## Phase 9: Testing

### TASK-054: Set up testing infrastructure
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-002, TASK-003
- **Description**: Install testing dependencies. Server: vitest, @types/node. Client: vitest, @testing-library/react, jsdom. Add test scripts to package.json files.

### TASK-055: Unit test ScoringService
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-017, TASK-054
- **Description**: Test scoring calculations: votes give 100 points each, speed bonus scales linearly (50pts at 0s, 0pts at 10s), auto-submitted drawings get no speed bonus, handles edge cases (no votes, all votes to one player).

### TASK-056: Unit test TimerService
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-015, TASK-054
- **Description**: Test timer behavior: countdown emits correct ticks, timer can be cleared, expired timer triggers callback, multiple timers for different rooms don't interfere.

### TASK-057: Unit test RoomService
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-013, TASK-054
- **Description**: Test room lifecycle: create room generates unique code, join room adds player, leave room removes player, room closes when host leaves, max 8 players enforced.

### TASK-058: Unit test Game state machine
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-014, TASK-054
- **Description**: Test state transitions: lobby → countdown requires all ready, drawing → voting on timer/all submitted, voting → results on timer/all voted, results → drawing or final based on round count.

### TASK-059: Unit test name generator
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-010, TASK-054
- **Description**: Test name generation: returns verb+animal format, generates different names on subsequent calls, all generated names are valid strings.

### TASK-060: Unit test question bank
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-016, TASK-054
- **Description**: Test question selection: getRandomQuestions returns requested count, excludes previously used questions, handles case where all questions used.

### TASK-061: Unit test useCanvas hook
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-041, TASK-054
- **Description**: Test canvas functionality: drawing strokes renders to canvas, clear erases canvas, captureDrawing returns valid base64 data URL, color and size changes apply correctly.

### TASK-062: Integration test Socket room events
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-018, TASK-054
- **Description**: Test Socket.IO room flow: client can create room and receive code, second client can join room, both clients receive player-joined event, leaving client triggers player-left event.

### TASK-063: Integration test Socket game events
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-020, TASK-021, TASK-022, TASK-054
- **Description**: Test Socket.IO game flow: game:start triggers countdown, round:start includes question, drawing:submit updates count, vote:cast calculates results correctly, game:end shows final standings.

### TASK-064: E2E test full game flow
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-044, TASK-054
- **Description**: Create Playwright E2E test using TestBoardBed: host creates room, 2 players join, all mark ready, game starts, players submit drawings, players vote, results shown, repeat for 3 rounds, final leaderboard displays winner.

### TASK-065: E2E test player disconnect
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-045, TASK-054
- **Description**: Create Playwright test: start game with 3 players, disconnect one player mid-round, verify remaining players can continue, verify disconnected player is removed from room.

### TASK-066: E2E test auto-submit
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-044, TASK-054
- **Description**: Create Playwright test: start game with 2 players, one submits drawing, one does not submit before timer expires, verify both drawings appear in voting gallery.

---

## Architecture Reference

```
TestBoardBed (port 5174)
  └── Multiple iframes loading PartyDraw client
      └── Console output via postMessage

PartyDraw Client (port 5175)
  ├── URL params determine view (host vs player)
  └── Socket.IO connection to server

PartyDraw Server (port 3001)
  ├── Room management
  ├── Game state machine
  ├── Server-authoritative timers
  └── Score calculation
```

## Testing Instructions

1. Start server: `cd server && npm run dev` (port 3001)
2. Start client: `cd client && npm run dev` (port 5175)
3. Start TestBoardBed: `cd ../TestBoardBed && npm run dev` (port 5174)
4. Open http://localhost:5174
5. Set URLs to `http://localhost:5175/`
6. Add shared screen + 2-4 players
7. Test full game flow
