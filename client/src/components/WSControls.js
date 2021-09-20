import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  IoPlayOutline,
  IoPauseOutline,
  IoStopOutline,
  IoVolumeMuteOutline,
  IoVolumeLowOutline,
  IoVolumeMediumOutline,
  IoVolumeHighOutline,
} from 'react-icons/io5';
import './wscontrols.css';
function WSControls({ waveSurfer, isPlaying, children }) {
  const [volume, setVolume] = useState(100);

  return (
    <div
      style={{
        display: 'inline-flex',
        justifyContent: 'center',
        marginBottom: 10,
      }}
    >
      {children}
      {isPlaying ? (
        <Button
          variant='outline-warning'
          onClick={() => waveSurfer.pause()}
          size='sm'
          className='wavesurfer-button'
          style={{ marginLeft: '25px' }}
        >
          Pause <IoPauseOutline size='2em' />
        </Button>
      ) : (
        <Button
          variant='outline-success'
          onClick={() => waveSurfer.play()}
          size='sm'
          className='wavesurfer-button'
          style={{ marginLeft: '25px' }}
        >
          Play <IoPlayOutline size='2em' />
        </Button>
      )}
      <Button
        variant='outline-danger'
        onClick={() => waveSurfer.stop()}
        size='sm'
        className='wavesurfer-button'
      >
        Stop <IoStopOutline size='2em' />
      </Button>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '25px',
          flexDirection: 'column',
        }}
      >
        <pre style={{ margin: 0 }}>
          Volume{' '}
          {volume === 0 ? (
            <IoVolumeMuteOutline />
          ) : volume > 0 && volume < 33 ? (
            <IoVolumeLowOutline />
          ) : volume >= 33 && volume <= 67 ? (
            <IoVolumeMediumOutline />
          ) : (
            <IoVolumeHighOutline />
          )}
        </pre>
        <input
          type='range'
          max={100}
          min={0}
          value={volume}
          onChange={(e) => {
            setVolume(parseInt(e.target.value));
            waveSurfer.setVolume((parseInt(e.target.value) * 1) / 100);
          }}
          className='volume'
        />
      </div>
    </div>
  );
}

export default WSControls;
