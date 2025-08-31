# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DuckHunter is a browser-based retro-style duck hunting game built with TypeScript and KaPlay (game engine). The project recreates the classic Duck Hunt experience with modern web technologies.

## Development Commands

### Frontend (client/)
- **Development**: `cd client && npm run dev` - Start Vite dev server with hot reload
- **Build**: `cd client && npm run build` - Build TypeScript and bundle for production 
- **Preview**: `cd client && npm run preview` - Preview production build locally

## Architecture

### Game Engine
- Built with **KaPlay** (v3001.0.19) - A JavaScript game engine
- Uses **Vite** for bundling and development
- **TypeScript** with strict configuration for type safety

### Game Structure
- **Scene-based architecture**: login → main-menu → game → leaderboard → game-over
- **State management**: Centralized game state in `gameManager.ts` using KaPlay's state system
- **Entity system**: Separate entity files for game objects (duck, dog)

### Key Files
- `client/src/main.ts` - Main game entry point with all scene definitions
- `client/src/gameManager.ts` - Global game state management and scoring system
- `client/src/entities/` - Game entity classes (duck, dog)
- `client/src/kaplayCtx.ts` - KaPlay context initialization
- `client/src/constant.ts` - Game constants and configuration

### Game Flow
1. **Login scene**: Player name input
2. **Main menu**: Start game or view leaderboard with background music
3. **Game scene**: Core hunting gameplay with rounds (10 hunts per round, 3 bullets per hunt)
4. **Game over**: Score display and automatic return to menu
5. **Leaderboard**: Mock leaderboard display

### Asset Management
- Sprites loaded with animation configurations in `main.ts`
- Sounds and music with volume controls
- Assets expected in `client/public/` directory structure

### Game State System
- Uses KaPlay's built-in state management
- States: menu, cutscene, round-start, round-end, hunt-start, hunt-end, duck-hunted, duck-escaped
- State transitions managed through `gameManager.enterState()`

## Blockchain Integration

### Technology Stack
- **Cavos SDK** - Google OAuth authentication and Starknet wallet creation
- **Dojo Framework** - Smart contract backend on Starknet
- **Torii** - GraphQL indexer for querying blockchain data
- **Zustand** - Global state management with persistence

### Authentication Flow
1. **Google OAuth**: User authenticates via Cavos SDK
2. **Wallet Creation**: Automatic Starknet wallet generation
3. **Username Input**: Custom username modal (31 char limit for felt252)
4. **Player Verification**: Check if player exists in blockchain
5. **Spawn Player**: Call `spawn_player` contract method if new user

### Contract Integration
- **Network**: Starknet Mainnet
- **Methods Used**:
  - `spawn_player(player_name: felt252)` - Create new player
  - `update_game(points: u32, kills: u32)` - Update player stats

### Transaction Strategy
- **Background Processing**: All blockchain transactions happen silently
- **Optimistic Updates**: UI updates immediately without waiting for confirmation
- **Per-Shot Transactions**: Each successful duck hit triggers `update_game(10, 1)`
- **No Loading Interruptions**: Game flow never blocked by blockchain operations

### Data Architecture
- **Local State**: Optimistic UI updates via Zustand
- **Blockchain State**: Persistent player data via Dojo contracts
- **Real-time Queries**: Leaderboard data fetched via Torii GraphQL
- **Conflict Resolution**: Local optimistic state with blockchain sync

### Key Integration Files
- `client/src/config/cavosConfig.ts` - Cavos SDK and contract configuration
- `client/src/config/dojoConfig.ts` - Dojo/Torii connection settings
- `client/src/store/gameStore.ts` - Zustand store for auth and game state
- `client/src/hooks/` - Custom hooks for blockchain operations
- `client/src/services/` - Transaction and query services

## Development Notes

- The project uses Vite's base path `./` for relative asset loading
- TypeScript configured with strict mode and comprehensive linting rules
- Game includes pause functionality (P key) with audio context management
- **Blockchain Integration**: Leaderboard now sourced from Dojo contracts via Torii
- **Optimistic UX**: All blockchain operations happen in background without interrupting gameplay
- Background music management across scenes with global instance tracking