import React, { useCallback } from 'react';
import TranscriptionWord from './TranscriptionWord';
function TranscriptionContainer({
  parsedJson,
  waveSurfer,
  playbackTime,
  setSelectedWord,
  setShow,
}) {
  const startTimeFloat = (word) => {
    return parseFloat(
      `${(word.startTime.seconds && word.startTime.seconds) || 0}.${
        (word.startTime.nanos && word.startTime.nanos / 100000000) || 0
      }`
    );
  };
  const endTimeFloat = (word) => {
    return parseFloat(
      `${(word.endTime.seconds && word.endTime.seconds) || 0}.${
        (word.endTime.nanos && word.endTime.nanos / 100000000) || 0
      }`
    );
  };

  const wordActive = useCallback(
    function checkActiveWord(word) {
      return playbackTime >= startTimeFloat(word) &&
        playbackTime <= endTimeFloat(word)
        ? true
        : null;
    },
    [playbackTime]
  );

  return (
    parsedJson &&
    parsedJson.map((x, i) => {
      return (
        <div
          key={i}
          className='border'
          style={{
            padding: 0,
          }}
        >
          <div style={{ height: '25px' }} />
          {x.words.map((word, i) => {
            return (
              <TranscriptionWord
                word={word}
                key={i}
                progress={wordActive}
                className='ts-word'
                select={setSelectedWord}
                setShow={setShow}
              />
            );
          })}
        </div>
      );
    })
  );
}

export default TranscriptionContainer;
