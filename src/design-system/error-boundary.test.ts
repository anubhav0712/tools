import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from './error-boundary';

describe('ErrorBoundary', () => {
  it('updates state to hasError on getDerivedStateFromError', () => {
    const err = new Error('Malformed URL param');
    const state = ErrorBoundary.getDerivedStateFromError(err);
    expect(state.hasError).toBe(true);
    expect(state.error).toBe(err);
  });
});
