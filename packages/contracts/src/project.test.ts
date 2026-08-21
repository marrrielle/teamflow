import { describe, expect, it } from 'vitest';
import { createProjectSchema } from './project';

describe('createProjectSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = createProjectSchema.parse({ name: 'Website Redesign', color: '#6366f1' });
    expect(result.name).toBe('Website Redesign');
  });

  it('accepts an optional description', () => {
    const result = createProjectSchema.parse({ name: 'Mobile App', color: '#10b981', description: 'iOS/Android client' });
    expect(result.description).toBe('iOS/Android client');
  });

  it('rejects an empty name', () => {
    expect(() => createProjectSchema.parse({ name: '', color: '#6366f1' })).toThrow();
  });

  it('rejects a name over 120 characters', () => {
    expect(() => createProjectSchema.parse({ name: 'x'.repeat(121), color: '#6366f1' })).toThrow();
  });

  it('rejects a color that is not a hex triplet', () => {
    expect(() => createProjectSchema.parse({ name: 'Project', color: 'indigo' })).toThrow();
  });

  it('rejects a missing color', () => {
    expect(() => createProjectSchema.parse({ name: 'Project' })).toThrow();
  });
});
