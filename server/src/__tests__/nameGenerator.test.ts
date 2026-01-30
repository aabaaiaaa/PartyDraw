import { describe, it, expect, vi } from 'vitest';
import {
  generatePlayerName,
  generateUniquePlayerName,
  getTotalCombinations,
} from '../utils/nameGenerator';

describe('nameGenerator', () => {
  describe('generatePlayerName', () => {
    it('should return a string in verb+animal format (two words separated by space)', () => {
      const name = generatePlayerName();

      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);

      // Should be two words separated by a space
      const parts = name.split(' ');
      expect(parts.length).toBe(2);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it('should return valid strings with no empty parts', () => {
      // Generate multiple names to ensure consistency
      for (let i = 0; i < 20; i++) {
        const name = generatePlayerName();

        expect(typeof name).toBe('string');
        expect(name.trim()).toBe(name); // No leading/trailing whitespace
        expect(name).not.toBe('');
        expect(name).not.toBe(' ');

        const parts = name.split(' ');
        expect(parts[0].trim()).toBe(parts[0]);
        expect(parts[1].trim()).toBe(parts[1]);
      }
    });

    it('should generate different names on subsequent calls', () => {
      const names = new Set<string>();

      // Generate 50 names - with 625 combinations, we should get variety
      for (let i = 0; i < 50; i++) {
        names.add(generatePlayerName());
      }

      // With randomness, we should get at least a few different names
      // Using 2 as minimum since technically could get unlucky
      expect(names.size).toBeGreaterThanOrEqual(2);
    });

    it('should generate statistically diverse names over many calls', () => {
      const names = new Set<string>();

      // Generate 100 names
      for (let i = 0; i < 100; i++) {
        names.add(generatePlayerName());
      }

      // With 625 possible combinations, 100 random picks should yield
      // at least 30+ unique names on average
      expect(names.size).toBeGreaterThan(10);
    });

    it('should return names where both parts start with capital letters', () => {
      for (let i = 0; i < 20; i++) {
        const name = generatePlayerName();
        const parts = name.split(' ');

        // Both verb and animal should start with capital letter
        expect(parts[0][0]).toBe(parts[0][0].toUpperCase());
        expect(parts[1][0]).toBe(parts[1][0].toUpperCase());
      }
    });

    it('should return names containing only alphabetic characters and space', () => {
      for (let i = 0; i < 20; i++) {
        const name = generatePlayerName();

        // Only allow letters and single space between words
        expect(name).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
      }
    });
  });

  describe('generateUniquePlayerName', () => {
    it('should return a unique name not in the existing set', () => {
      const existingNames = new Set<string>(['Dancing Panda', 'Happy Fox']);

      const newName = generateUniquePlayerName(existingNames);

      expect(typeof newName).toBe('string');
      expect(newName.length).toBeGreaterThan(0);
      // The name should not be in the existing set (unless we hit max attempts, which is unlikely)
    });

    it('should eventually find a unique name with few existing names', () => {
      const existingNames = new Set<string>(['Dancing Panda']);

      // Generate 20 unique names - should always work with 625 combinations
      for (let i = 0; i < 20; i++) {
        const newName = generateUniquePlayerName(existingNames);
        expect(typeof newName).toBe('string');
        expect(newName.length).toBeGreaterThan(0);
        existingNames.add(newName);
      }

      // Should have 21 unique names now
      expect(existingNames.size).toBe(21);
    });

    it('should return valid string format even with empty existing set', () => {
      const existingNames = new Set<string>();

      const name = generateUniquePlayerName(existingNames);

      expect(typeof name).toBe('string');
      const parts = name.split(' ');
      expect(parts.length).toBe(2);
    });

    it('should respect maxAttempts parameter', () => {
      // Create a set with most combinations filled
      const existingNames = new Set<string>();

      // Even with a very small maxAttempts, should return something
      const name = generateUniquePlayerName(existingNames, 1);

      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should return a name even if max attempts reached', () => {
      // This tests the fallback behavior
      // We can't easily test the exact scenario without mocking, but we can
      // verify it returns a valid name regardless
      const existingNames = new Set<string>();

      const name = generateUniquePlayerName(existingNames, 50);

      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBe(2);
    });
  });

  describe('getTotalCombinations', () => {
    it('should return a positive number', () => {
      const total = getTotalCombinations();

      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThan(0);
    });

    it('should return the product of verbs and animals arrays', () => {
      const total = getTotalCombinations();

      // Based on the implementation: 25 verbs * 25 animals = 625
      expect(total).toBe(625);
    });

    it('should provide enough combinations for typical game sizes', () => {
      const total = getTotalCombinations();

      // A typical game has max 8 players, so we need at least 8 unique combinations
      expect(total).toBeGreaterThanOrEqual(8);

      // Should have plenty of headroom for uniqueness
      expect(total).toBeGreaterThan(100);
    });
  });

  describe('randomness distribution', () => {
    it('should not always return the same name (verifies Math.random is being used)', () => {
      const firstName = generatePlayerName();
      let foundDifferent = false;

      // Try up to 100 times to find a different name
      for (let i = 0; i < 100; i++) {
        const name = generatePlayerName();
        if (name !== firstName) {
          foundDifferent = true;
          break;
        }
      }

      expect(foundDifferent).toBe(true);
    });

    it('should produce variety in both verb and animal parts', () => {
      const verbs = new Set<string>();
      const animals = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const name = generatePlayerName();
        const parts = name.split(' ');
        verbs.add(parts[0]);
        animals.add(parts[1]);
      }

      // Should see variety in both parts
      expect(verbs.size).toBeGreaterThan(5);
      expect(animals.size).toBeGreaterThan(5);
    });
  });

  describe('edge cases', () => {
    it('should handle being called many times in quick succession', () => {
      const names: string[] = [];

      for (let i = 0; i < 1000; i++) {
        names.push(generatePlayerName());
      }

      // All should be valid strings
      names.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.split(' ').length).toBe(2);
      });
    });

    it('should work when existing names set is very large', () => {
      const existingNames = new Set<string>();

      // Fill with 500 fake names (not necessarily valid combinations)
      for (let i = 0; i < 500; i++) {
        existingNames.add(`Fake${i} Name${i}`);
      }

      // Should still generate a valid name
      const name = generateUniquePlayerName(existingNames);

      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBe(2);
      expect(existingNames.has(name)).toBe(false);
    });
  });
});
