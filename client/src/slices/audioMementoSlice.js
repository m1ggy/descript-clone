export const createAudioMementoSlice = (set, get) => ({
  audioMemento: [],
  setAudioMemento: (newMemento) => set({ audioMemento: newMemento }),
});
