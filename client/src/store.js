import create from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserSlice } from './slices/userSlice';

const useStore = create(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
    }),
    {
      name: 'user',
      getStorage: localStorage,
    }
  )
);

export default useStore;
