import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Test setup', () => {
  it('vitest is working', () => {
    expect(true).toBe(true);
  });

  it('testing-library/react is working', () => {
    render(<div data-testid="test">Hello</div>);
    expect(screen.getByTestId('test')).toBeDefined();
  });
});
