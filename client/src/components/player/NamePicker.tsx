/**
 * NamePicker - Player name selection component
 *
 * Displays:
 * - Color avatar showing player's assigned color with initial
 * - Auto-generated name
 * - "Generate New Name" button to get a new random name
 * - Custom name input field for manual entry
 * - Theme voting section for suggesting preferred themes
 * - Large "Ready!" button to mark player as ready
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Player } from '../../hooks/useGameState';
import PlayerThemeVote from './PlayerThemeVote';
import { ThemeVote, ThemeVoteAggregation } from '../../types/themes';

// Action verbs/adjectives for player names (mirrors server-side generator)
const VERBS = [
  'Dancing',
  'Jumping',
  'Sleepy',
  'Happy',
  'Sneaky',
  'Bouncy',
  'Dizzy',
  'Hungry',
  'Silly',
  'Speedy',
  'Lazy',
  'Brave',
  'Curious',
  'Fluffy',
  'Grumpy',
  'Jolly',
  'Mighty',
  'Playful',
  'Quirky',
  'Wiggly',
  'Zippy',
  'Clever',
  'Cosmic',
  'Funky',
  'Groovy',
];

// Animals for player names
const ANIMALS = [
  'Panda',
  'Fox',
  'Koala',
  'Penguin',
  'Otter',
  'Bunny',
  'Tiger',
  'Dragon',
  'Dolphin',
  'Owl',
  'Sloth',
  'Raccoon',
  'Hippo',
  'Llama',
  'Moose',
  'Narwhal',
  'Platypus',
  'Quokka',
  'Toucan',
  'Walrus',
  'Alpaca',
  'Badger',
  'Capybara',
  'Gecko',
  'Hedgehog',
];

/**
 * Generates a random player name in "Verb Animal" format
 */
function generateRandomName(): string {
  const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${verb} ${animal}`;
}

interface NamePickerProps {
  player: Player;
  onUpdateName: (name: string) => void;
  onReady: (ready: boolean) => void;
  isReady: boolean;
  /** Current theme vote for this player */
  currentThemeVote?: ThemeVote | null;
  /** Callback when player votes for themes */
  onThemeVote?: (vote: ThemeVote) => void;
  /** Aggregated theme votes from all players */
  themeVoteAggregation?: ThemeVoteAggregation;
}

function NamePicker({
  player,
  onUpdateName,
  onReady,
  isReady,
  currentThemeVote,
  onThemeVote,
  themeVoteAggregation,
}: NamePickerProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [themeVoteCollapsed, setThemeVoteCollapsed] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering custom mode
  useEffect(() => {
    if (isCustomMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCustomMode]);

  // Generate a new random name with brief animation
  const handleGenerateNewName = useCallback(() => {
    setIsGenerating(true);
    const newName = generateRandomName();
    onUpdateName(newName);
    setIsCustomMode(false);
    setCustomName('');

    // Brief animation delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 300);
  }, [onUpdateName]);

  // Handle custom name input change
  const handleCustomNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // Max 20 characters
    setCustomName(value);
  }, []);

  // Submit custom name
  const handleCustomNameSubmit = useCallback(() => {
    const trimmedName = customName.trim();
    if (trimmedName && trimmedName !== player.name) {
      onUpdateName(trimmedName);
    }
    setIsCustomMode(false);
  }, [customName, player.name, onUpdateName]);

  // Handle key press in custom name input
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomNameSubmit();
    } else if (e.key === 'Escape') {
      setIsCustomMode(false);
      setCustomName('');
    }
  }, [handleCustomNameSubmit]);

  // Enter custom name mode
  const handleEnterCustomMode = useCallback(() => {
    setCustomName(player.name);
    setIsCustomMode(true);
  }, [player.name]);

  // Toggle ready status
  const handleReadyToggle = useCallback(() => {
    onReady(!isReady);
  }, [isReady, onReady]);

  // Get initials for avatar (first letter of each word, max 2)
  const getInitials = (name: string): string => {
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-teal-800 mb-4 sm:mb-6">Choose Your Name</h2>

      {/* Player Avatar with color */}
      <div
        className={`
          w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center
          text-2xl sm:text-3xl font-bold text-white shadow-lg
          transition-transform duration-300
          ${isGenerating ? 'scale-110' : 'scale-100'}
        `}
        style={{ backgroundColor: player.color }}
      >
        {getInitials(player.name)}
      </div>

      {/* Current name display or custom input */}
      {isCustomMode ? (
        <div className="mb-3 sm:mb-4">
          <input
            ref={inputRef}
            type="text"
            value={customName}
            onChange={handleCustomNameChange}
            onKeyDown={handleKeyPress}
            onBlur={handleCustomNameSubmit}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full text-center text-lg sm:text-xl font-semibold border-2 border-teal-400 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            aria-label="Custom name input"
          />
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Press Enter to save or Escape to cancel
          </p>
        </div>
      ) : (
        <button
          onClick={handleEnterCustomMode}
          disabled={isReady}
          className={`
            text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all
            ${isReady
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-800 hover:bg-teal-50 cursor-pointer'
            }
            ${isGenerating ? 'animate-pulse' : ''}
          `}
          aria-label="Click to edit name"
        >
          {player.name}
        </button>
      )}

      {/* Generate New Name button */}
      <button
        onClick={handleGenerateNewName}
        disabled={isReady || isCustomMode}
        className={`
          w-full font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all mb-3 sm:mb-4
          flex items-center justify-center gap-2 text-sm sm:text-base
          ${isReady || isCustomMode
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200 active:scale-[0.98]'
          }
        `}
      >
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 ${isGenerating ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Generate New Name
      </button>

      {/* Divider with "or" */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-xs sm:text-sm text-gray-500">or tap name to edit</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Theme Vote Section (optional) */}
      {onThemeVote && (
        <div className="mb-3 sm:mb-4">
          <PlayerThemeVote
            currentVote={currentThemeVote || null}
            onVote={onThemeVote}
            aggregation={themeVoteAggregation}
            collapsed={themeVoteCollapsed}
            onToggleCollapsed={() => setThemeVoteCollapsed(!themeVoteCollapsed)}
          />
        </div>
      )}

      {/* Ready Button */}
      <button
        onClick={handleReadyToggle}
        disabled={isCustomMode}
        className={`
          w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all text-lg sm:text-xl
          shadow-lg active:scale-[0.98]
          ${isCustomMode
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isReady
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200'
          }
        `}
      >
        {isReady ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Ready!
          </span>
        ) : (
          "I'm Ready!"
        )}
      </button>

      {/* Ready status message */}
      {isReady && (
        <div className="mt-3 sm:mt-4">
          <p className="text-sm sm:text-base text-green-600 font-medium animate-pulse">
            Waiting for host to start the game...
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Tap "Ready!" again to change your name
          </p>
        </div>
      )}
    </div>
  );
}

export default NamePicker;
