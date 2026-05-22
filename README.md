# PartyDraw

A fun multiplayer party drawing game where players draw, vote, and compete!

## Features

- **Real-time multiplayer** - Powered by Socket.IO for instant synchronization
- **Host display + player devices** - One screen for everyone to watch, players use phones/tablets
- **QR code joining** - Scan to join instantly, no app download required
- **Anonymous voting** - Vote for your favorite drawings without knowing who drew them
- **Scoring with speed bonuses** - Earn points from votes plus bonus points for finishing quickly
- **Mid-game join support** - Late players can join between rounds
- **Confetti celebrations** - Celebrate winners with style!

## How to Play

### For the Host
1. Open the host URL on a TV or large screen: `http://localhost:5175/?sharedDeviceId=host`
2. A room is automatically created with a QR code displayed
3. Wait for all players to join and mark themselves as ready
4. Click "Start Game" when everyone is ready

### For Players
1. Scan the QR code on the host screen, or go to `http://localhost:5175/` and enter the room code
2. Enter your name and join the lobby
3. Mark yourself as ready
4. Draw the prompts when they appear
5. Vote for your favorite drawings (you can't vote for your own!)

### Game Flow
1. **Lobby** - Players join and ready up
2. **Countdown** - Get ready to draw!
3. **Drawing** (20 seconds) - Draw the prompt as fast as you can
4. **Voting** (15 seconds) - Vote for your favorite drawing
5. **Results** - See who won the round
6. **Repeat** for 3 rounds
7. **Final Winner** - Celebrate the champion!

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone repository
git clone <repo-url>
cd PartyDraw

# Install dependencies
npm install
```

### Running the Development Servers

You need to run the server and client in **separate terminals**:

```bash
# Terminal 1 - Start the server
npm run dev:server
```

```bash
# Terminal 2 - Start the client
npm run dev:client
```

- Server runs on http://localhost:3200
- Client runs on http://localhost:5175

### Accessing the Game

- **Host screen** (TV/large display): http://localhost:5175/?sharedDeviceId=host
- **Player screen** (phones/tablets): http://localhost:5175/

The host screen automatically creates a room and displays a QR code for players to join.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:server` | Run server (in one terminal) |
| `npm run dev:client` | Run client (in another terminal) |
| `npm run build` | Build for production |
| `npm run test` | Run unit/integration tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |

## Running Tests

### Unit/Integration Tests
Tests are run with Vitest in each workspace:

```bash
npm run test
```

### E2E Tests
End-to-end tests are run with Playwright:

```bash
# Run headless
npm run test:e2e

# Run with Playwright UI
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed
```

## Tech Stack

### Backend
- Node.js
- Express
- Socket.IO
- TypeScript

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion

### Testing
- Vitest (unit/integration)
- Playwright (E2E)

## Project Structure

```
PartyDraw/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   └── package.json
├── server/          # Node.js backend
│   ├── src/
│   │   ├── models/
│   │   ├── socket/
│   │   └── ...
│   └── package.json
├── e2e/             # E2E tests
├── package.json     # Workspace root
└── README.md
```

## Game Rules

- **Minimum players**: 2 players required to start
- **Maximum players**: 8 players per room
- **Ready requirement**: All players must be ready before the host can start
- **Voting restriction**: You cannot vote for your own drawing
- **Scoring**:
  - 100 points per vote received
  - Speed bonus: 0-50 points based on how quickly you finish drawing

## License

ISC
