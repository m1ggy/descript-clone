import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import useMemento from './useMemento';
import useStore from '../store';
import { toast } from 'react-toastify';
import { baseurl } from '../constants';
const useEdit = () => {
  const transcription = useStore((state) => state.transcription);
  const currentProject = useStore((state) => state.currentProject);
  const { setNewMemento } = useMemento();
  const token = localStorage.getItem('accessToken');
  async function editAudioAndText(
    pIndex,
    wIndex,
    newWord,
    useExisting,
    newRecording,
    duration,
    start,
    end
  ) {
    let options = [];
    const audioId = uuidv4();
    const {
      files: { media },
    } = currentProject;
    let audio = null;

    console.log(pIndex, wIndex, newWord);
    setNewMemento(pIndex, wIndex, newWord);

    audio = media.filter((x) => x.type.includes('audio'))[0];

    audio = JSON.parse(JSON.stringify(audio));
    const editId = uuidv4();
    audio.duration = duration;
    audio.start = start;
    audio.end = end;
    audio.projectName = currentProject.projectName;
    audio.editId = editId;

    const blob = new Blob([JSON.stringify(audio)], {
      type: 'application/json',
    });

    transcription.forEach((ts) => {
      ts.words.forEach((word) => {
        if (word.word.toLowerCase() === newWord.toLowerCase()) {
          options.push(word);
        }
      });
    });

    try {
      if (useExisting && options.length) {
        toast.warn('Found existing word, using existing audio...', {
          autoClose: 2000,
        });
      } else if (useExisting && options.length <= 0) {
        toast.warn('');
      } else {
        const form = new FormData();
        form.append('media', newRecording, `${audioId}-media.webm`);
        form.append('existingAudio', blob);

        console.log(form.values());

        const { data } = await axios.post(
          `${baseurl}/edit/${currentProject._id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return new Promise((resolve) => resolve(data));
      }
    } catch (e) {
      return new Promise((resolve, reject) => reject(e));
    }
  }
  function deleteAudioAndText() {}
  function muteAudio() {}

  return {
    editAudioAndText,
    deleteAudioAndText,
    muteAudio,
  };
};
export default useEdit;
