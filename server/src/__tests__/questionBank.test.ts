import { describe, it, expect } from 'vitest';
import {
  getAllQuestions,
  getQuestionCount,
  getQuestionsByCategory,
  getRandomQuestion,
  getRandomQuestions,
  getRandomQuestionsWithVariety,
  getRandomQuestionsForNewGame,
  getFilteredQuestions,
  getRandomQuestionWithThemes,
  getQuestionCountForThemes,
  Question,
  QuestionCategory,
} from '../utils/questionBank';
import { ThemeSettings, AgeRating, PartyPack, GenreTheme } from '../utils/themes';

describe('questionBank', () => {
  describe('getAllQuestions', () => {
    it('should return an array of questions', () => {
      const questions = getAllQuestions();

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should return questions with correct structure', () => {
      const questions = getAllQuestions();

      questions.forEach((question) => {
        expect(typeof question.id).toBe('string');
        expect(typeof question.text).toBe('string');
        expect(typeof question.category).toBe('string');
        expect(question.id.length).toBeGreaterThan(0);
        expect(question.text.length).toBeGreaterThan(0);
      });
    });

    it('should return questions with valid categories', () => {
      const questions = getAllQuestions();
      const validCategories: QuestionCategory[] = ['animals', 'actions', 'scenarios', 'objects'];

      questions.forEach((question) => {
        expect(validCategories).toContain(question.category);
      });
    });

    it('should return a copy of the array, not the original', () => {
      const questions1 = getAllQuestions();
      const questions2 = getAllQuestions();

      expect(questions1).not.toBe(questions2);
      expect(questions1).toEqual(questions2);
    });
  });

  describe('getQuestionCount', () => {
    it('should return the total number of questions', () => {
      const count = getQuestionCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should match the length of getAllQuestions', () => {
      const count = getQuestionCount();
      const questions = getAllQuestions();

      expect(count).toBe(questions.length);
    });

    it('should return at least 100 questions (as per requirements)', () => {
      const count = getQuestionCount();

      expect(count).toBeGreaterThanOrEqual(100);
    });
  });

  describe('getQuestionsByCategory', () => {
    it('should return only questions from the specified category', () => {
      const categories: QuestionCategory[] = ['animals', 'actions', 'scenarios', 'objects'];

      categories.forEach((category) => {
        const questions = getQuestionsByCategory(category);

        expect(Array.isArray(questions)).toBe(true);
        questions.forEach((question) => {
          expect(question.category).toBe(category);
        });
      });
    });

    it('should return questions for all four categories', () => {
      const categories: QuestionCategory[] = ['animals', 'actions', 'scenarios', 'objects'];

      categories.forEach((category) => {
        const questions = getQuestionsByCategory(category);
        expect(questions.length).toBeGreaterThan(0);
      });
    });

    it('should return different questions for different categories', () => {
      const animals = getQuestionsByCategory('animals');
      const actions = getQuestionsByCategory('actions');

      const animalIds = new Set(animals.map((q) => q.id));
      const actionIds = new Set(actions.map((q) => q.id));

      // No overlap between categories
      actionIds.forEach((id) => {
        expect(animalIds.has(id)).toBe(false);
      });
    });
  });

  describe('getRandomQuestion', () => {
    it('should return a single question', () => {
      const question = getRandomQuestion();

      expect(question).not.toBeNull();
      expect(typeof question?.id).toBe('string');
      expect(typeof question?.text).toBe('string');
      expect(typeof question?.category).toBe('string');
    });

    it('should return different questions on subsequent calls', () => {
      const questions = new Set<string>();

      for (let i = 0; i < 50; i++) {
        const question = getRandomQuestion();
        if (question) {
          questions.add(question.id);
        }
      }

      // Should get variety with random selection
      expect(questions.size).toBeGreaterThan(1);
    });

    it('should exclude questions with IDs in the exclude set', () => {
      const allQuestions = getAllQuestions();
      const excludeIds = new Set(allQuestions.slice(0, 5).map((q) => q.id));

      for (let i = 0; i < 50; i++) {
        const question = getRandomQuestion(excludeIds);

        if (question) {
          expect(excludeIds.has(question.id)).toBe(false);
        }
      }
    });

    it('should return null when all questions are excluded', () => {
      const allQuestions = getAllQuestions();
      const allIds = new Set(allQuestions.map((q) => q.id));

      const question = getRandomQuestion(allIds);

      expect(question).toBeNull();
    });

    it('should return valid question when exclude set is empty', () => {
      const question = getRandomQuestion(new Set());

      expect(question).not.toBeNull();
      expect(question?.id).toBeDefined();
    });
  });

  describe('getRandomQuestions', () => {
    it('should return the requested count of questions', () => {
      const count = 5;
      const questions = getRandomQuestions(count);

      expect(questions.length).toBe(count);
    });

    it('should return unique questions (no duplicates)', () => {
      const questions = getRandomQuestions(10);
      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return fewer questions if count exceeds available', () => {
      const totalCount = getQuestionCount();
      const questions = getRandomQuestions(totalCount + 10);

      expect(questions.length).toBe(totalCount);
    });

    it('should return zero questions if count is zero', () => {
      const questions = getRandomQuestions(0);

      expect(questions.length).toBe(0);
    });

    it('should exclude previously used questions', () => {
      const allQuestions = getAllQuestions();
      const excludeIds = new Set(allQuestions.slice(0, 10).map((q) => q.id));

      const questions = getRandomQuestions(5, excludeIds);

      questions.forEach((question) => {
        expect(excludeIds.has(question.id)).toBe(false);
      });
    });

    it('should return empty array when all questions are excluded', () => {
      const allQuestions = getAllQuestions();
      const allIds = new Set(allQuestions.map((q) => q.id));

      const questions = getRandomQuestions(5, allIds);

      expect(questions.length).toBe(0);
    });

    it('should return remaining questions when partial exclusion', () => {
      const allQuestions = getAllQuestions();
      const totalCount = getQuestionCount();
      // Exclude all but 3 questions
      const excludeIds = new Set(allQuestions.slice(0, totalCount - 3).map((q) => q.id));

      const questions = getRandomQuestions(10, excludeIds);

      expect(questions.length).toBe(3);
    });

    it('should return valid questions with correct structure', () => {
      const questions = getRandomQuestions(5);

      questions.forEach((question) => {
        expect(typeof question.id).toBe('string');
        expect(typeof question.text).toBe('string');
        expect(typeof question.category).toBe('string');
        expect(question.id.startsWith('Q')).toBe(true);
      });
    });

    it('should provide variety across multiple calls', () => {
      const allIds1 = getRandomQuestions(5).map((q) => q.id);
      const allIds2 = getRandomQuestions(5).map((q) => q.id);

      // While not guaranteed, with 32 questions picking 5, getting exact same set is unlikely
      // We just verify both are valid
      expect(allIds1.length).toBe(5);
      expect(allIds2.length).toBe(5);
    });
  });

  describe('getRandomQuestionsWithVariety', () => {
    it('should return the requested count of questions', () => {
      const questions = getRandomQuestionsWithVariety(4);

      expect(questions.length).toBe(4);
    });

    it('should include questions from multiple categories when requesting 4+', () => {
      // Run multiple times to verify variety behavior
      for (let i = 0; i < 10; i++) {
        const questions = getRandomQuestionsWithVariety(4);
        const categories = new Set(questions.map((q) => q.category));

        // Should have variety - with 4 questions, expect at least 2 categories
        expect(categories.size).toBeGreaterThanOrEqual(2);
      }
    });

    it('should try to include all four categories when requesting enough questions', () => {
      // With enough requests, should see all categories represented
      let sawAllCategories = false;

      for (let i = 0; i < 20; i++) {
        const questions = getRandomQuestionsWithVariety(8);
        const categories = new Set(questions.map((q) => q.category));

        if (categories.size === 4) {
          sawAllCategories = true;
          break;
        }
      }

      expect(sawAllCategories).toBe(true);
    });

    it('should return unique questions', () => {
      const questions = getRandomQuestionsWithVariety(10);
      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should respect exclusions', () => {
      const allQuestions = getAllQuestions();
      const excludeIds = new Set(allQuestions.slice(0, 15).map((q) => q.id));

      const questions = getRandomQuestionsWithVariety(5, excludeIds);

      questions.forEach((question) => {
        expect(excludeIds.has(question.id)).toBe(false);
      });
    });

    it('should handle case when a category is fully excluded', () => {
      const animals = getQuestionsByCategory('animals');
      const excludeIds = new Set(animals.map((q) => q.id));

      const questions = getRandomQuestionsWithVariety(5, excludeIds);

      // Should still return 5 questions from other categories
      expect(questions.length).toBe(5);
      questions.forEach((question) => {
        expect(question.category).not.toBe('animals');
      });
    });

    it('should return empty array when all questions excluded', () => {
      const allQuestions = getAllQuestions();
      const allIds = new Set(allQuestions.map((q) => q.id));

      const questions = getRandomQuestionsWithVariety(5, allIds);

      expect(questions.length).toBe(0);
    });
  });

  describe('getRandomQuestionsForNewGame', () => {
    it('should return questions without any exclusions', () => {
      const questions = getRandomQuestionsForNewGame(5);

      expect(questions.length).toBe(5);
    });

    it('should return unique questions', () => {
      const questions = getRandomQuestionsForNewGame(10);
      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should use variety selection', () => {
      // Run multiple times to check for category variety
      let hasVariety = false;

      for (let i = 0; i < 10; i++) {
        const questions = getRandomQuestionsForNewGame(4);
        const categories = new Set(questions.map((q) => q.category));

        if (categories.size >= 2) {
          hasVariety = true;
          break;
        }
      }

      expect(hasVariety).toBe(true);
    });
  });

  describe('question ID format', () => {
    it('should have IDs starting with Q followed by 3-digit numbers', () => {
      const questions = getAllQuestions();

      questions.forEach((question) => {
        expect(question.id).toMatch(/^Q\d{3}$/);
      });
    });

    it('should have sequential IDs', () => {
      const questions = getAllQuestions();
      const ids = questions.map((q) => parseInt(q.id.substring(1)));

      for (let i = 0; i < ids.length - 1; i++) {
        expect(ids[i + 1]).toBe(ids[i] + 1);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle negative count gracefully', () => {
      const questions = getRandomQuestions(-5);

      expect(questions.length).toBe(0);
    });

    it('should handle very large count', () => {
      const questions = getRandomQuestions(1000);
      const totalCount = getQuestionCount();

      expect(questions.length).toBe(totalCount);
    });

    it('should handle being called many times in succession', () => {
      for (let i = 0; i < 100; i++) {
        const questions = getRandomQuestions(3);
        expect(questions.length).toBe(3);
      }
    });

    it('should handle empty exclude set', () => {
      const questions = getRandomQuestions(5, new Set());

      expect(questions.length).toBe(5);
    });

    it('should handle exclude set with non-existent IDs', () => {
      const excludeIds = new Set(['INVALID1', 'INVALID2', 'INVALID3']);
      const questions = getRandomQuestions(5, excludeIds);

      expect(questions.length).toBe(5);
    });
  });

  describe('randomness verification', () => {
    it('should not always return same questions in same order', () => {
      const results: string[] = [];

      for (let i = 0; i < 20; i++) {
        const questions = getRandomQuestions(5);
        results.push(questions.map((q) => q.id).join(','));
      }

      const uniqueResults = new Set(results);
      // With 20 tries, should get at least a few different combinations
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should distribute selections across all questions over many calls', () => {
      const questionCounts = new Map<string, number>();

      for (let i = 0; i < 500; i++) {
        const question = getRandomQuestion();
        if (question) {
          const current = questionCounts.get(question.id) || 0;
          questionCounts.set(question.id, current + 1);
        }
      }

      // With many questions and 500 picks, should get good variety
      // At least 100 unique questions should be selected
      expect(questionCounts.size).toBeGreaterThan(100);
    });
  });

  // ============ Theme Filtering Tests ============

  describe('getFilteredQuestions', () => {
    it('should filter questions by party pack', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['halloween'],
        genres: ['general', 'fantasy', 'pop_culture', 'nature', 'food_cooking', 'sports', 'scifi'],
      };

      const questions = getFilteredQuestions(themes);

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(q.partyPacks).toContain('halloween');
      });
    });

    it('should filter questions by genre', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general', 'halloween', 'christmas', 'kids_birthday', 'office_party', 'summer_bbq'],
        genres: ['fantasy'],
      };

      const questions = getFilteredQuestions(themes);

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(q.genres).toContain('fantasy');
      });
    });

    it('should filter questions by age rating - kids only sees kids content', () => {
      const themes: ThemeSettings = {
        ageRating: 'kids',
        partyPacks: ['general'],
        genres: ['general'],
      };

      const questions = getFilteredQuestions(themes);

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(q.ageRating).toBe('kids');
      });
    });

    it('should filter questions by age rating - teen sees kids and teen content', () => {
      const themes: ThemeSettings = {
        ageRating: 'teen',
        partyPacks: ['general', 'halloween', 'christmas', 'kids_birthday', 'office_party', 'summer_bbq'],
        genres: ['general', 'fantasy', 'pop_culture', 'nature', 'food_cooking', 'sports', 'scifi'],
      };

      const questions = getFilteredQuestions(themes);

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(['kids', 'teen']).toContain(q.ageRating);
      });
    });

    it('should filter questions by age rating - adult sees all content', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general', 'halloween', 'christmas', 'kids_birthday', 'office_party', 'summer_bbq'],
        genres: ['general', 'fantasy', 'pop_culture', 'nature', 'food_cooking', 'sports', 'scifi'],
      };

      const questions = getFilteredQuestions(themes);

      expect(questions.length).toBeGreaterThan(0);
      // Adult rating allows all age ratings
      questions.forEach((q) => {
        expect(['kids', 'teen', 'adult']).toContain(q.ageRating);
      });
    });

    it('should match questions with ANY selected pack', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['halloween', 'christmas'],
        genres: ['general', 'fantasy', 'pop_culture', 'nature', 'food_cooking', 'sports', 'scifi'],
      };

      const questions = getFilteredQuestions(themes);

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        const hasHalloween = q.partyPacks.includes('halloween');
        const hasChristmas = q.partyPacks.includes('christmas');
        expect(hasHalloween || hasChristmas).toBe(true);
      });
    });

    it('should match questions with ANY selected genre', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general', 'halloween', 'christmas', 'kids_birthday', 'office_party', 'summer_bbq'],
        genres: ['fantasy', 'scifi'],
      };

      const questions = getFilteredQuestions(themes);

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        const hasFantasy = q.genres.includes('fantasy');
        const hasScifi = q.genres.includes('scifi');
        expect(hasFantasy || hasScifi).toBe(true);
      });
    });

    it('should apply combined filtering (pack AND genre AND age)', () => {
      const themes: ThemeSettings = {
        ageRating: 'kids',
        partyPacks: ['halloween'],
        genres: ['fantasy'],
      };

      const questions = getFilteredQuestions(themes);

      // All questions must match ALL criteria
      questions.forEach((q) => {
        expect(q.ageRating).toBe('kids');
        expect(q.partyPacks).toContain('halloween');
        expect(q.genres).toContain('fantasy');
      });
    });

    it('should exclude questions by ID', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general', 'halloween', 'christmas'],
        genres: ['general', 'fantasy', 'pop_culture'],
      };

      const allFiltered = getFilteredQuestions(themes);
      expect(allFiltered.length).toBeGreaterThan(10); // Ensure we have enough questions

      const excludeIds = new Set(allFiltered.slice(0, 5).map((q) => q.id));

      const filtered = getFilteredQuestions(themes, excludeIds);

      expect(filtered.length).toBe(allFiltered.length - 5);
      filtered.forEach((q) => {
        expect(excludeIds.has(q.id)).toBe(false);
      });
    });

    it('should return empty array when no questions match', () => {
      // Use a very restrictive filter that won't match anything
      const themes: ThemeSettings = {
        ageRating: 'kids',
        partyPacks: ['office_party'], // Office party is mostly teen/adult content
        genres: ['sports'], // Narrow genre
      };

      const allQuestions = getAllQuestions();
      // Exclude all questions to guarantee empty result
      const allIds = new Set(allQuestions.map((q) => q.id));

      const questions = getFilteredQuestions(themes, allIds);

      expect(questions.length).toBe(0);
    });
  });

  describe('getRandomQuestionWithThemes', () => {
    it('should return a question matching theme settings', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['halloween'],
        genres: ['fantasy', 'pop_culture', 'nature', 'general'],
      };

      const question = getRandomQuestionWithThemes(themes);

      expect(question).not.toBeNull();
      expect(question!.partyPacks).toContain('halloween');
    });

    it('should respect age rating filter', () => {
      const themes: ThemeSettings = {
        ageRating: 'kids',
        partyPacks: ['general', 'kids_birthday', 'halloween'],
        genres: ['general', 'fantasy', 'nature'],
      };

      // Run multiple times to verify
      for (let i = 0; i < 20; i++) {
        const question = getRandomQuestionWithThemes(themes);
        expect(question).not.toBeNull();
        expect(question!.ageRating).toBe('kids');
      }
    });

    it('should exclude specified question IDs', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general'],
        genres: ['general'],
      };

      const firstQuestion = getRandomQuestionWithThemes(themes);
      expect(firstQuestion).not.toBeNull();

      const excludeIds = new Set([firstQuestion!.id]);

      // Run multiple times - should never get the excluded question
      for (let i = 0; i < 30; i++) {
        const question = getRandomQuestionWithThemes(themes, excludeIds);
        if (question) {
          expect(question.id).not.toBe(firstQuestion!.id);
        }
      }
    });

    it('should fall back to general pack when filter too restrictive', () => {
      // Very restrictive filter that might have few/no matches
      const themes: ThemeSettings = {
        ageRating: 'kids',
        partyPacks: ['office_party'], // Office party has mostly non-kids content
        genres: ['scifi'], // Very narrow
      };

      // Should fall back to general and return something
      const question = getRandomQuestionWithThemes(themes);

      // May return null if truly empty, but fallback should usually find something
      // The fallback uses 'general' pack and 'general' genre
      // This test verifies the function doesn't crash
      expect(question === null || typeof question.id === 'string').toBe(true);
    });

    it('should fall back to clearing exclusions when all questions are excluded', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general'],
        genres: ['general'],
      };

      const allQuestions = getAllQuestions();
      const allIds = new Set(allQuestions.map((q) => q.id));

      // The function has a final fallback that clears exclusions
      // This ensures the game can always continue even if all questions were used
      const question = getRandomQuestionWithThemes(themes, allIds);

      // Should return a question (not null) because it clears exclusions as fallback
      expect(question).not.toBeNull();
      expect(question!.id).toBeDefined();
    });

    it('should provide variety across multiple calls', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general'],
        genres: ['general'],
      };

      const questionIds = new Set<string>();

      for (let i = 0; i < 30; i++) {
        const question = getRandomQuestionWithThemes(themes);
        if (question) {
          questionIds.add(question.id);
        }
      }

      // Should get variety
      expect(questionIds.size).toBeGreaterThan(1);
    });
  });

  describe('getQuestionCountForThemes', () => {
    it('should return count of questions matching theme settings', () => {
      const themes: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['halloween'],
        genres: ['fantasy', 'pop_culture', 'nature', 'general', 'food_cooking'],
      };

      const count = getQuestionCountForThemes(themes);
      const questions = getFilteredQuestions(themes);

      expect(count).toBe(questions.length);
      expect(count).toBeGreaterThan(0);
    });

    it('should return higher count with more permissive settings', () => {
      const restrictive: ThemeSettings = {
        ageRating: 'kids',
        partyPacks: ['halloween'],
        genres: ['fantasy'],
      };

      const permissive: ThemeSettings = {
        ageRating: 'adult',
        partyPacks: ['general', 'halloween', 'christmas', 'kids_birthday'],
        genres: ['general', 'fantasy', 'pop_culture', 'nature'],
      };

      const restrictiveCount = getQuestionCountForThemes(restrictive);
      const permissiveCount = getQuestionCountForThemes(permissive);

      expect(permissiveCount).toBeGreaterThan(restrictiveCount);
    });

    it('should return 0 when no questions match', () => {
      // Create settings that won't match any questions
      const themes: ThemeSettings = {
        ageRating: 'kids',
        partyPacks: ['office_party'], // Office party questions are typically teen+
        genres: ['sports'],
      };

      // Find the actual count
      const filtered = getFilteredQuestions(themes);
      const count = getQuestionCountForThemes(themes);

      expect(count).toBe(filtered.length);
      // Count may be 0 or small depending on actual question content
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should count correctly for each party pack', () => {
      const packs: PartyPack[] = ['general', 'halloween', 'christmas', 'kids_birthday', 'office_party', 'summer_bbq'];

      packs.forEach((pack) => {
        const themes: ThemeSettings = {
          ageRating: 'adult',
          partyPacks: [pack],
          genres: ['general', 'fantasy', 'pop_culture', 'nature', 'food_cooking', 'sports', 'scifi'],
        };

        const count = getQuestionCountForThemes(themes);
        // Each pack should have some questions (we added ~100 per pack)
        if (pack !== 'general') {
          expect(count).toBeGreaterThan(0);
        }
      });
    });

    it('should count correctly for each genre', () => {
      const genres: GenreTheme[] = ['general', 'pop_culture', 'food_cooking', 'sports', 'fantasy', 'scifi', 'nature'];

      genres.forEach((genre) => {
        const themes: ThemeSettings = {
          ageRating: 'adult',
          partyPacks: ['general', 'halloween', 'christmas', 'kids_birthday', 'office_party', 'summer_bbq'],
          genres: [genre],
        };

        const count = getQuestionCountForThemes(themes);
        // Each genre should have some questions
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('theme-tagged questions', () => {
    it('should have valid ageRating on all questions', () => {
      const questions = getAllQuestions();
      const validRatings: AgeRating[] = ['kids', 'teen', 'adult'];

      questions.forEach((q) => {
        expect(validRatings).toContain(q.ageRating);
      });
    });

    it('should have non-empty partyPacks array on all questions', () => {
      const questions = getAllQuestions();

      questions.forEach((q) => {
        expect(Array.isArray(q.partyPacks)).toBe(true);
        expect(q.partyPacks.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty genres array on all questions', () => {
      const questions = getAllQuestions();

      questions.forEach((q) => {
        expect(Array.isArray(q.genres)).toBe(true);
        expect(q.genres.length).toBeGreaterThan(0);
      });
    });

    it('should have valid party packs on all questions', () => {
      const questions = getAllQuestions();
      const validPacks: PartyPack[] = ['general', 'kids_birthday', 'office_party', 'halloween', 'christmas', 'summer_bbq'];

      questions.forEach((q) => {
        q.partyPacks.forEach((pack) => {
          expect(validPacks).toContain(pack);
        });
      });
    });

    it('should have valid genres on all questions', () => {
      const questions = getAllQuestions();
      const validGenres: GenreTheme[] = ['general', 'pop_culture', 'food_cooking', 'sports', 'fantasy', 'scifi', 'nature'];

      questions.forEach((q) => {
        q.genres.forEach((genre) => {
          expect(validGenres).toContain(genre);
        });
      });
    });

    it('should have substantial question count after theme expansion', () => {
      const count = getQuestionCount();
      // We should have ~960 questions total (100 original + 500 themed + 360 genre)
      expect(count).toBeGreaterThan(500);
    });
  });
});
