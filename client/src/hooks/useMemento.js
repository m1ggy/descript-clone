import { useState } from 'react';
import useStore from '../store';
let undoSnapshots = [];
let redoSnapshots = [];
const useMemento = (stateName) => {
  const saveState = useStore((state) => state[`set${stateName}`]);
  const state = useStore((state) => state[`${stateName}`]);
  const [memento, setMemento] = useState(null);

  /**
   * rollback changes from state
   */
  function undo() {
    const snapshot = undoSnapshots.pop();
    redoSnapshots.push(snapshot);
    setMemento(snapshot);
  }

  /**
   * redo previous undo
   */
  function redo() {
    const snapshot = redoSnapshots.pop();
    undoSnapshots.push(snapshot);
    setMemento(snapshot);
  }

  /**
   * sets the memento to the given parameter
   * @param {array} snapshot new snapshot from user
   */
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
