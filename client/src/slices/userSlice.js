const userInitialState = {
  username: '',
  globalTime: '',
  projects: [],
};

export const createUserSlice = (set, get) => ({
  username: '',
  globalTime: '',
  duration: '',
  setUser: (userObject) => set(userObject),
  clearUser: () => set(userInitialState),
  setGlobalTime: (newTime) => set({ globalTime: newTime }),
  setDuration: (newDuration) => set({ duration: newDuration }),
});
