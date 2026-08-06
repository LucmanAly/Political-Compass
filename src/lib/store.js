import {
  SAMPLE_CONTENT_VERSION,
  SAMPLE_ENTITIES,
  shouldUpgradeSamplePack,
} from '../data/sampleEntities.js';
import { normalizeEntity } from './entities.js';

/** Stable storage key — must remain compatible with existing installs. */
export const ENTITY_STORAGE_KEY = 'political-compass.entities.v1';
export const SAMPLE_CONTENT_STORAGE_KEY = 'political-compass.sample-content.v';
export const STORAGE_SCHEMA_VERSION = 1;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readSampleContentVersion() {
  if (!canUseStorage()) return 0;
  const raw = window.localStorage.getItem(SAMPLE_CONTENT_STORAGE_KEY);
  const version = Number(raw);
  return Number.isFinite(version) ? version : 0;
}

function writeSampleContentVersion(version = SAMPLE_CONTENT_VERSION) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SAMPLE_CONTENT_STORAGE_KEY, String(version));
}

/**
 * Migrate any historical payload into a plain Entity[].
 * v1: raw JSON array of entities (current production shape).
 * Future envelope: { schemaVersion, entities }.
 */
export function migrateStoredPayload(raw) {
  if (raw == null) {
    return { entities: null, source: 'empty', schemaVersion: 0 };
  }

  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { entities: null, source: 'invalid-json', schemaVersion: 0 };
    }
  }

  if (Array.isArray(parsed)) {
    return {
      entities: parsed.map(normalizeEntity).filter((entity) => entity.name),
      source: 'v1-array',
      schemaVersion: 1,
    };
  }

  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.entities)) {
    const version = Number(parsed.schemaVersion) || Number(parsed.version) || 1;
    return {
      entities: parsed.entities.map(normalizeEntity).filter((entity) => entity.name),
      source: 'envelope',
      schemaVersion: version,
    };
  }

  return { entities: null, source: 'unknown-shape', schemaVersion: 0 };
}

export function loadEntities() {
  if (!canUseStorage()) {
    return {
      entities: SAMPLE_ENTITIES.map(normalizeEntity),
      isSample: true,
      loadError: '',
    };
  }

  try {
    const saved = window.localStorage.getItem(ENTITY_STORAGE_KEY);

    if (saved == null) {
      writeSampleContentVersion();
      return {
        entities: SAMPLE_ENTITIES.map(normalizeEntity),
        isSample: true,
        loadError: '',
      };
    }

    const migrated = migrateStoredPayload(saved);

    if (migrated.entities == null) {
      writeSampleContentVersion();
      return {
        entities: SAMPLE_ENTITIES.map(normalizeEntity),
        isSample: true,
        loadError: 'Saved chart data could not be read. Showing sample positions instead.',
      };
    }

    // Upgrade previous built-in packs / refresh pure sample content; never touch user charts.
    if (shouldUpgradeSamplePack(migrated.entities, readSampleContentVersion())) {
      writeSampleContentVersion();
      return {
        entities: SAMPLE_ENTITIES.map(normalizeEntity),
        isSample: true,
        loadError: '',
      };
    }

    // Empty array is intentional user data — never overwrite with samples.
    return {
      entities: migrated.entities,
      isSample: false,
      loadError: '',
    };
  } catch {
    return {
      entities: SAMPLE_ENTITIES.map(normalizeEntity),
      isSample: true,
      loadError: 'Browser storage is unavailable. Changes stay in this session only.',
    };
  }
}

export function saveEntities(entities) {
  if (!canUseStorage()) {
    return { ok: false, reason: 'storage-unavailable' };
  }

  try {
    // Persist as the v1 plain array for maximum compatibility with existing installs.
    window.localStorage.setItem(
      ENTITY_STORAGE_KEY,
      JSON.stringify(entities.map(normalizeEntity)),
    );
    return { ok: true };
  } catch {
    return { ok: false, reason: 'storage-write-failed' };
  }
}

export function clearStoredEntities() {
  if (canUseStorage()) {
    window.localStorage.removeItem(ENTITY_STORAGE_KEY);
    window.localStorage.removeItem(SAMPLE_CONTENT_STORAGE_KEY);
  }
}
