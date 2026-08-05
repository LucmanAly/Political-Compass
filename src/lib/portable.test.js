import { describe, expect, it } from 'vitest';
import { createExportPayload, mergeImportedEntities, parseImportText } from './portable.js';

const baseEntity = {
  id: 'one',
  name: 'Example',
  type: 'ideology',
  economic: -2,
  social: 3,
  imageUrl: '',
  notes: '',
  createdAt: 1,
};

describe('portable entity data', () => {
  it('creates a versioned export envelope', () => {
    const payload = createExportPayload([baseEntity]);
    expect(payload.format).toBe('political-compass-entities');
    expect(payload.version).toBe(1);
    expect(payload.entities).toHaveLength(1);
  });

  it('parses, normalizes, and skips duplicate imported rows', () => {
    const result = parseImportText(JSON.stringify({ version: 1, entities: [baseEntity, baseEntity] }));
    expect(result.entities).toHaveLength(1);
    expect(result.skipped).toBe(1);
  });

  it('merges without overwriting an existing position', () => {
    const result = mergeImportedEntities([baseEntity], [{ ...baseEntity, id: 'one' }, { ...baseEntity, id: 'two', name: 'Second' }]);
    expect(result.entities).toHaveLength(2);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.entities[0].name).toBe('Example');
  });
});
