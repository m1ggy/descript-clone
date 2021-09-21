export const createMementoSlice = (set, get) => ({
  memento: null,
  setMemento: (newMemento) => set({ memento: newMemento }),
  clearMemento: () => set({ memento: [] }),
  getMemento: () => {
    const temp = get().memento;
    return temp;
  },
});
