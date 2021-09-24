import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import useMemento from './useMemento';
import useStore from '../store';

import { baseurl } from '../constants';
import getBlobDuration from 'get-blob-duration';
const useEdit = () => {
  const transcription = useStore((state) => state.transcription);
  const currentProject = useStore((state) => state.currentProject);
  const audioMemento = useStore((state) => state.audioMemento);
  const setAudioMemento = useStore((state) => state.setAudioMemento);
  const memento = useStore((state) => state.memento);
  const setTranscription = useStore((state) => state.setTranscription);
  const setMemento = useStore((state) => state.setMemento);
  const { setNewMementoAddWord } = useMemento();
  const token = localStorage.getItem('accessToken');
  // async function editAudioAndText(
  //   pIndex,
  //   wIndex,
  //   newWord,
  //   newRecording = null,
  //   duration,
  //   start,
  //   end
  // ) {
  //   const audioId = uuidv4();
  //   const {
  //     files: { media },
  //   } = currentProject;
  //   let audio = null;
  //   let useEdited = false;
  //   let editedId = null;

  //   const editId = uuidv4();

  //   memento.forEach((x) => {
  //     if (x.editId && audioMemento.length) {
  //       editedId = x.editId;
  //       useEdited = true;
  //     }
  //   });

  //   ///if we have an existing edited audio file, use that instead
  //   ///else use the default audio
  //   if (useEdited) {
  //     [audio] = audioMemento.filter((x) => x.id.includes(`${editedId}`));
  //     audio = JSON.parse(JSON.stringify(audio));
  //     audio.duration = duration;
  //     audio.start = start;
  //     audio.end = end;
  //     audio.projectName = currentProject.projectName;
  //     audio.editId = editId;
  //   } else {
  //     [audio] = media.filter((x) => x.type.includes('audio'));
  //     audio = JSON.parse(JSON.stringify(audio));
  //     audio.duration = duration;
  //     audio.start = start;
  //     audio.end = end;
  //     audio.projectName = currentProject.projectName;
  //     audio.editId = editId;
  //   }

  //   try {
  //     const blob = new Blob([JSON.stringify(audio)], {
  //       type: 'application/json',
  //     });

  //     const form = new FormData();
  //     form.append('media', newRecording, `${audioId}-media.webm`);
  //     form.append('existingAudio', blob);

  //     const { data } = await axios.post(
  //       `${baseurl}/edit/${currentProject._id}`,
  //       form,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     setNewMemento(pIndex, wIndex, newWord, editId);
  //     setAudioMemento([...audioMemento, data]);

  //     return new Promise((resolve) => resolve());
  //   } catch (e) {
  //     return new Promise((resolve, reject) => reject(e));
  //   }
  // }

  // async function editAudioWithExisting(
  //   pIndex,
  //   wIndex,
  //   newWord,
  //   start,
  //   end,
  //   duration
  // ) {
  //   const {
  //     files: { media },
  //   } = currentProject;
  //   let options = [];
  //   let useEdited = false;
  //   let editedId = null;
  //   let audio = null;

  //   const editId = uuidv4();

  //   memento.forEach((x) => {
  //     if (x.editId && audioMemento.length) {
  //       editedId = x.editId;
  //       useEdited = true;
  //     }
  //   });

  //   transcription.forEach((ts) => {
  //     ts.words.forEach((word) => {
  //       if (word.word.toLowerCase() === newWord.toLowerCase()) {
  //         options.push(word);
  //       }
  //     });
  //   });

  //   if (useEdited) {
  //     [audio] = audioMemento.filter((x) => x.id.includes(`${editedId}`));
  //   } else {
  //     [audio] = media.filter((x) => x.type.includes('audio'));
  //   }

  //   if (options.length) {
  //     ////we use the first option only
  //     audio.originator = options[0];
  //     audio.start = start;
  //     audio.end = end;
  //     audio.duration = duration;
  //     audio.projectName = currentProject.projectName;
  //     audio.editId = editId;
  //   }

  //   try {
  //     if (options.length) {
  //       toast.warn('Found existing word, using existing audio...', {
  //         autoClose: 2000,
  //       });

  //       const { data } = await axios.post(
  //         `${baseurl}/edit/${currentProject._id}/existing`,
  //         { audio },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       setNewMemento(pIndex, wIndex, newWord, editId);
  //       setAudioMemento([...audioMemento, data]);
  //       return new Promise((resolve) => resolve());
  //     }

  //     return new Promise((resolve, reject) =>
  //       reject('Found no existing word.')
  //     );
  //   } catch (e) {
  //     return new Promise((resolve, reject) => reject(e));
  //   }
  // }

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
    newRecording = null,
    baseWord
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
    let duration = null;
    console.log('position:', position);
    const tempMemento = JSON.parse(JSON.stringify(memento));

    const insert = (arr, index, newItem) => [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index),
    ];
    if (newRecording) {
      duration = await getBlobDuration(newRecording);
      duration = parseFloat(duration);
    }
    wordObject.word = newWord;
    wordObject.startTime = {
      seconds: 0,
      nanos: 0,
    };
    wordObject.endTime = {
      seconds: 0,
      nanos: 0,
    };

    transcription.forEach((ts) => {
      ts.words.forEach((word) => {
        if (word.word.toLowerCase() === newWord.toLowerCase()) {
          options.push(word);
        }
      });
    });

    const parsedtime = (memento) => {
      const start = parseFloat(
        `${(memento.startTime.seconds && memento.startTime.seconds) || '00'}.${
          memento.startTime.nanos && memento.startTime.nanos / 100000
        }`
      );
      const end = parseFloat(
        `${(memento.endTime.seconds && memento.endTime.seconds) || '00'}.${
          memento.endTime.nanos && memento.endTime.nanos / 100000
        }`
      );

      return { start, end };
    };

    const parsedTime = parsedtime(tempMemento[pIndex].words[wIndex]);

    if (newRecording == null) {
      const parsedTimeOriginator = parsedtime(options[0]);
      duration = parsedTimeOriginator.end - parsedTimeOriginator.start;
    }
    const addedStart = parsedTime.start + duration;
    const addedEnd = parsedTime.end + duration;
    console.log(addedStart, addedEnd);
    const start = {
      seconds: addedStart.toString().split('.')[0],
      nanos:
        addedStart.toString().split('.')[1] &&
        parseInt(addedStart.toString().split('.')[1].padEnd(9, '0')),
    };
    const end = {
      seconds: addedEnd.toString().split('.')[0],
      nanos:
        addedEnd.toString().split('.')[1] &&
        parseInt(addedEnd.toString().split('.')[1].padEnd(9, '0')),
    };
    if (position === 'left') {
      wordObject.startTime = tempMemento[pIndex].words[wIndex].startTime;
      wordObject.endTime = start;
      const result = insert(tempMemento[pIndex].words, wIndex, wordObject);

      tempMemento[pIndex].words = result;
    } else if (position === 'right') {
      wordObject.startTime = tempMemento[pIndex].words[wIndex].endTime;
      wordObject.endTime = end;
      const result = insert(tempMemento[pIndex].words, wIndex + 1, wordObject);
      tempMemento[pIndex].words = result;
    }
    tempMemento[pIndex].editId = editId;

    memento.forEach((x) => {
      if (x.editId && audioMemento.length) {
        editedId = x.editId;
        useEdited = true;
      }
    });

    if (useEdited) {
      [audio] = JSON.parse(
        JSON.stringify(audioMemento.filter((x) => x.id.includes(`${editedId}`)))
      );
    } else {
      [audio] = JSON.parse(
        JSON.stringify(media.filter((x) => x.type.includes('audio')))
      );
    }

    if (!options.length && newRecording == null)
      return new Promise((res, reject) => reject('No existing word found.'));

    if (options.length) {
      ////we use the first option only
      audio.originator = options[0];
    }
    audio.editId = editId;
    audio.baseWord = baseWord;
    audio.position = position;
    audio.projectName = currentProject.projectName;

    try {
      if (options.length === false && newRecording == null)
        return new Promise((resolve, reject) =>
          reject('No Existing word found and no Audio Recording provided.')
        );

      console.log('config:', audio);
      const blob = new Blob([JSON.stringify(audio)], {
        type: 'application/json',
      });

      const form = new FormData();
      if (newRecording) {
        form.append('media', newRecording, `${editId}-media.webm`);
      }
      form.append('existingAudio', blob);

      const { data } = await axios.post(
        `${baseurl}/edit/${currentProject._id}/add`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewMementoAddWord(tempMemento);
      setAudioMemento([...audioMemento, data]);
      return new Promise((resolve) => resolve());
    } catch {
      return new Promise((resolve, reject) => reject());
    }
  }

  async function deleteAudioAndText(pIndex, wIndex) {
    const tempMemento = JSON.parse(JSON.stringify(memento));

    const {
      files: { media },
    } = currentProject;
    let editedId = null;
    let audio = null;
    let useEdited = false;
    const editId = uuidv4();

    memento.forEach((x) => {
      if (x.editId && audioMemento.length) {
        editedId = x.editId;
        useEdited = true;
      }
    });
    if (useEdited) {
      [audio] = JSON.parse(
        JSON.stringify(audioMemento.filter((x) => x.id.includes(`${editedId}`)))
      );
    } else {
      [audio] = JSON.parse(
        JSON.stringify(media.filter((x) => x.type.includes('audio')))
      );
    }

    audio.projectName = currentProject.projectName;
    audio.editId = editId;
    audio.word = tempMemento[pIndex].words[wIndex];

    try {
      const { data } = await axios.post(
        `${baseurl}/edit/${currentProject._id}/delete`,
        { audio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      tempMemento[pIndex].editId = editId;
      tempMemento[pIndex].words.splice(wIndex, 1);

      setNewMementoAddWord(tempMemento);
      setAudioMemento([...audioMemento, data]);
      return new Promise((resolve) => resolve());
    } catch (e) {
      console.log(e);
      return new Promise((res, reject) => reject(e));
    }
  }

  return {
    deleteAudioAndText,
    flushEdits,
    saveAudio,
    addNewWord,
  };
};
export default useEdit;
