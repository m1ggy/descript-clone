import { useState } from 'react';
import useStore from '../store';
let undoSnapshots = [];
let redoSnapshots = [];
const useMemento = (stateName) => {
  const saveState = useStore((state) => state[`set${stateName}`]);
  const state = useStore((state) => state[`${stateName}`]);
  const [memento, setMemento] = useState(null);

  function undo() {
    const snapshot = undoSnapshots.pop();
    redoSnapshots.push(snapshot);
    setMemento(snapshot);
  }

  function redo() {
    const snapshot = redoSnapshots.pop();
    undoSnapshots.push(snapshot);
    setMemento(snapshot);
  }

  function setNewMemento(snapshot) {
    undoSnapshots.push(memento);
    setMemento(snapshot);
  }

  ///TODO: Save changes to GCS

  /**
   * Saves changes to global state
   */
  function save() {
    saveState(memento);
    redoSnapshots = [];
    undoSnapshots = [];
  }

  return {
    save,
    setNewMemento,
    redo,
    undo,
    state,
  };
};

export default useMemento;
