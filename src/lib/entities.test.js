import { describe, expect, it } from 'vitest';
import { createEntity, getInitials, normalizeEntity } from './entities.js';

describe('entity model', () => {
  it('normalizes a valid entity and clamps its coordinates', () => {
    expect(normalizeEntity({
      id: 'one',
      name: '  Example Position  ',
      type: 'ideology',
      economic: 15,
      social: -12,
      notes: '  source note  ',
      createdAt: 12,
    })).toEqual({
      id: 'one',
      name: 'Example Position',
      type: 'ideology',
      imageUrl: '',
      economic: 10,
      social: -10,
      notes: 'source note',
      createdAt: 12,
    });
  });

  it('creates an entity with a stable id and defaults', () => {
    const entity = createEntity({ name: 'New position' });
    expect(entity.id).toBeTruthy();
    expect(entity.name).toBe('New position');
    expect(entity.type).toBe('person');
    expect(entity.economic).toBe(0);
    expect(entity.social).toBe(0);
  });

  it('generates readable initials for marker fallbacks', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('Madonna')).toBe('M');
    expect(getInitials('')).toBe('?');
  });
});
