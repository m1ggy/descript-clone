export const createCurrentProjectSlice = (set, get) => ({
  currentProject: {},
  setCurrentProject: (newProject) => set({ currentProject: newProject }),
});
