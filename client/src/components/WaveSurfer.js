import React, { useState, useEffect } from 'react';
import ws from 'wavesurfer.js';
import { Spinner } from 'react-bootstrap';

import './wavesurfer.css';
import WSControls from './WSControls';
import TranscriptionContainer from './TranscriptionContainer';

function WaveSurfer({ link, parsedJson, destroy }) {
  const [waveSurfer, setWaveSurfer] = useState(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
        progressColor: 'gray',
        waveColor: '#040a45',
        backend: 'MediaElement',
      })
    );
  }, []);

  useEffect(() => {
    if (destroy && waveSurfer) {
      delete waveSurfer.backend.buffer;
      waveSurfer.unAll();
      waveSurfer.destroy();
      setPlayerReady(false);
    }
  }, [destroy, waveSurfer]);

  useEffect(() => {
    if (waveSurfer && link) {
      const [data] = link.filter((x) => x.type.includes('audio'));

      data ? waveSurfer.load(data.url) : setPlayerReady(true);
    }
  }, [waveSurfer, link]);

  useEffect(() => {
    if (waveSurfer != null) {
      waveSurfer.on('ready', () => {
        setPlayerReady(true);
      });
      waveSurfer.on('play', () => {
        setIsPlaying(true);
      });
      waveSurfer.on('pause', () => {
        setIsPlaying(false);
      });

      waveSurfer.on('audioprocess', (progress) => {
        const shorterProgress = progress.toFixed(1);

        if (parseInt(shorterProgress) === parseInt(playbackTime.toFixed(1))) {
          return;
        } else {
          setPlaybackTime(progress);
        }
      });
      waveSurfer.on('seek', (progress) => {
        const shorterProgress = progress.toFixed(1);
        setPlaybackTime(waveSurfer.getDuration() * shorterProgress);
      });
    }
  }, [waveSurfer, playbackTime]);

  const getMinutes = (time) => {
    return Math.floor(time / 60);
  };
  const getSeconds = (time) => {
    return time > 60 ? (time % 60).toFixed(1) : time.toFixed(1);
  };

  return (
    <>
      {waveSurfer && playerReady ? (
        <WSControls waveSurfer={waveSurfer} isPlaying={isPlaying}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '25px',
              flexDirection: 'column',
            }}
          >
            <pre style={{ margin: 0 }}>Playback/Duration</pre>

            <pre style={{ margin: 0 }}>
              {getMinutes(playbackTime)}:{getSeconds(playbackTime)}s/
              {waveSurfer && getMinutes(waveSurfer.getDuration())}:
              {waveSurfer && getSeconds(waveSurfer.getDuration())}s
            </pre>
          </div>
        </WSControls>
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

      <TranscriptionContainer
        parsedJson={parsedJson}
        playbackTime={playbackTime}
        waveSurfer={waveSurfer}
      />
    </>
  );
}

export default React.memo(WaveSurfer);
