import create from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserSlice } from './slices/userSlice';
import { createProjectSlice } from './slices/projectSlice';
import { createCurrentProjectSlice } from './slices/currentProjectSlice';
import { createLoadingSlice } from './slices/loadingSlice';
const useStore = create(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
      ...createProjectSlice(set, get),
      ...createCurrentProjectSlice(set, get),
      ...createLoadingSlice(set, get),
    }),
    {
      name: 'userInfo',
    }
  )
);

export default useStore;
