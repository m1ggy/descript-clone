import { useEffect } from 'react';
import useStore from '../store';

const mementoSelector = (state) => state.memento;
const useMemento = () => {
  ///latest change
  const setMemento = useStore((state) => state.setMemento);
  const memento = useStore(mementoSelector);
  const getMemento = useStore((state) => state.getMemento);
  const undoSnapshots = useStore((state) => state.undoSnapshots);
  const redoSnapshots = useStore((state) => state.redoSnapshots);
  const setUndo = useStore((state) => state.setUndo);
  const setRedo = useStore((state) => state.setRedo);

  useEffect(() => {
    console.log('undo', undoSnapshots);
  }, [undoSnapshots]);

  useEffect(() => {
    console.log('redo', redoSnapshots);
  }, [redoSnapshots]);

  /**
   * rollback changes from state
   */
  function undo() {
    const index = undoSnapshots.length - 1;
    console.log('index:', index);
    const snapshot = undoSnapshots[index];
    let tempArr = undoSnapshots.filter((x, i) => i !== index);
    console.log('temp array:', tempArr);
    setUndo(tempArr);
    const temp = JSON.parse(JSON.stringify(memento));
    setRedo([...redoSnapshots, temp]);
    setMemento(snapshot);
    console.log('undo');
  }

  /**
   * redo previous undo
   */
  function redo() {
    const index = redoSnapshots.length - 1;
    const snapshot = redoSnapshots[index];
    let tempArr = redoSnapshots.filter((x, i) => i !== index);
    setRedo(tempArr);
    const temp = JSON.parse(JSON.stringify(memento));
    setUndo([...undoSnapshots, temp]);
    setMemento(snapshot);
    console.log('redo');
  }

  /**
   * sets the memento to the given parameter
   * @param {Array.<Object>} snapshot new snapshot from user
   */
  function setNewMemento(pIndex, wIndex, newWord) {
    console.log(getMemento());
    let temp = JSON.parse(JSON.stringify(memento));
    temp[pIndex].words[wIndex].word = newWord;
    let oldMemento = JSON.parse(JSON.stringify(memento));
    setUndo([...undoSnapshots, oldMemento]);
    setMemento(temp);
  }

  ///TODO: Save changes to GCS

  /**
   * Saves changes to global state
   */
  function save() {
    console.log('saving');
    setRedo([]);
    setUndo([]);
  }

  /**
   * removes snapshots and current memento
   */
  function flush() {
    setRedo([]);
    setUndo([]);
    setMemento([]);
  }

  return {
    save,
    setNewMemento,
    redo,
    undo,
    memento,
    flush,
    undoSnapshots,
    redoSnapshots,
  };
};

export default useMemento;
