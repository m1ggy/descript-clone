export const createLoadingSlice = (set, get) => ({
  loading: false,
  setLoading: (newLoading) => set({ loading: newLoading }),
});
