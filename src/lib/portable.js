import { createId, normalizeEntity } from './entities.js';

export const EXPORT_FORMAT = 'political-compass-entities';
export const EXPORT_VERSION = 1;

export function createExportPayload(entities) {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    entities: entities.map(normalizeEntity),
  };
}

export function parseImportText(text) {
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  const rawEntities = Array.isArray(parsed) ? parsed : parsed?.entities;
  if (!Array.isArray(rawEntities)) {
    throw new Error('This file does not contain a valid entity list.');
  }

  const seenKeys = new Set();
  const entities = [];
  let skipped = 0;

  for (const rawEntity of rawEntities) {
    const entity = normalizeEntity(rawEntity);
    const key = `${entity.name.toLowerCase()}::${entity.type}::${entity.economic}::${entity.social}`;

    if (!entity.name || seenKeys.has(key)) {
      skipped += 1;
      continue;
    }

    seenKeys.add(key);
    entities.push(entity);
  }

  if (!entities.length && rawEntities.length) {
    throw new Error('No named entities could be recovered from this file.');
  }

  return {
    entities,
    skipped,
    version: Number(parsed?.version) || 0,
  };
}

export function mergeImportedEntities(existing, incoming) {
  const existingIds = new Set(existing.map((entity) => entity.id));
  const existingKeys = new Set(existing.map((entity) => `${entity.name.toLowerCase()}::${entity.type}::${entity.economic}::${entity.social}`));
  const merged = [...existing];
  let imported = 0;
  let skipped = 0;

  for (const incomingEntity of incoming) {
    const normalized = normalizeEntity(incomingEntity);
    const key = `${normalized.name.toLowerCase()}::${normalized.type}::${normalized.economic}::${normalized.social}`;

    if (!normalized.name || existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    const entity = existingIds.has(normalized.id)
      ? { ...normalized, id: createId() }
      : normalized;
    existingIds.add(entity.id);
    existingKeys.add(key);
    merged.push(entity);
    imported += 1;
  }

  return { entities: merged, imported, skipped };
}
