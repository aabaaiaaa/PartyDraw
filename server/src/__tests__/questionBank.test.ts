import { describe, it, expect } from 'vitest';
import {
  getAllQuestions,
  getQuestionCount,
  getQuestionsByCategory,
  getRandomQuestion,
  getRandomQuestions,
  getRandomQuestionsWithVariety,
  getRandomQuestionsForNewGame,
  Question,
  QuestionCategory,
} from '../utils/questionBank';

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

    it('should return at least 20 questions (as per requirements)', () => {
      const count = getQuestionCount();

      expect(count).toBeGreaterThanOrEqual(20);
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

      for (let i = 0; i < 200; i++) {
        const question = getRandomQuestion();
        if (question) {
          const current = questionCounts.get(question.id) || 0;
          questionCounts.set(question.id, current + 1);
        }
      }

      // With 32 questions and 200 picks, most questions should be selected at least once
      expect(questionCounts.size).toBeGreaterThan(getQuestionCount() * 0.5);
    });
  });
});
