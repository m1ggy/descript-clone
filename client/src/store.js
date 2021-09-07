import create from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserSlice } from './slices/userSlice';
import { createProjectSlice } from './slices/projectSlice';
const useStore = create(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
      ...createProjectSlice(set, get),
    }),
    {
      name: 'userInfo',
    }
  )
);

export default useStore;
