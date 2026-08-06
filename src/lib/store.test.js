import { afterEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_ENTITIES } from '../data/sampleEntities.js';
import {
  ENTITY_STORAGE_KEY,
  SAMPLE_CONTENT_STORAGE_KEY,
  loadEntities,
  migrateStoredPayload,
  saveEntities,
} from './store.js';

describe('storage migration', () => {
  afterEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ENTITY_STORAGE_KEY);
      window.localStorage.removeItem(SAMPLE_CONTENT_STORAGE_KEY);
    }
  });

  it('migrates the v1 plain array shape used by existing installs', () => {
    const payload = [
      {
        id: 'keep',
        name: 'Kept',
        type: 'person',
        economic: 2,
        social: -1,
        imageUrl: '',
        notes: '',
        createdAt: 1,
      },
      { id: 'blank', name: '  ', type: 'party' },
    ];

    const migrated = migrateStoredPayload(JSON.stringify(payload));
    expect(migrated.source).toBe('v1-array');
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.entities).toHaveLength(1);
    expect(migrated.entities[0].name).toBe('Kept');
  });

  it('migrates an envelope payload without changing entity identity', () => {
    const migrated = migrateStoredPayload({
      schemaVersion: 2,
      entities: [{ id: 'env', name: 'Envelope', type: 'ideology', economic: 0, social: 0 }],
    });
    expect(migrated.source).toBe('envelope');
    expect(migrated.entities[0].id).toBe('env');
  });

  it('returns null entities for corrupt JSON so callers can decide recovery', () => {
    expect(migrateStoredPayload('{not-json').entities).toBeNull();
    expect(migrateStoredPayload({ foo: true }).entities).toBeNull();
  });

  it('treats a missing key as a fresh install with sample data', () => {
    const result = loadEntities();
    expect(result.isSample).toBe(true);
    expect(result.entities.map((entity) => entity.id)).toEqual(
      SAMPLE_ENTITIES.map((entity) => entity.id),
    );
    expect(result.entities).toHaveLength(30);
  });

  it('upgrades the legacy ideology sample pack without touching other charts', () => {
    const legacy = [
      'sample-social-democracy',
      'sample-classical-liberalism',
      'sample-authoritarian-right',
      'sample-anarchism',
      'sample-centrism',
    ].map((id, index) => ({
      id,
      name: id,
      type: 'ideology',
      economic: 0,
      social: 0,
      createdAt: index + 1,
    }));
    window.localStorage.setItem(ENTITY_STORAGE_KEY, JSON.stringify(legacy));
    const result = loadEntities();
    expect(result.isSample).toBe(true);
    expect(result.entities.map((entity) => entity.id)).toEqual(
      SAMPLE_ENTITIES.map((entity) => entity.id),
    );
    expect(result.entities.filter((entity) => entity.type === 'person')).toHaveLength(10);
    expect(result.entities.filter((entity) => entity.type === 'party')).toHaveLength(10);
    expect(result.entities.filter((entity) => entity.type === 'ideology')).toHaveLength(10);
  });

  it('upgrades the persons-only sample pack to the full starter set', () => {
    const personsOnly = SAMPLE_ENTITIES
      .filter((entity) => entity.type === 'person')
      .map((entity) => ({ ...entity }));
    window.localStorage.setItem(ENTITY_STORAGE_KEY, JSON.stringify(personsOnly));
    const result = loadEntities();
    expect(result.isSample).toBe(true);
    expect(result.entities).toHaveLength(30);
  });

  it('refreshes pure sample charts when sample content version is outdated', () => {
    const stale = SAMPLE_ENTITIES.map((entity) => ({
      ...entity,
      notes: 'old note',
    }));
    window.localStorage.setItem(ENTITY_STORAGE_KEY, JSON.stringify(stale));
    window.localStorage.setItem(SAMPLE_CONTENT_STORAGE_KEY, '1');
    const result = loadEntities();
    expect(result.isSample).toBe(true);
    expect(result.entities[0].notes).toBe(SAMPLE_ENTITIES[0].notes);
    expect(window.localStorage.getItem(SAMPLE_CONTENT_STORAGE_KEY)).toBe('3');
  });

  it('never replaces an intentional empty chart with sample data', () => {
    window.localStorage.setItem(ENTITY_STORAGE_KEY, '[]');
    const result = loadEntities();
    expect(result.isSample).toBe(false);
    expect(result.entities).toEqual([]);
  });

  it('round-trips saves as the compatible v1 array', () => {
    const entities = SAMPLE_ENTITIES.slice(0, 2).map((entity) => ({ ...entity }));
    expect(saveEntities(entities).ok).toBe(true);
    const raw = JSON.parse(window.localStorage.getItem(ENTITY_STORAGE_KEY));
    expect(Array.isArray(raw)).toBe(true);
    expect(raw).toHaveLength(2);
  });
});
