const userInitialState = {
  username: '',
  globalTime: '',
  projects: [],
};

export const createUserSlice = (set, get) => ({
  username: '',
  globalTime: '',
  setUser: (userObject) => set(userObject),
  clearUser: () => set(userInitialState),
});
