import { describe, expect, it } from 'vitest';
import {
  createDefaultTypeSet,
  filterEntities,
  sortEntitiesByName,
  toggleTypeInSet,
} from './filters.js';

const entities = [
  { id: '1', name: 'Ada', type: 'person', economic: 0, social: 0 },
  { id: '2', name: 'Labour', type: 'party', economic: -3, social: 1 },
  { id: '3', name: 'Anarchism', type: 'ideology', economic: -6, social: 7 },
  { id: '4', name: 'OECD', type: 'organization', economic: 2, social: 1 },
];

describe('entity filters', () => {
  it('starts with every type enabled', () => {
    expect(createDefaultTypeSet().size).toBe(4);
  });

  it('filters by name case-insensitively', () => {
    const result = filterEntities(entities, { query: 'ada', types: createDefaultTypeSet() });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by multi-select types', () => {
    const types = new Set(['party', 'ideology']);
    const result = filterEntities(entities, { query: '', types });
    expect(result.map((entity) => entity.id).sort()).toEqual(['2', '3']);
  });

  it('combines query and type filters', () => {
    const types = new Set(['ideology', 'person']);
    const result = filterEntities(entities, { query: 'an', types });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Anarchism');
  });

  it('toggles types without mutating the original set', () => {
    const original = createDefaultTypeSet();
    const withoutParty = toggleTypeInSet(original, 'party');
    expect(original.has('party')).toBe(true);
    expect(withoutParty.has('party')).toBe(false);
    expect(toggleTypeInSet(withoutParty, 'party').has('party')).toBe(true);
  });

  it('sorts entities by name', () => {
    expect(sortEntitiesByName(entities).map((entity) => entity.name)).toEqual([
      'Ada',
      'Anarchism',
      'Labour',
      'OECD',
    ]);
  });
});
