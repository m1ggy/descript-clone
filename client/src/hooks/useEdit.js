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
  const { setNewMemento, setNewMementoAddWord } = useMemento();
  const token = localStorage.getItem('accessToken');
  async function editAudioAndText(
    pIndex,
    wIndex,
    newWord,
    newRecording = null,
    duration,
    start,
    end
  ) {
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
      if (x.editId && audioMemento.length) {
        editedId = x.editId;
        useEdited = true;
      }
    });

    ///if we have an existing edited audio file, use that instead
    ///else use the default audio
    if (useEdited) {
      [audio] = audioMemento.filter((x) => x.id.includes(`${editedId}`));
      audio = JSON.parse(JSON.stringify(audio));
      audio.duration = duration;
      audio.start = start;
      audio.end = end;
      audio.projectName = currentProject.projectName;
      audio.editId = editId;
    } else {
      [audio] = media.filter((x) => x.type.includes('audio'));
      audio = JSON.parse(JSON.stringify(audio));
      audio.duration = duration;
      audio.start = start;
      audio.end = end;
      audio.projectName = currentProject.projectName;
      audio.editId = editId;
    }

    try {
      const blob = new Blob([JSON.stringify(audio)], {
        type: 'application/json',
      });

      const form = new FormData();
      form.append('media', newRecording, `${audioId}-media.webm`);
      form.append('existingAudio', blob);

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
    } catch (e) {
      return new Promise((resolve, reject) => reject(e));
    }
  }

  async function editAudioWithExisting(
    pIndex,
    wIndex,
    newWord,
    start,
    end,
    duration
  ) {
    const {
      files: { media },
    } = currentProject;
    let options = [];
    let useEdited = false;
    let editedId = null;
    let audio = null;

    const editId = uuidv4();
    setNewMemento(pIndex, wIndex, newWord, editId);

    memento.forEach((x) => {
      if (x.editId && audioMemento.length) {
        editedId = x.editId;
        useEdited = true;
      }
    });

    transcription.forEach((ts) => {
      ts.words.forEach((word) => {
        if (word.word.toLowerCase() === newWord.toLowerCase()) {
          options.push(word);
        }
      });
    });

    if (useEdited) {
      [audio] = audioMemento.filter((x) => x.id.includes(`${editedId}`));
    } else {
      [audio] = media.filter((x) => x.type.includes('audio'));
    }

    if (options.length) {
      ////we use the first option only
      audio.originator = options[0];
      audio.start = start;
      audio.end = end;
      audio.duration = duration;
      audio.projectName = currentProject.projectName;
      audio.editId = editId;
    }

    try {
      if (options.length) {
        toast.warn('Found existing word, using existing audio...', {
          autoClose: 2000,
        });

        const { data } = await axios.post(
          `${baseurl}/edit/${currentProject._id}/existing`,
          { audio },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAudioMemento([...audioMemento, data]);
        return new Promise((resolve) => resolve());
      }

      return new Promise((resolve, reject) =>
        reject('Found no existing word.')
      );
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

      console.log(editedId);

      if (editedId) {
        const [audio] = audioMemento.filter((x) => x.id === editedId);
        console.log(editedId);
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
      }

      setMemento(newMemento);
      setTranscription(newMemento);

      return new Promise((resolve) => resolve());
    } catch {
      return new Promise((resolve, rejects) => rejects());
    }
  }

  async function addNewWord(
    pIndex,
    wIndex,
    newWord,
    position,
    newRecording = null
  ) {
    const {
      files: { media },
    } = currentProject;
    let options = [];
    let useEdited = false;
    let editedId = null;
    let audio = null;
    const editId = uuidv4();
    let wordObject = {};

    const tempMemento = JSON.parse(JSON.stringify(memento));

    const insert = (arr, index, newItem) => [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index),
    ];

    wordObject.word = newWord;
    wordObject.startTime = {
      seconds: 0,
      nanos: 0,
    };
    wordObject.endTime = {
      seconds: 0,
      nanos: 0,
    };

    wordObject.editId = editedId;

    if (position === 'l') {
      insert(tempMemento[pIndex].words, wIndex, wordObject);
    } else if (position === 'r') {
      insert(tempMemento[pIndex].words, wIndex + 1, wordObject);
    }

    setNewMementoAddWord(tempMemento);

    memento.forEach((x) => {
      if (x.editId && audioMemento.length) {
        editedId = x.editId;
        useEdited = true;
      }
    });

    transcription.forEach((ts) => {
      ts.words.forEach((word) => {
        if (word.word.toLowerCase() === newWord.toLowerCase()) {
          options.push(word);
        }
      });
    });

    if (useEdited) {
      [audio] = audioMemento.filter((x) => x.id.includes(`${editedId}`));
    } else {
      [audio] = media.filter((x) => x.type.includes('audio'));
    }

    if (options.length) {
      ////we use the first option only
      audio.originator = options[0];
      audio.projectName = currentProject.projectName;
      audio.editId = editId;
      audio.position = position;
    }

    try {
      if (options.length) {
        toast.warn('Found existing word, using existing audio...', {
          autoClose: 2000,
        });

        const blob = new Blob([JSON.stringify(audio)], {
          type: 'application/json',
        });

        const form = new FormData();

        if (newRecording) {
          form.append('media', newRecording, `${editedId}-media.webm`);
        }
        form.append('existingAudio', blob);

        const { data } = await axios.post(
          `${baseurl}/edit/${currentProject._id}/addWord`,
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

      return new Promise((resolve, reject) =>
        reject('Found no existing word.')
      );
    } catch (e) {
      return new Promise((resolve, reject) => reject(e));
    }
  }
  function deleteAudioAndText() {}

  return {
    editAudioAndText,
    deleteAudioAndText,
    flushEdits,
    saveAudio,
    editAudioWithExisting,
    addNewWord,
  };
};
export default useEdit;
