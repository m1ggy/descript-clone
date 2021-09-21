export const createTranscriptionSlice = (set, get) => ({
  transcription: [],
  setTranscription: (transcription) => set({ transcription }),
  clearTranscription: () => set({ transcription: [] }),
});
