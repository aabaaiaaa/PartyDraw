/**
 * Question Bank
 * Contains drawing prompts organized by category for the party drawing game.
 * Includes functionality to get random questions while avoiding repeats.
 * Supports theme filtering by age rating, party packs, and genres.
 */

import {
  AgeRating,
  PartyPack,
  GenreTheme,
  ThemeSettings,
  isAgeRatingAllowed,
} from './themes';
import { ALL_THEMED_QUESTIONS, ThemedQuestionData } from './themedQuestions';
import { ALL_GENRE_QUESTIONS, GenreQuestionData } from './genreQuestions';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  /** Age-appropriate rating for this question */
  ageRating: AgeRating;
  /** Party packs this question belongs to */
  partyPacks: PartyPack[];
  /** Genre themes this question belongs to */
  genres: GenreTheme[];
}

export type QuestionCategory = 'animals' | 'actions' | 'scenarios' | 'objects';

/**
 * Question data for building the bank (text + tags)
 */
interface QuestionData {
  text: string;
  ageRating?: AgeRating;
  partyPacks?: PartyPack[];
  genres?: GenreTheme[];
}

// Animals - creatures to draw
const ANIMALS: QuestionData[] = [
  { text: 'A cat wearing a top hat', partyPacks: ['general'], genres: ['general', 'nature'] },
  { text: 'A dragon eating pizza', partyPacks: ['general'], genres: ['fantasy', 'food_cooking'] },
  { text: 'An elephant on a skateboard', partyPacks: ['general', 'kids_birthday'], genres: ['nature', 'sports'] },
  { text: 'A penguin at the beach', partyPacks: ['general', 'summer_bbq'], genres: ['nature'] },
  { text: 'A giraffe in a bathtub', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A shark with legs', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A sloth doing yoga', partyPacks: ['general'], genres: ['nature', 'sports'] },
  { text: 'A dinosaur playing guitar', partyPacks: ['general', 'kids_birthday'], genres: ['nature', 'pop_culture'] },
  { text: 'A hamster driving a race car', partyPacks: ['general'], genres: ['nature', 'sports'] },
  { text: 'A flamingo in winter clothes', partyPacks: ['general', 'christmas'], genres: ['nature'] },
  { text: 'A bear hosting a tea party', partyPacks: ['general', 'kids_birthday'], genres: ['nature', 'food_cooking'] },
  { text: 'A unicorn reading a book', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy', 'nature'] },
  { text: 'A turtle with a jet pack', partyPacks: ['general'], genres: ['nature', 'scifi'] },
  { text: 'A koala as a DJ', partyPacks: ['general'], genres: ['nature', 'pop_culture'] },
  { text: 'An octopus playing drums', partyPacks: ['general'], genres: ['nature', 'pop_culture'] },
  { text: 'A fox building a snowman', partyPacks: ['general', 'christmas'], genres: ['nature'] },
  { text: 'A panda wearing sunglasses', partyPacks: ['general', 'summer_bbq'], genres: ['nature'] },
  { text: 'A raccoon as a chef', partyPacks: ['general'], genres: ['nature', 'food_cooking'] },
  { text: 'A llama in pajamas', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A whale with wings', partyPacks: ['general'], genres: ['nature', 'fantasy'] },
  { text: 'A monkey painting a picture', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A hedgehog on a motorcycle', partyPacks: ['general'], genres: ['nature', 'sports'] },
  { text: 'A kangaroo playing tennis', partyPacks: ['general'], genres: ['nature', 'sports'] },
  { text: 'A bunny with a cape', partyPacks: ['general', 'kids_birthday'], genres: ['nature', 'fantasy'] },
  { text: 'A chicken driving a bus', partyPacks: ['general'], genres: ['nature'] },
];

// Actions - people or things doing activities
const ACTIONS: QuestionData[] = [
  { text: 'Someone dancing in the rain', partyPacks: ['general'], genres: ['general'] },
  { text: 'A chef juggling vegetables', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A robot learning to swim', partyPacks: ['general'], genres: ['scifi', 'sports'] },
  { text: 'A wizard casting a spell', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A superhero doing laundry', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture', 'fantasy'] },
  { text: 'A pirate walking the plank', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'An astronaut playing basketball', partyPacks: ['general'], genres: ['scifi', 'sports'] },
  { text: 'A detective solving a mystery', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A scientist discovering pizza', partyPacks: ['general'], genres: ['scifi', 'food_cooking'] },
  { text: 'A knight doing homework', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A mermaid learning to fly', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A ninja baking cookies', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'A vampire brushing teeth', partyPacks: ['general', 'halloween'], genres: ['fantasy'] },
  { text: 'A cowboy gardening', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A ghost doing exercises', partyPacks: ['general', 'halloween'], genres: ['fantasy', 'sports'] },
  { text: 'A princess building furniture', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A clown fixing a computer', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture'] },
  { text: 'A ballerina playing soccer', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A firefighter on a swing', partyPacks: ['general', 'kids_birthday'], genres: ['general'] },
  { text: 'A teacher skydiving', partyPacks: ['general', 'office_party'], genres: ['sports'] },
  { text: 'A doctor skateboarding', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A musician running a marathon', partyPacks: ['general'], genres: ['sports', 'pop_culture'] },
  { text: 'An artist playing video games', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'An inventor making breakfast', partyPacks: ['general'], genres: ['food_cooking', 'scifi'] },
  { text: 'A surfer knitting a sweater', partyPacks: ['general', 'summer_bbq'], genres: ['sports'] },
];

// Scenarios - situations or scenes
const SCENARIOS: QuestionData[] = [
  { text: 'A picnic on the moon', partyPacks: ['general', 'summer_bbq'], genres: ['scifi', 'food_cooking'] },
  { text: 'A traffic jam of animals', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A party in a treehouse', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A race between a turtle and a snail', partyPacks: ['general', 'kids_birthday'], genres: ['nature', 'sports'] },
  { text: 'A snowman in summer', partyPacks: ['general', 'summer_bbq', 'christmas'], genres: ['nature'] },
  { text: 'Aliens visiting a coffee shop', partyPacks: ['general'], genres: ['scifi', 'food_cooking'] },
  { text: 'A fish out of water', partyPacks: ['general'], genres: ['nature'] },
  { text: 'Breakfast in outer space', partyPacks: ['general'], genres: ['scifi', 'food_cooking'] },
  { text: 'A library full of robots', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A rainstorm of candy', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking', 'fantasy'] },
  { text: 'A concert for vegetables', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'A beach in winter', partyPacks: ['general', 'christmas'], genres: ['nature'] },
  { text: 'A museum at midnight', partyPacks: ['general', 'halloween'], genres: ['pop_culture'] },
  { text: 'A garden in the clouds', partyPacks: ['general'], genres: ['nature', 'fantasy'] },
  { text: 'A carnival underwater', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A classroom on Mars', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A wedding for penguins', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A parade of dinosaurs', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A restaurant for giants', partyPacks: ['general'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A playground on the ocean floor', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A circus in the jungle', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A market on a mountain', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A birthday party in a cave', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A race through the desert', partyPacks: ['general'], genres: ['nature', 'sports'] },
  { text: 'A festival in the rain forest', partyPacks: ['general'], genres: ['nature', 'pop_culture'] },
];

// Objects - everyday or unusual items
const OBJECTS: QuestionData[] = [
  { text: 'A flying car', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A haunted toaster', partyPacks: ['general', 'halloween'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A rainbow umbrella', partyPacks: ['general', 'kids_birthday'], genres: ['general'] },
  { text: 'A magic carpet', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A giant ice cream cone', partyPacks: ['general', 'kids_birthday', 'summer_bbq'], genres: ['food_cooking'] },
  { text: 'A time machine', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A treasure chest full of socks', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A singing cactus', partyPacks: ['general'], genres: ['nature', 'pop_culture'] },
  { text: 'A backpack full of clouds', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A telephone that tells jokes', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A mirror that shows the future', partyPacks: ['general', 'halloween'], genres: ['fantasy', 'scifi'] },
  { text: 'A chair made of bubbles', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A lamp with butterfly wings', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'A piano that plays itself', partyPacks: ['general'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A hat that grows flowers', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'A shoe that bounces like a ball', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },
  { text: 'A watch that controls time', partyPacks: ['general'], genres: ['scifi', 'fantasy'] },
  { text: 'A book with moving pictures', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A teapot that grants wishes', partyPacks: ['general'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A door to another world', partyPacks: ['general'], genres: ['fantasy', 'scifi'] },
  { text: 'A pencil that draws real things', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A compass that finds lost items', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A bicycle with rocket boosters', partyPacks: ['general'], genres: ['scifi', 'sports'] },
  { text: 'A telescope that sees dreams', partyPacks: ['general'], genres: ['fantasy', 'scifi'] },
  { text: 'A camera that captures sounds', partyPacks: ['general'], genres: ['scifi', 'pop_culture'] },
];

// Build the full question bank with IDs
function buildQuestionBank(): Question[] {
  const questions: Question[] = [];
  let id = 1;

  const addCategory = (prompts: QuestionData[], category: QuestionCategory) => {
    prompts.forEach((data) => {
      questions.push({
        id: `Q${String(id++).padStart(3, '0')}`,
        text: data.text,
        category,
        ageRating: data.ageRating || 'kids', // Default to kids-friendly
        partyPacks: data.partyPacks || ['general'],
        genres: data.genres || ['general'],
      });
    });
  };

  // Add themed questions (from themedQuestions.ts)
  const addThemedQuestions = (prompts: ThemedQuestionData[]) => {
    prompts.forEach((data) => {
      questions.push({
        id: `Q${String(id++).padStart(3, '0')}`,
        text: data.text,
        category: 'scenarios', // Default category for themed questions
        ageRating: data.ageRating || 'kids',
        partyPacks: data.partyPacks,
        genres: data.genres,
      });
    });
  };

  // Add genre questions (from genreQuestions.ts)
  const addGenreQuestions = (prompts: GenreQuestionData[]) => {
    prompts.forEach((data) => {
      questions.push({
        id: `Q${String(id++).padStart(3, '0')}`,
        text: data.text,
        category: 'scenarios', // Default category for genre questions
        ageRating: data.ageRating || 'kids',
        partyPacks: data.partyPacks,
        genres: data.genres,
      });
    });
  };

  // Original questions (100 questions)
  addCategory(ANIMALS, 'animals');
  addCategory(ACTIONS, 'actions');
  addCategory(SCENARIOS, 'scenarios');
  addCategory(OBJECTS, 'objects');

  // Themed pack questions (500 questions)
  addThemedQuestions(ALL_THEMED_QUESTIONS);

  // Genre questions (360 questions)
  addGenreQuestions(ALL_GENRE_QUESTIONS);

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

// ============ Theme Filtering Functions ============

/**
 * Checks if a question matches the given theme settings
 * @param question - The question to check
 * @param themes - The theme settings to filter by
 * @returns true if the question matches the theme criteria
 */
function questionMatchesThemes(question: Question, themes: ThemeSettings): boolean {
  // Check age rating (question must be <= room's max rating)
  if (!isAgeRatingAllowed(question.ageRating, themes.ageRating)) {
    return false;
  }

  // Check party packs
  // 'general' pack acts as wildcard - matches all questions that have 'general' in their packs
  // Other specific packs only match questions tagged with that pack
  const matchesPack = themes.partyPacks.some(pack => question.partyPacks.includes(pack));
  if (!matchesPack) {
    return false;
  }

  // Check genres
  // 'general' genre acts as wildcard - if selected, matches ALL questions regardless of their genre
  // This allows "general" to mean "all genres" for a broader question pool
  const hasGeneralGenre = themes.genres.includes('general');
  if (hasGeneralGenre) {
    // 'general' genre selected - match all questions (genre filter is bypassed)
    return true;
  }

  // Specific genres selected - question must match at least one
  const matchesGenre = themes.genres.some(genre => question.genres.includes(genre));
  if (!matchesGenre) {
    return false;
  }

  return true;
}

/**
 * Gets all questions filtered by theme settings
 * @param themes - The theme settings to filter by
 * @param excludeIds - Set of question IDs to exclude
 * @returns Array of questions matching the theme criteria
 */
export function getFilteredQuestions(
  themes: ThemeSettings,
  excludeIds: Set<string> = new Set()
): Question[] {
  return QUESTION_BANK.filter(
    (q) => !excludeIds.has(q.id) && questionMatchesThemes(q, themes)
  );
}

/**
 * Gets a single random question matching theme settings
 * Falls back to 'general' pack if no questions match
 * @param themes - The theme settings to filter by
 * @param excludeIds - Set of question IDs to exclude
 * @returns A random question matching themes, or null if none available
 */
export function getRandomQuestionWithThemes(
  themes: ThemeSettings,
  excludeIds: Set<string> = new Set()
): Question | null {
  let available = getFilteredQuestions(themes, excludeIds);

  // Fallback: if no questions match, try with general pack/genre only
  if (available.length === 0) {
    const fallbackThemes: ThemeSettings = {
      ageRating: themes.ageRating,
      partyPacks: ['general'],
      genres: ['general'],
    };
    available = getFilteredQuestions(fallbackThemes, excludeIds);
  }

  // Still empty? Clear exclusions and try again
  if (available.length === 0) {
    available = getFilteredQuestions(themes, new Set());
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

/**
 * Gets the count of questions available for the given theme settings
 * Useful for UI preview showing how many questions are available
 * @param themes - The theme settings to count for
 * @returns The number of questions matching the theme criteria
 */
export function getQuestionCountForThemes(themes: ThemeSettings): number {
  return getFilteredQuestions(themes, new Set()).length;
}
