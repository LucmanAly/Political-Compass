import { SAMPLE_ENTITIES } from '../data/sampleEntities.js';
import { normalizeEntity } from './entities.js';

export const ENTITY_STORAGE_KEY = 'political-compass.entities.v1';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadEntities() {
  if (!canUseStorage()) {
    return SAMPLE_ENTITIES.map(normalizeEntity);
  }

  try {
    const saved = window.localStorage.getItem(ENTITY_STORAGE_KEY);

    if (!saved) {
      return SAMPLE_ENTITIES.map(normalizeEntity);
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeEntity).filter((entity) => entity.name) : [];
  } catch {
    return SAMPLE_ENTITIES.map(normalizeEntity);
  }
}

export function saveEntities(entities) {
  if (!canUseStorage()) {
    return { ok: false, reason: 'storage-unavailable' };
  }

  try {
    window.localStorage.setItem(ENTITY_STORAGE_KEY, JSON.stringify(entities.map(normalizeEntity)));
    return { ok: true };
  } catch {
    return { ok: false, reason: 'storage-write-failed' };
  }
}

export function clearStoredEntities() {
  if (canUseStorage()) {
    window.localStorage.removeItem(ENTITY_STORAGE_KEY);
  }
}
