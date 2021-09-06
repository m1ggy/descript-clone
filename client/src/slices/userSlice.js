const userInitialState = {
  username: '',
  projects: [],
  globalTime: '',
};

export const createUserSlice = (set, get) => ({
  setUser: (userObject) => set(userObject),
  clearUser: () => set(userInitialState),
});
