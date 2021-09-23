import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import TimeElapsed from './TimeElapsed';
import CountDown from './CountDown';
import useRecorder from '../hooks/useRecorder';

let delay = 3;
function EditAudioAndText({
  handleEditAudioText,
  newWord,
  setNewWord,
  useExisting,
  setUseExisting,
}) {
  const {
    stopRecording,
    startAudioRecording,
    resetRecorder,
    recordingActive,
    url,
    currentBlob,
  } = useRecorder();

  const [recordNew, setRecordNew] = useState(false);
  const [startCountdown, setStartCountdown] = useState();
  const [recordingFinished, setRecordingFinished] = useState(false);

  const preview = useRef(null);

  useEffect(() => {
    if (preview.current && url) preview.current.src = url;
  });

  function limitRecording() {
    // const startTime = parseFloat(
    //   `${word.startTime.seconds && word.startTime.seconds}.${
    //     word.startTime.nanos && word.startTime.nanos
    //   }`
    // );
    // const endTime = parseFloat(
    //   `${word.endTime.seconds && word.endTime.seconds}.${
    //     word.endTime.nanos && word.endTime.nanos
    //   }`
    // );

    // const duration = endTime - startTime;

    resetRecorder();
    startAudioRecording(3000, setRecordingFinished, setStartCountdown);
  }

  return (
    <>
      <Form onSubmit={(e) => handleEditAudioText(e, currentBlob)}>
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
        {recordNew && !useExisting && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
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
    </>
  );
}

export default EditAudioAndText;
