import { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import useRecorder from '../hooks/useRecorder';
import CountDown from './CountDown';
import TimeElapsed from './TimeElapsed';

let delay = 3;
function AddNewWord({
  useExisting,
  setUseExisting,
  newWord,
  setNewWord,
  setRecordingStarting,
  handleAddNewWord,
}) {
  const {
    stopRecording,
    startAudioRecording,
    resetRecorder,
    recordingActive,
    url,
    currentBlob,
  } = useRecorder();

  const [position, setPosition] = useState('');
  const [recordNew, setRecordNew] = useState(false);

  const [startCountdown, setStartCountdown] = useState();
  const [recordingFinished, setRecordingFinished] = useState(false);

  const preview = useRef(null);

  useEffect(() => {
    if (preview.current && url) preview.current.src = url;
  });

  useEffect(() => {
    console.log(position);
  }, [position]);

  function limitRecording() {
    setRecordingStarting(true);
    resetRecorder();
    startAudioRecording(3000, setRecordingFinished, setStartCountdown);
  }

  return (
    <Form
      onSubmit={(e) => {
        handleAddNewWord(e, currentBlob);
      }}
    >
      <Form.Group>
        <Form.Label>New Word</Form.Label>
        <Form.Control
          type='text'
          required
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
        />
      </Form.Group>
      {!useExisting && (
        <Form.Group>
          <Form.Label>Record new Audio?</Form.Label>
          <Form.Check
            inline
            value={recordNew}
            onChange={(e) => setRecordNew(e.target.checked)}
          />
        </Form.Group>
      )}
      {!recordNew && (
        <Form.Group>
          <Form.Label>If word already exist, use that audio</Form.Label>
          <Form.Check
            inline
            value={useExisting}
            onChange={(e) => setUseExisting(e.target.checked)}
          />
        </Form.Group>
      )}
      <Form.Group>
        <Form.Label>Word Position</Form.Label>
        <Form.Check
          type='radio'
          name='position'
          label='Adjacent Left'
          value={position}
          onChange={() => setPosition('left')}
          required
        />

        <Form.Check
          type='radio'
          name='position'
          label='Adjacent Right'
          value={position}
          onChange={() => setPosition('right')}
        />
      </Form.Group>
      {recordNew && !useExisting && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginTop: '25px',
          }}
        >
          <Button
            variant='success'
            style={{ width: 'fit-content' }}
            disabled={recordingActive}
            size='sm'
            onClick={limitRecording}
          >
            Start Recording 🔴
          </Button>
          <Button
            variant='danger'
            size='sm'
            style={{ width: 'fit-content' }}
            disabled={!recordingActive}
            onClick={() => {
              stopRecording();
            }}
          >
            Stop Recording 🟥
          </Button>
        </div>
      )}

      {startCountdown && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '25px',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <p>Recording in:</p>

          <CountDown delay={delay} />
        </div>
      )}
      {recordingActive && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '25px',
            flexDirection: 'column',
            textAlign: 'center',
          }}
        >
          <h3>Recording now....</h3>

          <TimeElapsed start={new Date()} stop={recordingFinished} />
        </div>
      )}
      {url && <audio ref={preview} controls />}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '25px',
        }}
      >
        <Button
          type='submit'
          disabled={recordingActive || (recordNew && !recordingFinished)}
          variant='outline-success'
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}

export default AddNewWord;
