import { useState } from 'react';

const useEdit = (audioContext, transcriptionArray) => {
  const [transcription, setTranscription] = useState(transcriptionArray);
  function editText() {}

  function editAudioAndText(indexParagraph, indexWord, newWord) {}

  function deleteAudioAndText() {}
  function muteAudio() {}

  return {
    editAudioAndText,
    editText,
    deleteAudioAndText,
    muteAudio,
  };
};

export default useEdit;
