export const createMementoSlice = (set, get) => ({
  memento: null,
  setMemento: (newMemento) => set({ memento: newMemento }),
  clearMemento: () => set({ memento: null }),
});
