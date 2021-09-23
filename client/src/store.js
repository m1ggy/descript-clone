import create from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserSlice } from './slices/userSlice';
import { createProjectSlice } from './slices/projectSlice';
import { createCurrentProjectSlice } from './slices/currentProjectSlice';
import { createLoadingSlice } from './slices/loadingSlice';
import { createMementoSlice } from './slices/mementoSlice';
import { createTranscriptionSlice } from './slices/transcriptionSlice';
import { createSnapshotSlice } from './slices/snapshotsSlice';
import { createAudioMementoSlice } from './slices/audioMementoSlice';
const useStore = create(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
      ...createProjectSlice(set, get),
      ...createCurrentProjectSlice(set, get),
      ...createLoadingSlice(set, get),
      ...createMementoSlice(set, get),
      ...createTranscriptionSlice(set, get),
      ...createSnapshotSlice(set, get),
      ...createAudioMementoSlice(set, get),
    }),
    {
      name: 'userInfo',
    }
  )
);

export default useStore;
