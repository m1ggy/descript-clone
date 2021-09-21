const userInitialState = {
  username: '',
  globalTime: '',
  projects: [],
};

export const createUserSlice = (set, get) => ({
  username: '',
  setUser: (userObject) => set(userObject),
  clearUser: () => set(userInitialState),
});
