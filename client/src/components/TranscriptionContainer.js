import React, { useCallback } from 'react';
import TranscriptionWord from './TranscriptionWord';
// import useMemento from '../hooks/useMemento';
import useStore from '../store';
function TranscriptionContainer({
  playbackTime,
  setSelectedWord,
  setShow,
  rerender,
}) {
  const memento = useStore((state) => state.memento);

  const startTimeFloat = (word) => {
    return parseFloat(
      `${(word && word.startTime.seconds && word.startTime.seconds) || 0}.${
        (word && word.startTime.nanos && word.startTime.nanos / 100000000) || 0
      }`
    );
  };
  const endTimeFloat = (word) => {
    return parseFloat(
      `${(word && word.endTime.seconds && word.endTime.seconds) || 0}.${
        (word && word.endTime.nanos && word.endTime.nanos / 100000000) || 0
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
    memento &&
    memento.map((x, p) => {
      return (
        <div
          key={p}
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
                pIndex={p}
                wIndex={i}
                rerender={rerender}
              />
            );
          })}
        </div>
      );
    })
  );
}

export default TranscriptionContainer;
