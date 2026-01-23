/**
 * Name Generator
 * Generates random player names in "Verb Animal" format (e.g., "Dancing Panda")
 */

// Action verbs/adjectives for player names
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
 * @returns A random player name (e.g., "Dancing Panda")
 */
export function generatePlayerName(): string {
  const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${verb} ${animal}`;
}

/**
 * Generates a unique player name that doesn't exist in the provided set
 * @param existingNames - Set of existing player names to avoid
 * @param maxAttempts - Maximum number of attempts before returning a duplicate (default: 50)
 * @returns A unique player name, or a random name if max attempts reached
 */
export function generateUniquePlayerName(
  existingNames: Set<string>,
  maxAttempts: number = 50
): string {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const name = generatePlayerName();
    if (!existingNames.has(name)) {
      return name;
    }
  }
  // If we can't find a unique name after max attempts, return a random one anyway
  // This is unlikely with 625 combinations (25x25) and typically < 8 players
  return generatePlayerName();
}

/**
 * Gets the total number of possible name combinations
 * @returns The total number of unique Verb+Animal combinations
 */
export function getTotalCombinations(): number {
  return VERBS.length * ANIMALS.length;
}
