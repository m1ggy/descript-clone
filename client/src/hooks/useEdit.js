import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import useMemento from './useMemento';
import useStore from '../store';
import { toast } from 'react-toastify';
import { baseurl } from '../constants';
const useEdit = () => {
  const transcription = useStore((state) => state.transcription);
  const currentProject = useStore((state) => state.currentProject);
  const audioMemento = useStore((state) => state.audioMemento);
  const setAudioMemento = useStore((state) => state.setAudioMemento);
  const memento = useStore((state) => state.memento);
  const setTranscription = useStore((state) => state.setTranscription);
  const setMemento = useStore((state) => state.setMemento);
  const { setNewMemento } = useMemento();
  const token = localStorage.getItem('accessToken');
  async function editAudioAndText(
    pIndex,
    wIndex,
    newWord,
    useExisting,
    newRecording = null,
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
    let useEdited = false;
    let editedId = null;

    const editId = uuidv4();
    setNewMemento(pIndex, wIndex, newWord, editId);

    memento.forEach((x) => {
      if (x.editId) {
        editedId = x.editId;
        useEdited = true;
      }
    });

    console.log(audio);
    ///if we have an existing edited audio file, use that instead
    ///else use the default audio
    if (useEdited) {
      console.log('use edited', audio);
      [audio] = audioMemento.filter((x) => x.id.includes(`${editedId}`));
      audio = JSON.parse(JSON.stringify(audio));
      audio.duration = duration;
      audio.start = start;
      audio.end = end;
      audio.projectName = currentProject.projectName;
      audio.editId = editId;
    } else {
      [audio] = media.filter((x) => x.type.includes('audio'));
      console.log('use existing', audio);
      audio = JSON.parse(JSON.stringify(audio));
      audio.duration = duration;
      audio.start = start;
      audio.end = end;
      audio.projectName = currentProject.projectName;
      audio.editId = editId;
    }

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
      if (useExisting && options.length && newRecording != null) {
        toast.warn('Found existing word, using existing audio instead...', {
          autoClose: 2000,
        });

        const form = new FormData();
        const [audio] = media.filter((x) => x.type.includes('audio'));
        form.append('media', audio, `${audioId}-media.webm`);
        form.append('existingAudio', blob);
      } else if (useExisting && options.length && newRecording == null) {
        toast.warn('Found existing word, using existing audio...', {
          autoClose: 2000,
        });
      } else if (useExisting && options.length <= 0 && newRecording != null) {
        toast.warn('Found no existing word, using new recording...');
      } else if (useExisting && options.length <= 0 && newRecording == null) {
        toast.warn('Found existing word, editing the text only...', {
          autoClose: 2000,
        });
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

        setAudioMemento([...audioMemento, data]);

        return new Promise((resolve) => resolve());
      }
    } catch (e) {
      return new Promise((resolve, reject) => reject(e));
    }
  }

  async function flushEdits() {
    try {
      await axios.delete(`${baseurl}/edit/${currentProject._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          projectName: currentProject.projectName,
        },
      });
      return new Promise((resolve) => resolve());
    } catch {
      return new Promise((resolve, rejects) => rejects());
    }
  }

  async function saveAudio() {
    const newMemento = JSON.parse(JSON.stringify(memento));
    try {
      let editedId = null;

      memento.forEach((x) => {
        editedId = x.editId;
      });

      if (editedId) {
        const [audio] = audioMemento.filter((x) => x.id === editedId);

        if (audio) {
          await axios.patch(
            `${baseurl}/edit/${currentProject._id}`,
            { audio, projectName: currentProject.projectName },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
        newMemento.forEach((x) => {
          delete x.editId;
        });

        console.log(newMemento);
      }

      setMemento(newMemento);
      setTranscription(newMemento);

      return new Promise((resolve) => resolve());
    } catch {
      return new Promise((resolve, rejects) => rejects());
    }
  }
  function deleteAudioAndText() {}
  function muteAudio() {}

  return {
    editAudioAndText,
    deleteAudioAndText,
    muteAudio,
    flushEdits,
    saveAudio,
  };
};
export default useEdit;
