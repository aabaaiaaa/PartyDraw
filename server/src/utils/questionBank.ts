/**
 * Question Bank
 * Contains drawing prompts organized by category for the party drawing game.
 * Includes functionality to get random questions while avoiding repeats.
 */

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
}

export type QuestionCategory = 'animals' | 'actions' | 'scenarios' | 'objects';

// Animals - creatures to draw
const ANIMALS: string[] = [
  'A cat wearing a top hat',
  'A dragon eating pizza',
  'An elephant on a skateboard',
  'A penguin at the beach',
  'A giraffe in a bathtub',
  'A shark with legs',
  'A sloth doing yoga',
  'A dinosaur playing guitar',
];

// Actions - people or things doing activities
const ACTIONS: string[] = [
  'Someone dancing in the rain',
  'A chef juggling vegetables',
  'A robot learning to swim',
  'A wizard casting a spell',
  'A superhero doing laundry',
  'A pirate walking the plank',
  'An astronaut playing basketball',
  'A detective solving a mystery',
];

// Scenarios - situations or scenes
const SCENARIOS: string[] = [
  'A picnic on the moon',
  'A traffic jam of animals',
  'A party in a treehouse',
  'A race between a turtle and a snail',
  'A snowman in summer',
  'Aliens visiting a coffee shop',
  'A fish out of water',
  'Breakfast in outer space',
];

// Objects - everyday or unusual items
const OBJECTS: string[] = [
  'A flying car',
  'A haunted toaster',
  'A rainbow umbrella',
  'A magic carpet',
  'A giant ice cream cone',
  'A time machine',
  'A treasure chest full of socks',
  'A singing cactus',
];

// Build the full question bank with IDs
function buildQuestionBank(): Question[] {
  const questions: Question[] = [];
  let id = 1;

  const addCategory = (prompts: string[], category: QuestionCategory) => {
    prompts.forEach((text) => {
      questions.push({
        id: `Q${String(id++).padStart(3, '0')}`,
        text,
        category,
      });
    });
  };

  addCategory(ANIMALS, 'animals');
  addCategory(ACTIONS, 'actions');
  addCategory(SCENARIOS, 'scenarios');
  addCategory(OBJECTS, 'objects');

  return questions;
}

// The complete question bank
const QUESTION_BANK: Question[] = buildQuestionBank();

/**
 * Gets all available questions
 * @returns Array of all questions in the bank
 */
export function getAllQuestions(): Question[] {
  return [...QUESTION_BANK];
}

/**
 * Gets the total number of questions available
 * @returns The count of questions in the bank
 */
export function getQuestionCount(): number {
  return QUESTION_BANK.length;
}

/**
 * Gets questions filtered by category
 * @param category - The category to filter by
 * @returns Array of questions in the specified category
 */
export function getQuestionsByCategory(category: QuestionCategory): Question[] {
  return QUESTION_BANK.filter((q) => q.category === category);
}

/**
 * Gets a single random question, optionally excluding specified questions
 * @param excludeIds - Set of question IDs to exclude
 * @returns A random question, or null if all questions have been used
 */
export function getRandomQuestion(excludeIds: Set<string> = new Set()): Question | null {
  const available = QUESTION_BANK.filter((q) => !excludeIds.has(q.id));

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

/**
 * Gets multiple random questions without repeats
 * @param count - Number of questions to retrieve
 * @param excludeIds - Set of question IDs to exclude (e.g., from previous games)
 * @returns Array of random questions (may be fewer than requested if not enough available)
 */
export function getRandomQuestions(
  count: number,
  excludeIds: Set<string> = new Set()
): Question[] {
  const available = QUESTION_BANK.filter((q) => !excludeIds.has(q.id));
  const selected: Question[] = [];
  const usedIndices = new Set<number>();

  // Limit to available questions
  const maxCount = Math.min(count, available.length);

  while (selected.length < maxCount) {
    const index = Math.floor(Math.random() * available.length);

    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selected.push(available[index]);
    }
  }

  return selected;
}

/**
 * Gets random questions ensuring variety across categories
 * Tries to include at least one question from each category when possible
 * @param count - Number of questions to retrieve
 * @param excludeIds - Set of question IDs to exclude
 * @returns Array of random questions with category variety
 */
export function getRandomQuestionsWithVariety(
  count: number,
  excludeIds: Set<string> = new Set()
): Question[] {
  const categories: QuestionCategory[] = ['animals', 'actions', 'scenarios', 'objects'];
  const selected: Question[] = [];
  const usedIds = new Set<string>(excludeIds);

  // First, try to get one from each category
  for (const category of categories) {
    if (selected.length >= count) break;

    const categoryQuestions = QUESTION_BANK.filter(
      (q) => q.category === category && !usedIds.has(q.id)
    );

    if (categoryQuestions.length > 0) {
      const index = Math.floor(Math.random() * categoryQuestions.length);
      const question = categoryQuestions[index];
      selected.push(question);
      usedIds.add(question.id);
    }
  }

  // Fill remaining slots with random questions
  while (selected.length < count) {
    const available = QUESTION_BANK.filter((q) => !usedIds.has(q.id));

    if (available.length === 0) break;

    const index = Math.floor(Math.random() * available.length);
    const question = available[index];
    selected.push(question);
    usedIds.add(question.id);
  }

  // Shuffle the final selection so categories aren't always in order
  return shuffleArray(selected);
}

/**
 * Fisher-Yates shuffle algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Resets and gets a fresh set of random questions (ignores exclusions)
 * Useful when starting a new game session
 * @param count - Number of questions to retrieve
 * @returns Array of random questions
 */
export function getRandomQuestionsForNewGame(count: number): Question[] {
  return getRandomQuestionsWithVariety(count, new Set());
}
