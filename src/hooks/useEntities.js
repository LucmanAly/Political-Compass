import { useCallback, useEffect, useState } from 'react';
import { createEntity } from '../lib/entities.js';
import { loadEntities, saveEntities } from '../lib/store.js';

export function useEntities() {
  const [entities, setEntities] = useState(loadEntities);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const result = saveEntities(entities);
    setStorageError(result.ok ? '' : 'Changes are only available for this session.');
  }, [entities]);

  const addEntity = useCallback((input) => {
    const entity = createEntity(input);
    setEntities((current) => [...current, entity]);
    return entity;
  }, []);

  const updateEntity = useCallback((id, changes) => {
    setEntities((current) => current.map((entity) => (
      entity.id === id ? createEntity({ ...entity, ...changes, id: entity.id, createdAt: entity.createdAt }) : entity
    )));
  }, []);

  const deleteEntity = useCallback((id) => {
    setEntities((current) => current.filter((entity) => entity.id !== id));
  }, []);

  const replaceEntities = useCallback((nextEntities) => {
    setEntities(nextEntities.map(createEntity));
  }, []);

  return {
    entities,
    addEntity,
    updateEntity,
    deleteEntity,
    replaceEntities,
    storageError,
  };
}
