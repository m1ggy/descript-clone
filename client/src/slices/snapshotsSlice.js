export const createSnapshotSlice = (set, get) => ({
  undoSnapshots: [],
  redoSnapshots: [],
  createUndoSnapshot: (snapshot) => {
    const { undoSnapshots } = get();
    return set({ undoSnapshots: [...undoSnapshots, snapshot] });
  },
  createRedoSnapshot: (snapshot) => {
    const { redoSnapshots } = get();
    return set({ redoSnapshots: [...redoSnapshots, snapshot] });
  },
  setUndo: (newUndo) => set({ undoSnapshots: newUndo }),
  setRedo: (newRedo) => set({ redoSnapshots: newRedo }),
});
