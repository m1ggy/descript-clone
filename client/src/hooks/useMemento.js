import useStore from '../store';

const mementoSelector = (state) => state.memento;
const useMemento = () => {
  ///latest change
  const setMemento = useStore((state) => state.setMemento);
  const memento = useStore(mementoSelector);

  const undoSnapshots = useStore((state) => state.undoSnapshots);
  const redoSnapshots = useStore((state) => state.redoSnapshots);
  const setUndo = useStore((state) => state.setUndo);
  const setRedo = useStore((state) => state.setRedo);

  /**
   * rollback changes from state
   */
  function undo() {
    const index = undoSnapshots.length - 1;

    const snapshot = undoSnapshots[index];
    let tempArr = undoSnapshots.filter((x, i) => i !== index);
    setUndo(tempArr);
    const temp = JSON.parse(JSON.stringify(memento));
    setRedo([...redoSnapshots, temp]);
    setMemento(snapshot);
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
  }

  /**
   * sets the memento to the given parameter
   * @param {Number} pIndex paragraph index
   * @param {Number} wIndex word index
   * @param {String} newWord new string to replace existing word
   */
  function setNewMemento(pIndex, wIndex, newWord) {
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
