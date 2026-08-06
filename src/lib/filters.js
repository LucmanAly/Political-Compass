import { ENTITY_TYPES } from './entities.js';

export function createDefaultTypeSet() {
  return new Set(ENTITY_TYPES.map((type) => type.value));
}

export function filterEntities(entities, { query = '', types = null } = {}) {
  const normalizedQuery = String(query).trim().toLowerCase();
  const typeSet = types instanceof Set ? types : createDefaultTypeSet();

  return entities.filter((entity) => (
    typeSet.has(entity.type)
    && (!normalizedQuery || entity.name.toLowerCase().includes(normalizedQuery))
  ));
}

export function toggleTypeInSet(current, type) {
  const next = new Set(current);
  if (next.has(type)) next.delete(type);
  else next.add(type);
  return next;
}

export function sortEntitiesByName(entities) {
  return [...entities].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
