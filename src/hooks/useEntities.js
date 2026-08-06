import { useCallback, useEffect, useRef, useState } from 'react';
import { createEntity } from '../lib/entities.js';
import { loadEntities, saveEntities } from '../lib/store.js';

const UNDO_LIMIT = 30;

export function useEntities() {
  const initial = useRef(null);
  if (!initial.current) {
    initial.current = loadEntities();
  }

  const [entities, setEntities] = useState(initial.current.entities);
  const [storageError, setStorageError] = useState(initial.current.loadError || '');
  const [undoStack, setUndoStack] = useState([]);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const result = saveEntities(entities);
    if (!result.ok) {
      setStorageError(
        result.reason === 'storage-unavailable'
          ? 'Browser storage is unavailable. Changes stay in this session only.'
          : 'Could not save to browser storage. Changes may be lost when you leave.',
      );
    } else {
      setStorageError((current) => (
        current.startsWith('Could not save') || current.startsWith('Browser storage')
          ? ''
          : current
      ));
    }
  }, [entities]);

  const pushUndo = useCallback((snapshot, label) => {
    setUndoStack((stack) => {
      const next = [...stack, { entities: snapshot.map((entity) => ({ ...entity })), label }];
      return next.length > UNDO_LIMIT ? next.slice(next.length - UNDO_LIMIT) : next;
    });
  }, []);

  const snapshotForUndo = useCallback((label = 'change') => {
    setEntities((current) => {
      pushUndo(current, label);
      return current;
    });
  }, [pushUndo]);

  const addEntity = useCallback((input) => {
    const entity = createEntity(input);
    setEntities((current) => {
      pushUndo(current, 'add');
      return [...current, entity];
    });
    return entity;
  }, [pushUndo]);

  const updateEntity = useCallback((id, changes, options = {}) => {
    setEntities((current) => {
      if (options.recordUndo) {
        pushUndo(current, options.undoLabel || 'edit');
      }
      return current.map((entity) => (
        entity.id === id
          ? createEntity({ ...entity, ...changes, id: entity.id, createdAt: entity.createdAt })
          : entity
      ));
    });
  }, [pushUndo]);

  const deleteEntity = useCallback((id) => {
    setEntities((current) => {
      pushUndo(current, 'delete');
      return current.filter((entity) => entity.id !== id);
    });
  }, [pushUndo]);

  const replaceEntities = useCallback((nextEntities, options = {}) => {
    setEntities((current) => {
      if (options.recordUndo !== false) {
        pushUndo(current, options.undoLabel || 'replace');
      }
      return nextEntities.map(createEntity);
    });
  }, [pushUndo]);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (!stack.length) return stack;
      const previous = stack[stack.length - 1];
      setEntities(previous.entities);
      return stack.slice(0, -1);
    });
  }, []);

  const clearUndo = useCallback(() => setUndoStack([]), []);

  return {
    entities,
    addEntity,
    updateEntity,
    deleteEntity,
    replaceEntities,
    storageError,
    setStorageError,
    canUndo: undoStack.length > 0,
    undoLabel: undoStack.length ? undoStack[undoStack.length - 1].label : '',
    undo,
    clearUndo,
    snapshotForUndo,
  };
}
