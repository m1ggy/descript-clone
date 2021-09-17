import React, { useState, useEffect, useCallback } from 'react';
import ws from 'wavesurfer.js';
import { Button, Spinner } from 'react-bootstrap';
import TranscriptionWord from './TranscriptionWord';
import './wavesurfer.css';
function WaveSurfer({ link, parsedJson, destroy }) {
  const [waveSurfer, setWaveSurfer] = useState(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  const startTimeFloat = useCallback((word) => {
    return parseFloat(
      `${(word.startTime.seconds && word.startTime.seconds) || 0}.${
        (word.startTime.nanos && word.startTime.nanos / 100000000) || 0
      }`
    );
  }, []);
  const endTimeFloat = useCallback((word) => {
    return parseFloat(
      `${(word.endTime.seconds && word.endTime.seconds) || 0}.${
        (word.endTime.nanos && word.endTime.nanos / 100000000) || 0
      }`
    );
  }, []);

  ///wave surfer
  useEffect(() => {
    setWaveSurfer(
      ws.create({
        container: '#waveform',
        fillParent: true,
        backgroundColor: 'white',
        cursorColor: 'black',
        hideScrollbar: true,
        barHeight: 3,
        barWidth: 2,
        normalize: true,
        barGap: 1,
        progressColor: '#040a45',
        waveColor: 'gray',
      })
    );
  }, []);

  useEffect(() => {
    if (destroy && waveSurfer) {
      waveSurfer.destroy();
      setPlayerReady(false);
    }
  }, [destroy, waveSurfer]);

  useEffect(() => {
    if (waveSurfer && link) {
      const [data] = link.filter((x) => x.type.includes('audio'));
      console.log(data.url);
      waveSurfer.load(data.url);

      waveSurfer.on('ready', () => {
        setPlayerReady(true);
      });

      waveSurfer.on('audioprocess', (progress) => {
        setPlaybackTime(progress);
      });
      waveSurfer.on('seek', (progress) => {
        console.log(progress);
        setPlaybackTime(waveSurfer.getDuration() * progress);
      });
    }
  }, [waveSurfer, link]);

  const getMinutes = (time) => {
    return Math.floor(time / 60);
  };
  const getSeconds = (time) => {
    return time > 60 ? (time % 60).toFixed(2) : time.toFixed(2);
  };

  return (
    <>
      {waveSurfer && playerReady ? (
        <div style={{ display: 'inline-flex' }}>
          <Button
            variant='outline-success'
            onClick={() => waveSurfer.play()}
            size='sm'
            className='wavesurfer-button'
          >
            Play
          </Button>
          <Button
            variant='outline-warning'
            onClick={() => waveSurfer.pause()}
            size='sm'
            className='wavesurfer-button'
          >
            Pause
          </Button>
          <Button
            variant='outline-danger'
            onClick={() => waveSurfer.stop()}
            size='sm'
            className='wavesurfer-button'
          >
            Stop
          </Button>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '25px',
              flexDirection: 'column',
            }}
            className='border'
          >
            <pre style={{ margin: 0 }}>Playback/Duration</pre>

            <pre style={{ margin: 0 }}>
              {getMinutes(playbackTime)}:{getSeconds(playbackTime)}s/
              {waveSurfer && getMinutes(waveSurfer.getDuration())}:
              {waveSurfer && getSeconds(waveSurfer.getDuration())}s
            </pre>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <pre>Loading player ...</pre>{' '}
          <div>
            <Spinner animation='border' size='sm' />
          </div>
        </div>
      )}
      <div id='waveform'></div>
      {parsedJson &&
        waveSurfer &&
        parsedJson.map((x, i) => {
          return (
            <React.Fragment key={i}>
              <div style={{ height: '25px' }} />
              {x.words.map((word, i) => {
                return (
                  <TranscriptionWord
                    word={word}
                    key={i}
                    progress={
                      playbackTime >= startTimeFloat(word) &&
                      playbackTime <= endTimeFloat(word)
                        ? true
                        : null
                    }
                    waveSurfer={waveSurfer}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
    </>
  );
}

export default React.memo(WaveSurfer);
