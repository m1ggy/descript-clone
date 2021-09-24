const userInitialState = {
  username: '',
  projects: [],
  loading: false,
};

export const createUserSlice = (set, get) => ({
  username: '',
  setUser: (userObject) => set(userObject),
  clearUser: () => set(userInitialState),
  setLoading: (loading) => set({ loading }),
});
