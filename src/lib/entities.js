import { clampCoordinate } from './coordinates.js';

export const ENTITY_TYPES = Object.freeze([
  { value: 'person', label: 'Person' },
  { value: 'party', label: 'Party' },
  { value: 'organization', label: 'Organization' },
  { value: 'ideology', label: 'Ideology' },
]);

export const ENTITY_TYPE_LABELS = Object.freeze(
  Object.fromEntries(ENTITY_TYPES.map(({ value, label }) => [value, label])),
);

export function createEntity(input = {}) {
  return normalizeEntity({
    ...input,
    id: input.id || createId(),
    createdAt: input.createdAt || Date.now(),
  });
}

export function normalizeEntity(input = {}) {
  const type = ENTITY_TYPES.some((option) => option.value === input.type) ? input.type : 'person';

  return {
    id: String(input.id || createId()),
    name: String(input.name || '').trim(),
    type,
    imageUrl: typeof input.imageUrl === 'string' ? input.imageUrl : '',
    economic: clampCoordinate(input.economic),
    social: clampCoordinate(input.social),
    notes: typeof input.notes === 'string' ? input.notes.trim() : '',
    createdAt: Number.isFinite(Number(input.createdAt)) ? Number(input.createdAt) : Date.now(),
  };
}

export function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return '?';
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `entity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
