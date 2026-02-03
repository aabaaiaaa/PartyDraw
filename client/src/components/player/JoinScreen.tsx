/**
 * JoinScreen - Room code input component for players to join a game
 *
 * Features:
 * - Room code input field (6 characters, alphanumeric)
 * - Format validation with error messages
 * - Join button to submit the code
 * - Auto-uppercase and formatting
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface JoinScreenProps {
  onJoin: (roomCode: string) => void;
  error: string | null;
  isJoining?: boolean;
}

/**
 * Validates room code format
 * Room codes are 6 characters, alphanumeric (letters and numbers)
 */
function validateRoomCode(code: string): { valid: boolean; message: string | null } {
  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length === 0) {
    return { valid: false, message: 'Please enter a room code' };
  }

  if (trimmedCode.length < 6) {
    return { valid: false, message: 'Room code must be 6 characters' };
  }

  if (trimmedCode.length > 6) {
    return { valid: false, message: 'Room code must be 6 characters' };
  }

  // Check for valid characters (alphanumeric only)
  if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
    return { valid: false, message: 'Room code can only contain letters and numbers' };
  }

  return { valid: true, message: null };
}

function JoinScreen({ onJoin, error, isJoining = false }: JoinScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear validation error when user types
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(value);

    // Clear validation error when user starts typing again
    if (hasAttemptedSubmit) {
      const validation = validateRoomCode(value);
      setValidationError(validation.valid ? null : validation.message);
    }
  }, [hasAttemptedSubmit]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validation = validateRoomCode(roomCode);

    if (!validation.valid) {
      setValidationError(validation.message);
      inputRef.current?.focus();
      return;
    }

    setValidationError(null);
    onJoin(roomCode.trim().toUpperCase());
  }, [roomCode, onJoin]);

  // Display error: server error takes precedence over validation error
  const displayError = error || validationError;

  return (
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-teal-800 mb-1 sm:mb-2">Join a Game</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Enter the room code shown on the main screen
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Room code input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            name="roomCode"
            value={roomCode}
            onChange={handleInputChange}
            placeholder="ABCD12"
            maxLength={6}
            disabled={isJoining}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            className={`
              w-full text-center text-2xl sm:text-3xl font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase
              text-gray-900
              border-2 rounded-lg px-3 py-3 sm:px-4 sm:py-4
              focus:outline-none transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${displayError
                ? 'border-red-400 focus:border-red-500 bg-red-50'
                : 'border-teal-300 focus:border-teal-500 bg-white'
              }
            `}
            aria-label="Room code"
            aria-invalid={!!displayError}
            aria-describedby={displayError ? 'error-message' : undefined}
          />

          {/* Character count indicator */}
          <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-mono">
            {roomCode.length}/6
          </div>
        </div>

        {/* Error message */}
        {displayError && (
          <p
            id="error-message"
            className="text-red-500 text-xs sm:text-sm flex items-center justify-center gap-1"
            role="alert"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {displayError}
          </p>
        )}

        {/* Join button */}
        <button
          type="submit"
          disabled={isJoining || roomCode.length === 0}
          className={`
            w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all
            text-white text-base sm:text-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isJoining
              ? 'bg-teal-500'
              : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98]'
            }
          `}
        >
          {isJoining ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Joining...
            </span>
          ) : (
            'Join Game'
          )}
        </button>
      </form>

      {/* Help text */}
      <p className="text-gray-500 text-[10px] sm:text-xs mt-4 sm:mt-6">
        Look for the 6-character code on the TV or host's screen
      </p>
    </div>
  );
}

export default JoinScreen;
